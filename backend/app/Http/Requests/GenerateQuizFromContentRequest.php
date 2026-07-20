<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class GenerateQuizFromContentRequest extends FormRequest
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
            'content_id' => ['nullable', 'integer', 'exists:contents,id'],
            'source_text' => ['nullable', 'string', 'min:80', 'max:20000'],
            'source_title' => ['nullable', 'string', 'max:180'],
            'question_count' => ['nullable', 'integer', 'min:3', 'max:8'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content_id.exists' => 'O conteúdo seleccionado não existe.',
            'source_text.min' => 'O texto deve ter pelo menos 80 caracteres.',
            'question_count.min' => 'Gera pelo menos 3 perguntas.',
            'question_count.max' => 'Gera no máximo 8 perguntas.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('content_id') && ! $this->filled('source_text')) {
                $validator->errors()->add(
                    'content_id',
                    'Indica um conteúdo ou cola um texto de origem.'
                );
            }
        });
    }
}
