<?php

namespace App\Http\Requests\Concerns;

trait PreparesContentInput
{
    protected function prepareForValidation(): void
    {
        if ($this->has('is_exclusive')) {
            $this->merge([
                'is_exclusive' => $this->boolean('is_exclusive'),
            ]);
        }
    }
}
