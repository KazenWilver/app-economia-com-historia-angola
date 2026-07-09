<?php

namespace Tests\Feature\Content;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContentMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_admin_can_upload_image_when_creating_content(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $file = UploadedFile::fake()->create('capa.jpg', 100, 'image/jpeg');

        $response = $this->post('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Conteúdo com Imagem',
            'type' => 'texto',
            'status' => 'published',
            'media' => $file,
        ]);

        $response->assertCreated()
            ->assertJsonPath('content.title', 'Conteúdo com Imagem');

        $mediaUrl = $response->json('content.media_url');
        $this->assertNotNull($mediaUrl);
        $this->assertStringContainsString('/storage/contents/texto/', $mediaUrl);

        Storage::disk('public')->assertExists('contents/texto/'.$file->hashName());
    }

    public function test_admin_can_upload_audio_when_creating_content(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $file = UploadedFile::fake()->create('podcast.mp3', 500, 'audio/mpeg');

        $response = $this->post('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Podcast Angola',
            'type' => 'podcast',
            'status' => 'published',
            'media' => $file,
        ]);

        $response->assertCreated()
            ->assertJsonPath('content.type', 'podcast');

        Storage::disk('public')->assertExists('contents/podcast/'.$file->hashName());
    }

    public function test_invalid_media_type_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $file = UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf');

        $response = $this->withHeaders(['Accept' => 'application/json'])->post('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Ficheiro Inválido',
            'type' => 'texto',
            'media' => $file,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['media']);
    }

    public function test_audio_content_rejects_video_file(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $file = UploadedFile::fake()->create('clip.mp4', 500, 'video/mp4');

        $response = $this->withHeaders(['Accept' => 'application/json'])->post('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Áudio com Vídeo',
            'type' => 'audio',
            'media' => $file,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['media']);
    }

    public function test_oversized_media_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $file = UploadedFile::fake()->create('video-grande.mp4', 102401, 'video/mp4');

        $response = $this->withHeaders(['Accept' => 'application/json'])->post('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Vídeo Demasiado Grande',
            'type' => 'video',
            'media' => $file,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['media']);
    }

    public function test_admin_can_replace_media_on_update(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $originalFile = UploadedFile::fake()->create('original.jpg', 100, 'image/jpeg');

        $createResponse = $this->post('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Conteúdo Actualizável',
            'type' => 'texto',
            'media' => $originalFile,
        ]);

        $contentId = $createResponse->json('content.id');
        $originalPath = 'contents/texto/'.$originalFile->hashName();

        $newFile = UploadedFile::fake()->create('novo.jpg', 100, 'image/jpeg');

        $response = $this->post("/api/contents/{$contentId}", [
            '_method' => 'PUT',
            'media' => $newFile,
        ]);

        $response->assertOk();
        Storage::disk('public')->assertMissing($originalPath);
        Storage::disk('public')->assertExists('contents/texto/'.$newFile->hashName());
    }

    public function test_media_file_deleted_when_content_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $file = UploadedFile::fake()->create('eliminar.jpg', 100, 'image/jpeg');

        $createResponse = $this->post('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Conteúdo a Eliminar',
            'type' => 'texto',
            'media' => $file,
        ]);

        $contentId = $createResponse->json('content.id');
        $path = 'contents/texto/'.$file->hashName();

        $response = $this->deleteJson("/api/contents/{$contentId}");

        $response->assertOk();
        Storage::disk('public')->assertMissing($path);
    }
}
