<?php

namespace App\Models;

use Database\Factories\ContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Content extends Model
{
    /** @use HasFactory<ContentFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'slug',
        'body',
        'type',
        'media_url',
        'statistics_data',
        'is_exclusive',
        'status',
        'view_count',
        'published_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_exclusive' => 'boolean',
            'view_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @param  mixed  $value
     */
    public function resolveRouteBinding($value, $field = null): Content
    {
        $query = static::query();

        if (is_numeric($value)) {
            return $query->whereKey($value)->firstOrFail();
        }

        return $query->where('slug', $value)->firstOrFail();
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class);
    }
}
