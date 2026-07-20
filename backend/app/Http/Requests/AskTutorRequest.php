<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AskTutorRequest extends FormRequest
{
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
            'question' => ['required', 'string', 'min:5', 'max:1000'],
            'content_id' => ['nullable', 'integer', 'exists:contents,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'question.required' => 'Escreve uma pergunta para o tutor.',
            'question.min' => 'A pergunta deve ter pelo menos 5 caracteres.',
            'question.max' => 'A pergunta é demasiado longa (máximo 1000 caracteres).',
            'content_id.exists' => 'O conteúdo seleccionado não existe.',
        ];
    }
}
