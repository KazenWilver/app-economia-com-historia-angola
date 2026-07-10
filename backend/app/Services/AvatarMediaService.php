<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AvatarMediaService
{
    private const DISK = 'public';

    private const DIRECTORY = 'avatars';

    public function store(UploadedFile $file): string
    {
        $path = $file->store(self::DIRECTORY, self::DISK);

        return Storage::disk(self::DISK)->url($path);
    }

    public function delete(?string $avatarUrl): void
    {
        $path = $this->resolvePath($avatarUrl);

        if ($path !== null && Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    public function isManagedAvatar(?string $avatarUrl): bool
    {
        $path = $this->resolvePath($avatarUrl);

        return $path !== null && str_starts_with($path, self::DIRECTORY.'/');
    }

    private function resolvePath(?string $avatarUrl): ?string
    {
        if ($avatarUrl === null || $avatarUrl === '') {
            return null;
        }

        if (str_contains($avatarUrl, '/storage/')) {
            return Str::after($avatarUrl, '/storage/');
        }

        if (str_contains($avatarUrl, '/api/media/')) {
            return Str::after($avatarUrl, '/api/media/');
        }

        return null;
    }
}
