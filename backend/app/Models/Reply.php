<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Reply extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'topic_id',
        'user_id',
        'parent_id',
        'body',
    ];

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * @return Collection<int, self>
     */
    public static function treeForTopic(int $topicId): Collection
    {
        $allReplies = static::query()
            ->where('topic_id', $topicId)
            ->with('user')
            ->get();

        $childrenByParent = $allReplies->groupBy(
            fn (self $reply): string => (string) ($reply->parent_id ?? 'root')
        );

        $attachReplies = function (self $reply) use ($childrenByParent, &$attachReplies): void {
            $replies = $childrenByParent
                ->get((string) $reply->id, collect())
                ->sortBy('created_at')
                ->values();

            $replies->each(function (self $nestedReply) use ($attachReplies): void {
                $attachReplies($nestedReply);
            });

            $reply->setRelation('replies', $replies);
        };

        return $childrenByParent
            ->get('root', collect())
            ->sortBy('created_at')
            ->values()
            ->each($attachReplies);
    }
}
