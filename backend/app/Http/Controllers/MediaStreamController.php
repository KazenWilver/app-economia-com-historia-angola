<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaStreamController extends Controller
{
    public function show(Request $request, string $path): BinaryFileResponse
    {
        $normalizedPath = str_replace(['..', '\\'], ['', '/'], $path);

        if (! str_starts_with($normalizedPath, 'contents/')) {
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
