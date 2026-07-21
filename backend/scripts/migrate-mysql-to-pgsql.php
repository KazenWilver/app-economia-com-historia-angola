<?php

/**
 * One-shot: copia dados MySQL → Postgres (Supabase).
 * Uso: php scripts/migrate-mysql-to-pgsql.php
 */

declare(strict_types=1);

$mysqlDsn = getenv('MYSQL_DSN') ?: 'mysql:host=mysql;port=3306;dbname=jindungo;charset=utf8mb4';
$mysqlUser = getenv('MYSQL_USER') ?: 'jindungo';
$mysqlPass = getenv('MYSQL_PASSWORD') ?: 'jindungo';

$pgsqlDsn = getenv('PGSQL_DSN') ?: '';
$pgsqlUser = getenv('PGSQL_USER') ?: '';
$pgsqlPass = getenv('PGSQL_PASSWORD') ?: '';

if ($pgsqlDsn === '' || $pgsqlUser === '' || $pgsqlPass === '') {
    fwrite(STDERR, "Defina PGSQL_DSN, PGSQL_USER e PGSQL_PASSWORD.\n");
    exit(1);
}

$skip = [
    'migrations',
    'cache',
    'cache_locks',
    'jobs',
    'job_batches',
    'failed_jobs',
    'sessions',
];

// Ordem que respeita FKs (pais antes dos filhos)
$ordered = [
    'categories',
    'forums',
    'provinces',
    'users',
    'password_reset_tokens',
    'personal_access_tokens',
    'contents',
    'comments',
    'topics',
    'replies',
    'quizzes',
    'questions',
    'answers',
    'quiz_attempts',
    'quiz_attempt_answers',
    'map_narratives',
    'recommendations',
    'learning_paths',
    'learning_path_steps',
    'learning_step_completions',
    'tutor_exchanges',
    'jindungo_access_requests',
];

$mysql = new PDO($mysqlDsn, $mysqlUser, $mysqlPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$pgsql = new PDO($pgsqlDsn, $pgsqlUser, $pgsqlPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$available = $mysql->query(
    "SELECT table_name FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'"
)->fetchAll(PDO::FETCH_COLUMN);

$tables = [];
foreach ($ordered as $table) {
    if (in_array($table, $available, true) && ! in_array($table, $skip, true)) {
        $tables[] = $table;
    }
}
foreach ($available as $table) {
    if (! in_array($table, $skip, true) && ! in_array($table, $tables, true)) {
        $tables[] = $table;
    }
}

// Limpar filhos → pais via CASCADE a partir das folhas
$truncateList = array_reverse($tables);
$quoted = implode(', ', array_map(static fn ($t) => '"'.$t.'"', $truncateList));
if ($quoted !== '') {
    $pgsql->exec("TRUNCATE TABLE {$quoted} RESTART IDENTITY CASCADE");
    echo "truncate ok\n";
}

foreach ($tables as $table) {
    $exists = $pgsql->query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ".$pgsql->quote($table)
    )->fetchColumn();

    if (! $exists) {
        echo "missing table {$table} no Postgres — corre migrate primeiro\n";
        continue;
    }

    $rows = $mysql->query("SELECT * FROM `{$table}`")->fetchAll();
    if ($rows === []) {
        echo "empty {$table}\n";
        continue;
    }

    $columns = array_keys($rows[0]);
    $colList = implode(', ', array_map(static fn ($c) => '"'.$c.'"', $columns));
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $sql = "INSERT INTO \"{$table}\" ({$colList}) VALUES ({$placeholders})";
    $stmt = $pgsql->prepare($sql);

    $count = 0;
    foreach ($rows as $row) {
        $values = [];
        foreach ($columns as $col) {
            $values[] = $row[$col];
        }
        $stmt->execute($values);
        $count++;
    }

    echo "ok {$table}: {$count} linhas\n";
}

foreach ($tables as $table) {
    $hasId = $pgsql->query(
        "SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = ".$pgsql->quote($table)." AND column_name = 'id'"
    )->fetchColumn();
    if (! $hasId) {
        continue;
    }
    $seq = $pgsql->query(
        "SELECT pg_get_serial_sequence('public.{$table}', 'id')"
    )->fetchColumn();
    if (! $seq) {
        continue;
    }
    $maxId = (int) $pgsql->query("SELECT COALESCE(MAX(id), 0) FROM \"{$table}\"")->fetchColumn();
    if ($maxId > 0) {
        $pgsql->exec("SELECT setval(".$pgsql->quote($seq).", {$maxId}, true)");
    } else {
        $pgsql->exec("SELECT setval(".$pgsql->quote($seq).", 1, false)");
    }
    echo "seq {$table} → {$maxId}\n";
}

echo "Migração de dados concluída.\n";
