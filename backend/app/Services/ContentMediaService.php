<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContentMediaService
{
    private const DISK = 'public';

    public function store(UploadedFile $file, string $type): string
    {
        $path = $file->store('contents/'.$type, self::DISK);

        return Storage::disk(self::DISK)->url($path);
    }

    public function delete(?string $mediaUrl): void
    {
        $path = $this->resolvePath($mediaUrl);

        if ($path !== null && Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    private function resolvePath(?string $mediaUrl): ?string
    {
        if ($mediaUrl === null || $mediaUrl === '') {
            return null;
        }

        if (str_contains($mediaUrl, '/storage/')) {
            return Str::after($mediaUrl, '/storage/');
        }

        return null;
    }
}
