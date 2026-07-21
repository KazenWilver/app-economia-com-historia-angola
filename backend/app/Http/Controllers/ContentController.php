<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContentRequest;
use App\Http\Requests\UpdateContentRequest;
use App\Http\Resources\ContentListResource;
use App\Http\Resources\ContentResource;
use App\Models\Content;
use App\Services\ContentMediaService;
use App\Services\JindungoAccessService;
use App\Services\LearningPathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    private const CACHE_TTL_SECONDS = 60;

    public function __construct(
        private readonly ContentMediaService $contentMediaService,
        private readonly LearningPathService $learningPathService,
        private readonly JindungoAccessService $jindungoAccessService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection|JsonResponse
    {
        $request->validate([
            'type' => ['nullable', Rule::in(['texto', 'audio', 'video', 'podcast', 'jindungo'])],
        ]);

        $user = $request->user('sanctum');
        $wantsJindungo = $request->string('type')->toString() === 'jindungo';

        if ($wantsJindungo && $user === null) {
            return response()->json([
                'message' => 'Autenticação necessária para aceder a conteúdos Jindungo.',
            ], 401);
        }

        if ($wantsJindungo && $user !== null && ! $this->jindungoAccessService->hasAccess($user)) {
            return response()->json([
                'message' => 'Precisas de um pedido de acesso aprovado para ver a biblioteca Jindungo.',
                'code' => 'jindungo_access_required',
            ], 403);
        }

        $userId = $user?->id ?? 'guest';
        $hasJindungoAccess = $user !== null && $this->jindungoAccessService->hasAccess($user);
        $type = $request->string('type')->toString() ?: 'all';
        $cacheVersion = (int) Cache::get('contents:version', 1);
        $cacheKey = "contents:index:v{$cacheVersion}:{$userId}:{$type}:j".($hasJindungoAccess ? '1' : '0');

        $contents = Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($request, $user, $hasJindungoAccess) {
            return Content::query()
                ->select([
                    'id',
                    'title',
                    'slug',
                    'body',
                    'type',
                    'media_url',
                    'is_exclusive',
                    'published_at',
                    'category_id',
                ])
                ->with(['category:id,name,slug'])
                ->where('status', 'published')
                ->when(
                    $user === null,
                    fn ($query) => $query
                        ->where('is_exclusive', false)
                        ->where('type', '!=', 'jindungo')
                )
                ->when(
                    $user !== null && ! $hasJindungoAccess,
                    fn ($query) => $query->where('type', '!=', 'jindungo')
                )
                ->when(
                    $request->filled('type'),
                    fn ($query) => $query->where('type', $request->string('type')->toString())
                )
                ->latest('published_at')
                ->get();
        });

        return ContentListResource::collection($contents)
            ->response()
            ->withHeaders($this->cacheHeaders($user !== null));
    }

    /**
     * Listagem completa para o painel admin (todos os estados).
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'type' => ['nullable', Rule::in(['texto', 'audio', 'video', 'podcast', 'jindungo'])],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
        ]);

        $contents = Content::query()
            ->with(['category:id,name,slug', 'author:id,name,email'])
            ->when(
                $request->filled('type'),
                fn ($query) => $query->where('type', $request->string('type')->toString())
            )
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')->toString())
            )
            ->latest('updated_at')
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

        $user = $request->user('sanctum');

        if ($this->requiresAuthentication($content) && $user === null) {
            return response()->json([
                'message' => 'Autenticação necessária para aceder a este conteúdo.',
            ], 401);
        }

        if ($this->requiresJindungoAccess($content) && ($user === null || ! $this->jindungoAccessService->hasAccess($user))) {
            return response()->json([
                'message' => 'Precisas de um pedido de acesso aprovado para abrir este texto Jindungo.',
                'code' => 'jindungo_access_required',
            ], 403);
        }

        $content->load(['category', 'author']);

        if ($user !== null) {
            $this->learningPathService->completeContentSteps($user, $content);
        }

        return (new ContentResource($content))
            ->response()
            ->withHeaders($this->cacheHeaders($user !== null));
    }

    public function store(StoreContentRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['slug', 'media']);
        $slug = $this->generateUniqueSlug(
            $request->string('title')->toString(),
            $request->input('slug')
        );

        if ($request->hasFile('media')) {
            $data['media_url'] = $this->contentMediaService->store(
                $request->file('media'),
                $request->string('type')->toString()
            );
        }

        $content = Content::query()->create([
            ...$data,
            'slug' => $slug,
            'author_id' => $request->user()->id,
            'published_at' => $data['published_at'] ?? (
                ($data['status'] ?? 'draft') === 'published' ? now() : null
            ),
        ]);

        $content->load(['category', 'author']);

        $this->bustContentsCache();

        return response()->json([
            'message' => 'Conteúdo criado com sucesso.',
            'content' => new ContentResource($content),
        ], 201);
    }

    public function update(UpdateContentRequest $request, Content $content): JsonResponse
    {
        $data = $request->safe()->except(['slug', 'media']);

        if ($request->hasFile('media')) {
            $this->contentMediaService->delete($content->media_url);

            $type = $request->filled('type')
                ? $request->string('type')->toString()
                : $content->type;

            $data['media_url'] = $this->contentMediaService->store(
                $request->file('media'),
                $type
            );
        }

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

        $this->bustContentsCache();

        return response()->json([
            'message' => 'Conteúdo actualizado com sucesso.',
            'content' => new ContentResource($content),
        ]);
    }

    public function destroy(Content $content): JsonResponse
    {
        $this->contentMediaService->delete($content->media_url);

        $content->delete();

        $this->bustContentsCache();

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

    private function requiresAuthentication(Content $content): bool
    {
        return $content->is_exclusive || $content->type === 'jindungo';
    }

    private function requiresJindungoAccess(Content $content): bool
    {
        return $content->type === 'jindungo';
    }

    /**
     * @return array<string, string>
     */
    private function cacheHeaders(bool $isAuthenticated): array
    {
        // Sem cache HTTP agressivo: a UI faz live refresh sem F5.
        if ($isAuthenticated) {
            return [
                'Cache-Control' => 'private, no-store, must-revalidate',
                'Vary' => 'Authorization',
            ];
        }

        return [
            'Cache-Control' => 'public, max-age=0, must-revalidate',
        ];
    }

    private function bustContentsCache(): void
    {
        $version = (int) Cache::get('contents:version', 1);
        Cache::forever('contents:version', $version + 1);
    }
}
