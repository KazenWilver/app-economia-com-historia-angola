<?php

namespace App\Http\Requests;

use App\Models\Reply;
use App\Models\Topic;
use Illuminate\Foundation\Http\FormRequest;

class StoreReplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $topic = $this->route('topic');

        return $topic instanceof Topic
            && ($this->user()?->can('create', [Reply::class, $topic]) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:replies,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'A resposta não pode estar vazia.',
            'parent_id.exists' => 'A resposta pai seleccionada é inválida.',
        ];
    }
}
