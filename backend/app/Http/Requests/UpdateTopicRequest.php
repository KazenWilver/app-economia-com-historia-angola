<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesTopicVisibility;
use App\Models\Topic;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTopicRequest extends FormRequest
{
    use ValidatesTopicVisibility;

    public function authorize(): bool
    {
        $topic = $this->route('topic');

        return $topic instanceof Topic && ($this->user()?->can('update', $topic) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'forum_id' => ['sometimes', 'required', 'integer', 'exists:forums,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'theme' => ['sometimes', 'nullable', 'string', 'max:255'],
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
