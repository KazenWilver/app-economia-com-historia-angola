<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\PreparesContentInput;
use App\Http\Requests\Concerns\ValidatesContentMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContentRequest extends FormRequest
{
    use PreparesContentInput;
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
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:contents,slug'],
            'body' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['texto', 'audio', 'video', 'podcast', 'jindungo'])],
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
            'category_id.required' => 'A categoria é obrigatória.',
            'category_id.exists' => 'A categoria seleccionada é inválida.',
            'title.required' => 'O título é obrigatório.',
            'type.required' => 'O tipo de conteúdo é obrigatório.',
            'type.in' => 'O tipo de conteúdo é inválido.',
            'slug.unique' => 'Este slug já está em uso.',
            ...$this->mediaMessages(),
        ];
    }
}
