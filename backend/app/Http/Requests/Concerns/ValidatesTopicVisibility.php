<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Validator;

trait ValidatesTopicVisibility
{
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
        });
    }
}
