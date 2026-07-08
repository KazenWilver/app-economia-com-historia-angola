<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Validator;

trait ValidatesQuizQuestions
{
    /**
     * @return array<string, mixed>
     */
    protected function quizFieldRules(bool $questionsRequired = true): array
    {
        return array_merge(
            [
                'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'time_limit_seconds' => ['nullable', 'integer', 'min:30', 'max:7200'],
                'is_active' => ['sometimes', 'boolean'],
            ],
            $this->quizQuestionRules(required: $questionsRequired)
        );
    }

    /**
     * @return array<string, mixed>
     */
    protected function quizQuestionRules(bool $required = true): array
    {
        $questionsRule = $required
            ? ['required', 'array', 'min:1']
            : ['sometimes', 'array', 'min:1'];

        return [
            'questions' => $questionsRule,
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.explanation' => ['nullable', 'string'],
            'questions.*.order' => ['nullable', 'integer', 'min:0'],
            'questions.*.answers' => ['required', 'array', 'min:2'],
            'questions.*.answers.*.answer_text' => ['required', 'string'],
            'questions.*.answers.*.is_correct' => ['required', 'boolean'],
            'questions.*.answers.*.order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function quizFieldMessages(): array
    {
        return [
            'title.required' => 'O título é obrigatório.',
            'questions.required' => 'Adiciona pelo menos uma pergunta.',
            'questions.min' => 'Adiciona pelo menos uma pergunta.',
            'questions.*.question_text.required' => 'O texto da pergunta é obrigatório.',
            'questions.*.answers.required' => 'Cada pergunta precisa de respostas.',
            'questions.*.answers.min' => 'Cada pergunta precisa de pelo menos duas respostas.',
            'questions.*.answers.*.answer_text.required' => 'O texto da resposta é obrigatório.',
            'questions.*.answers.*.is_correct.required' => 'Indica se a resposta é correcta.',
            'time_limit_seconds.min' => 'O tempo limite mínimo é 30 segundos.',
            'time_limit_seconds.max' => 'O tempo limite máximo é 2 horas.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $questions = $this->input('questions', []);

            if (! is_array($questions)) {
                return;
            }

            foreach ($questions as $index => $question) {
                $answers = $question['answers'] ?? [];

                if (! is_array($answers)) {
                    continue;
                }

                $correctCount = collect($answers)
                    ->filter(fn ($answer) => filter_var($answer['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN))
                    ->count();

                if ($correctCount !== 1) {
                    $validator->errors()->add(
                        "questions.{$index}.answers",
                        'Cada pergunta deve ter exactamente uma resposta correcta.'
                    );
                }
            }
        });
    }
}
