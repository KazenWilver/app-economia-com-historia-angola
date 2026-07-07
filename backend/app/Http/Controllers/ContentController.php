<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContentRequest;
use App\Http\Requests\UpdateContentRequest;
use App\Http\Resources\ContentResource;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'type' => ['nullable', Rule::in(['texto', 'audio', 'video', 'podcast', 'jindungo'])],
        ]);

        $contents = Content::query()
            ->with(['category', 'author'])
            ->where('status', 'published')
            ->when(
                $request->filled('type'),
                fn ($query) => $query->where('type', $request->string('type')->toString())
            )
            ->latest('published_at')
            ->get();

        return ContentResource::collection($contents);
    }

    public function show(Request $request, Content $content): ContentResource|JsonResponse
    {
        if ($content->status !== 'published' && $request->user('sanctum')?->role !== 'admin') {
            return response()->json([
                'message' => 'Conteúdo não encontrado.',
            ], 404);
        }

        $content->load(['category', 'author']);

        return new ContentResource($content);
    }

    public function store(StoreContentRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['slug']);
        $slug = $this->generateUniqueSlug(
            $request->string('title')->toString(),
            $request->input('slug')
        );

        $content = Content::query()->create([
            ...$data,
            'slug' => $slug,
            'author_id' => $request->user()->id,
            'published_at' => $data['published_at'] ?? (
                ($data['status'] ?? 'draft') === 'published' ? now() : null
            ),
        ]);

        $content->load(['category', 'author']);

        return response()->json([
            'message' => 'Conteúdo criado com sucesso.',
            'content' => new ContentResource($content),
        ], 201);
    }

    public function update(UpdateContentRequest $request, Content $content): JsonResponse
    {
        $data = $request->safe()->except(['slug']);

        if ($request->has('slug')) {
            $data['slug'] = $this->generateUniqueSlug(
                $request->string('title')->toString() ?: $content->title,
                $request->input('slug'),
                $content->id
            );
        }

        if (
            isset($data['status'])
            && $data['status'] === 'published'
            && $content->published_at === null
            && ! array_key_exists('published_at', $data)
        ) {
            $data['published_at'] = now();
        }

        $content->update($data);
        $content->load(['category', 'author']);

        return response()->json([
            'message' => 'Conteúdo actualizado com sucesso.',
            'content' => new ContentResource($content),
        ]);
    }

    public function destroy(Content $content): JsonResponse
    {
        $content->delete();

        return response()->json([
            'message' => 'Conteúdo eliminado com sucesso.',
        ]);
    }

    private function generateUniqueSlug(string $title, ?string $slug = null, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($slug ?: $title);
        $candidate = $baseSlug;
        $suffix = 1;

        while (
            Content::query()
                ->where('slug', $candidate)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
