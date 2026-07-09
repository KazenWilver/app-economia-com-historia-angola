<?php

namespace App\Policies;

use App\Models\Reply;
use App\Models\Topic;
use App\Models\User;

class ReplyPolicy
{
    public function viewAny(?User $user, Topic $topic): bool
    {
        return (new TopicPolicy)->view($user, $topic);
    }

    public function create(User $user, Topic $topic): bool
    {
        return (new TopicPolicy)->view($user, $topic);
    }

    public function delete(User $user, Reply $reply): bool
    {
        return $user->id === $reply->user_id || $user->role === 'admin';
    }
}
