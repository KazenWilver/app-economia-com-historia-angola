<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    public const UPDATED_AT = null;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'geojson_data',
        'capital',
        'latitude',
        'longitude',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function narratives(): HasMany
    {
        return $this->hasMany(MapNarrative::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
