<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Http\Resources\ForumResource;
use App\Http\Resources\TopicResource;
use App\Models\Forum;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TopicController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $topics = Topic::query()
            ->where('is_visible', true)
            ->where('is_private', false)
            ->with(['forum:id,name,slug'])
            ->withCount('replies')
            ->latest('updated_at')
            ->get();

        return TopicResource::collection($topics);
    }

    public function adminIndex(): AnonymousResourceCollection
    {
        $topics = Topic::query()
            ->with(['forum:id,name,slug', 'user:id,name,email'])
            ->withCount('replies')
            ->latest('updated_at')
            ->get();

        return TopicResource::collection($topics);
    }

    public function adminShow(Topic $topic): TopicResource
    {
        $topic->load(['forum', 'user']);

        return new TopicResource($topic);
    }

    public function forumsIndex(): AnonymousResourceCollection
    {
        $forums = Forum::query()
            ->withCount('topics')
            ->orderBy('name')
            ->get();

        return ForumResource::collection($forums);
    }

    public function store(StoreTopicRequest $request): JsonResponse
    {
        $data = $request->validated();

        $topic = Topic::query()->create([
            ...$data,
            'user_id' => $request->user()->id,
            'is_private' => $data['is_private'] ?? false,
            'is_visible' => $data['is_visible'] ?? true,
        ]);

        $topic->load(['forum', 'user']);

        return response()->json([
            'message' => 'Tópico criado com sucesso.',
            'topic' => new TopicResource($topic),
        ], 201);
    }

    public function update(UpdateTopicRequest $request, Topic $topic): JsonResponse
    {
        $topic->update($request->validated());
        $topic->load(['forum', 'user']);

        return response()->json([
            'message' => 'Tópico actualizado com sucesso.',
            'topic' => new TopicResource($topic),
        ]);
    }

    public function destroy(Topic $topic): JsonResponse
    {
        $topic->delete();

        return response()->json([
            'message' => 'Tópico eliminado com sucesso.',
        ]);
    }
}
