<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningPathStep extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'learning_path_id',
        'title',
        'description',
        'step_type',
        'reference_id',
        'href',
        'order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reference_id' => 'integer',
            'order' => 'integer',
        ];
    }

    public function path(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'learning_path_id');
    }

    public function completions(): HasMany
    {
        return $this->hasMany(LearningStepCompletion::class);
    }
}
