<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Serve ficheiros públicos (contents/, avatars/).
 *
 * Em Docker/produção o nginx entrega /storage/ e /api/media/... directamente
 * a partir de storage/app/public — este controller fica como fallback
 * (testes PHPUnit e ambientes sem nginx).
 */
class MediaStreamController extends Controller
{
    public function show(Request $request, string $path): BinaryFileResponse
    {
        $normalizedPath = str_replace(['..', '\\'], ['', '/'], $path);

        $isAllowed = str_starts_with($normalizedPath, 'contents/')
            || str_starts_with($normalizedPath, 'avatars/');

        if (! $isAllowed) {
            abort(404);
        }

        if (! Storage::disk('public')->exists($normalizedPath)) {
            abort(404);
        }

        $fullPath = Storage::disk('public')->path($normalizedPath);

        return response()->file($fullPath, [
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
