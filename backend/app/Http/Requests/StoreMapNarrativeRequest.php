<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMapNarrativeRequest extends FormRequest
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
            'province_id' => ['required', 'integer', 'exists:provinces,id'],
            'title' => ['required', 'string', 'max:255'],
            'narrative_text' => ['required', 'string'],
            'period' => ['nullable', 'string', 'max:255'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'province_id.required' => 'A província é obrigatória.',
            'province_id.exists' => 'A província seleccionada é inválida.',
            'title.required' => 'O título é obrigatório.',
            'narrative_text.required' => 'O texto narrativo é obrigatório.',
        ];
    }
}
