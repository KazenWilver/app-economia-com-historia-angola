<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommentController extends Controller
{
    public function index(Request $request, Content $content): AnonymousResourceCollection|JsonResponse
    {
        if ($content->status !== 'published' && $request->user('sanctum')?->role !== 'admin') {
            return response()->json([
                'message' => 'Conteúdo não encontrado.',
            ], 404);
        }

        $comments = Comment::query()
            ->where('content_id', $content->id)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->get();

        return CommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Content $content): JsonResponse
    {
        if ($content->status !== 'published') {
            return response()->json([
                'message' => 'Não é possível comentar conteúdos não publicados.',
            ], 422);
        }

        $parentId = $request->input('parent_id');

        if ($parentId !== null) {
            $parent = Comment::query()->find($parentId);

            if ($parent === null || $parent->content_id !== $content->id) {
                return response()->json([
                    'message' => 'O comentário pai não pertence a este conteúdo.',
                    'errors' => [
                        'parent_id' => ['O comentário pai não pertence a este conteúdo.'],
                    ],
                ], 422);
            }
        }

        $comment = Comment::query()->create([
            'user_id' => $request->user()->id,
            'content_id' => $content->id,
            'parent_id' => $parentId,
            'body' => $request->string('body')->toString(),
        ]);

        $comment->load(['user', 'replies.user']);

        return response()->json([
            'message' => 'Comentário publicado com sucesso.',
            'comment' => new CommentResource($comment),
        ], 201);
    }

    public function destroy(Request $request, Content $content, Comment $comment): JsonResponse
    {
        if ($comment->content_id !== $content->id) {
            return response()->json([
                'message' => 'Comentário não encontrado.',
            ], 404);
        }

        $user = $request->user();

        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Não tens permissão para eliminar este comentário.',
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comentário eliminado com sucesso.',
        ]);
    }
}
