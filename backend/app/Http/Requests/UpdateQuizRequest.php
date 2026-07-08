<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesQuizQuestions;
use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    use ValidatesQuizQuestions;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge(
            [
                'topic_id' => ['sometimes', 'nullable', 'integer', 'exists:topics,id'],
                'title' => ['sometimes', 'required', 'string', 'max:255'],
                'description' => ['sometimes', 'nullable', 'string'],
                'time_limit_seconds' => ['sometimes', 'nullable', 'integer', 'min:30', 'max:7200'],
                'is_active' => ['sometimes', 'boolean'],
            ],
            $this->quizQuestionRules(required: false)
        );
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->quizFieldMessages();
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        $questions = $this->input('questions');

        if (! is_array($questions)) {
            return;
        }

        $normalizedQuestions = collect($questions)
            ->map(function (array $question): array {
                $answers = collect($question['answers'] ?? [])
                    ->map(fn (array $answer): array => [
                        ...$answer,
                        'is_correct' => filter_var(
                            $answer['is_correct'] ?? false,
                            FILTER_VALIDATE_BOOLEAN
                        ),
                    ])
                    ->all();

                return [
                    ...$question,
                    'answers' => $answers,
                ];
            })
            ->all();

        $this->merge(['questions' => $normalizedQuestions]);
    }
}
