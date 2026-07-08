<?php

namespace App\Services;

use App\Models\Forum;

class ForumService
{
    public function ensureDefaultForumExists(): Forum
    {
        return Forum::query()->firstOrCreate(
            ['slug' => 'debates'],
            [
                'name' => 'Debates',
                'description' => 'Espaço de discussão sobre economia e história de Angola.',
            ]
        );
    }
}
