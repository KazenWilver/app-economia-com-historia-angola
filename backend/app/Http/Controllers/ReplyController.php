<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReplyRequest;
use App\Http\Resources\ReplyResource;
use App\Models\Reply;
use App\Models\Topic;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ReplyController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Topic $topic): AnonymousResourceCollection|JsonResponse
    {
        if (! Gate::forUser($request->user('sanctum'))->allows('view', $topic)) {
            return response()->json([
                'message' => 'Tópico não encontrado.',
            ], 404);
        }

        $replies = Reply::treeForTopic($topic->id);

        return ReplyResource::collection($replies);
    }

    public function store(StoreReplyRequest $request, Topic $topic): JsonResponse
    {
        $parentId = $request->input('parent_id');

        if ($parentId !== null) {
            $parent = Reply::query()->find($parentId);

            if ($parent === null || $parent->topic_id !== $topic->id) {
                return response()->json([
                    'message' => 'A resposta pai não pertence a este tópico.',
                    'errors' => [
                        'parent_id' => ['A resposta pai não pertence a este tópico.'],
                    ],
                ], 422);
            }
        }

        $reply = Reply::query()->create([
            'topic_id' => $topic->id,
            'user_id' => $request->user()->id,
            'parent_id' => $parentId,
            'body' => $request->string('body')->toString(),
        ]);

        $reply->load('user');

        return response()->json([
            'message' => 'Resposta publicada com sucesso.',
            'reply' => new ReplyResource($reply),
        ], 201);
    }

    public function destroy(Request $request, Topic $topic, Reply $reply): JsonResponse
    {
        if ($reply->topic_id !== $topic->id) {
            return response()->json([
                'message' => 'Resposta não encontrada.',
            ], 404);
        }

        $this->authorize('delete', $reply);

        $reply->delete();

        return response()->json([
            'message' => 'Resposta eliminada com sucesso.',
        ]);
    }
}
