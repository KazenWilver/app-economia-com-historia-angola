<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Após importar dados com IDs explícitos (MySQL → Postgres),
 * as sequences ficam desalinhadas e novos inserts falham com duplicate key.
 */
class SyncPostgresSequences extends Command
{
    protected $signature = 'db:sync-pgsql-sequences';

    protected $description = 'Alinha as sequences Postgres com o MAX(id) de cada tabela';

    public function handle(): int
    {
        if (DB::getDriverName() !== 'pgsql') {
            $this->info('Ignorado: a ligação actual não é Postgres.');

            return self::SUCCESS;
        }

        $tables = DB::select(
            "SELECT t.table_name
             FROM information_schema.tables t
             JOIN information_schema.columns c
               ON c.table_schema = t.table_schema
              AND c.table_name = t.table_name
             WHERE t.table_schema = 'public'
               AND t.table_type = 'BASE TABLE'
               AND c.column_name = 'id'
             ORDER BY t.table_name"
        );

        $synced = 0;

        foreach ($tables as $row) {
            $table = $row->table_name;

            try {
                $seq = DB::selectOne(
                    'SELECT pg_get_serial_sequence(?, ?) AS seq',
                    ["public.{$table}", 'id']
                )?->seq;

                if ($seq === null) {
                    continue;
                }

                $maxId = (int) DB::table($table)->max('id');

                if ($maxId > 0) {
                    DB::select('SELECT setval(?, ?, true)', [$seq, $maxId]);
                } else {
                    DB::select('SELECT setval(?, 1, false)', [$seq]);
                }

                $this->line("{$table}: sequence → {$maxId}");
                $synced++;
            } catch (Throwable $e) {
                $this->warn("{$table}: {$e->getMessage()}");
            }
        }

        $this->info("Sequences sincronizadas: {$synced}");

        return self::SUCCESS;
    }
}
