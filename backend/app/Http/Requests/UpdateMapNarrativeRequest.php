<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesUniqueNarrativeDisplayOrder;
use App\Models\MapNarrative;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateMapNarrativeRequest extends FormRequest
{
    use ValidatesUniqueNarrativeDisplayOrder;

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
            'province_id' => ['sometimes', 'required', 'integer', 'exists:provinces,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'narrative_text' => ['sometimes', 'required', 'string'],
            'period' => ['sometimes', 'nullable', 'string', 'max:255'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->has('display_order') && ! $this->has('province_id')) {
                return;
            }

            /** @var MapNarrative|null $current */
            $current = $this->route('mapNarrative');

            if ($current instanceof MapNarrative && $this->missing('province_id')) {
                $this->merge(['province_id' => $current->province_id]);
            }

            if ($current instanceof MapNarrative && $this->missing('display_order')) {
                $this->merge(['display_order' => $current->display_order]);
            }

            $this->validateUniqueDisplayOrder($validator);
        });
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
