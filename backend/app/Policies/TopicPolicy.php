<?php

namespace App\Policies;

use App\Models\Topic;
use App\Models\User;

class TopicPolicy
{
    public function view(?User $user, Topic $topic): bool
    {
        if (! $topic->is_visible) {
            return $user !== null && ($user->id === $topic->user_id || $user->role === 'admin');
        }

        if ($topic->is_private) {
            return $user !== null && ($user->id === $topic->user_id || $user->role === 'admin');
        }

        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Topic $topic): bool
    {
        return $user->id === $topic->user_id || $user->role === 'admin';
    }

    public function delete(User $user, Topic $topic): bool
    {
        return $user->id === $topic->user_id || $user->role === 'admin';
    }
}
