<?php

namespace App\Http\Requests;

use App\Models\JindungoAccessRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewJindungoAccessRequest extends FormRequest
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
            'status' => [
                'required',
                'string',
                Rule::in([
                    JindungoAccessRequest::STATUS_APPROVED,
                    JindungoAccessRequest::STATUS_REJECTED,
                ]),
            ],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Indica se aprovas ou rejeitas o pedido.',
            'status.in' => 'O estado deve ser approved ou rejected.',
        ];
    }
}
