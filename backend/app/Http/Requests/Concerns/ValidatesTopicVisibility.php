<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Validator;

trait ValidatesTopicVisibility
{
    protected function shouldRestrictHiddenTopicCreation(): bool
    {
        return false;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $isPrivate = filter_var($this->input('is_private', false), FILTER_VALIDATE_BOOLEAN);
            $isVisible = filter_var($this->input('is_visible', true), FILTER_VALIDATE_BOOLEAN);

            if ($isPrivate && $isVisible) {
                $validator->errors()->add(
                    'is_private',
                    'Um tópico não pode ser público e privado ao mesmo tempo.'
                );
            }

            if (
                $this->shouldRestrictHiddenTopicCreation()
                && $this->user()?->role !== 'admin'
                && $this->has('is_visible')
                && ! $isVisible
                && ! $isPrivate
            ) {
                $validator->errors()->add(
                    'is_visible',
                    'Apenas administradores podem criar tópicos ocultos.'
                );
            }
        });
    }
}
