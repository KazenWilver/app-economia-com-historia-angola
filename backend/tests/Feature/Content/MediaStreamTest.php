<?php

namespace Tests\Feature\Content;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaStreamTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_media_stream_returns_file_with_range_support(): void
    {
        $path = 'contents/video/sample-'.uniqid().'.mp4';
        Storage::disk('public')->put($path, str_repeat('a', 1024));

        try {
            $response = $this->get('/api/media/'.$path);

            $response->assertOk()
                ->assertHeader('Accept-Ranges', 'bytes');
        } finally {
            Storage::disk('public')->delete($path);
        }
    }

    public function test_media_stream_honours_range_requests(): void
    {
        $path = 'contents/audio/range-'.uniqid().'.mp3';
        Storage::disk('public')->put($path, str_repeat('b', 2048));

        try {
            $response = $this->withHeaders([
                'Range' => 'bytes=0-99',
            ])->get('/api/media/'.$path);

            $response->assertStatus(206)
                ->assertHeader('Content-Range');
        } finally {
            Storage::disk('public')->delete($path);
        }
    }

    public function test_media_stream_rejects_paths_outside_contents(): void
    {
        $response = $this->get('/api/media/users/avatar.jpg');

        $response->assertNotFound();
    }
}
