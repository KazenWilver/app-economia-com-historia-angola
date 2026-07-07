<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_api_root_returns_successful_response(): void
    {
        $response = $this->getJson('/api/');

        $response->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('message', 'Jindungo API');
    }
}
