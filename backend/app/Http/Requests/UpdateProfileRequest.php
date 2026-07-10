<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('avatar') && ! $this->hasFile('avatar') && ! $this->has('avatar_url')) {
            $this->merge([
                'avatar_url' => $this->input('avatar'),
            ]);
            $this->request->remove('avatar');
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => [
                Rule::excludeIf(! $this->hasFile('avatar')),
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:2048',
            ],
            'avatar_url' => ['nullable', 'string', 'url', 'max:500'],
            'province_id' => ['sometimes', 'required', 'integer', 'exists:provinces,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email deve ser válido.',
            'email.unique' => 'Este email já está registado.',
            'avatar.image' => 'O avatar deve ser uma imagem.',
            'avatar.mimes' => 'O avatar deve ser JPG, PNG, WEBP ou GIF.',
            'avatar.max' => 'O avatar não pode exceder 2 MB.',
            'avatar_url.url' => 'O avatar deve ser um URL válido.',
            'province_id.required' => 'A província é obrigatória.',
            'province_id.exists' => 'A província seleccionada é inválida.',
        ];
    }
}
