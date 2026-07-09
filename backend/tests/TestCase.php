<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! app()->environment('testing')) {
            return;
        }

        $connection = (string) config('database.default');
        $database = (string) config("database.connections.{$connection}.database");

        if ($connection === 'mysql' && $database === 'jindungo') {
            throw new RuntimeException(
                'Os testes não podem correr contra a base de dados de desenvolvimento (jindungo). '.
                'Usa scripts/test-backend.ps1 ou garante DB_CONNECTION=sqlite / DB_DATABASE=jindungo_testing.'
            );
        }
    }
}
