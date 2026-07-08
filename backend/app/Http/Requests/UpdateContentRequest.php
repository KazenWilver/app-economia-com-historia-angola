<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesContentMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContentRequest extends FormRequest
{
    use ValidatesContentMedia;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $contentId = $this->route('content')?->id;

        return [
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('contents', 'slug')->ignore($contentId),
            ],
            'body' => ['nullable', 'string'],
            'type' => ['sometimes', Rule::in(['texto', 'audio', 'video', 'podcast', 'jindungo'])],
            ...$this->mediaRules(),
            'media_url' => ['nullable', 'string', 'max:500'],
            'statistics_data' => ['nullable', 'string'],
            'is_exclusive' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.exists' => 'A categoria seleccionada é inválida.',
            'title.required' => 'O título é obrigatório.',
            'type.in' => 'O tipo de conteúdo é inválido.',
            'slug.unique' => 'Este slug já está em uso.',
            ...$this->mediaMessages(),
        ];
    }
}
