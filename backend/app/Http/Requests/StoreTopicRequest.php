<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesTopicVisibility;
use Illuminate\Foundation\Http\FormRequest;

class StoreTopicRequest extends FormRequest
{
    use ValidatesTopicVisibility;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'forum_id' => ['required', 'integer', 'exists:forums,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'theme' => ['nullable', 'string', 'max:255'],
            'is_private' => ['sometimes', 'boolean'],
            'is_visible' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'forum_id.required' => 'O fórum é obrigatório.',
            'forum_id.exists' => 'O fórum seleccionado é inválido.',
            'title.required' => 'O título é obrigatório.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_private')) {
            $this->merge([
                'is_private' => filter_var($this->input('is_private'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        if ($this->has('is_visible')) {
            $this->merge([
                'is_visible' => filter_var($this->input('is_visible'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
