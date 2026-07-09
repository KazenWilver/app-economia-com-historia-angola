<?php

namespace App\Http\Requests;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQuizAttemptRequest extends FormRequest
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
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:questions,id'],
            'answers.*.selected_answer_id' => ['nullable', 'integer', 'exists:answers,id'],
            'time_spent_seconds' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'answers.required' => 'Deves submeter pelo menos uma resposta.',
            'answers.min' => 'Deves submeter pelo menos uma resposta.',
            'answers.*.question_id.required' => 'Cada resposta deve indicar a pergunta.',
            'answers.*.question_id.exists' => 'Uma das perguntas seleccionadas é inválida.',
            'answers.*.selected_answer_id.exists' => 'Uma das opções seleccionadas é inválida.',
            'time_spent_seconds.min' => 'O tempo gasto não pode ser negativo.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var Quiz|null $quiz */
            $quiz = $this->route('quiz');

            if ($quiz === null) {
                return;
            }

            if (! $quiz->is_active) {
                $validator->errors()->add('quiz', 'Este quiz não está disponível.');

                return;
            }

            $quiz->loadCount('questions');
            $questionCount = (int) $quiz->questions_count;

            if ($questionCount === 0) {
                $validator->errors()->add('quiz', 'Este quiz ainda não tem perguntas.');

                return;
            }

            $answers = collect($this->input('answers', []));

            if ($answers->count() !== $questionCount) {
                $validator->errors()->add(
                    'answers',
                    'Deves responder a todas as perguntas do quiz.'
                );
            }

            $questionIds = $answers->pluck('question_id');
            if ($questionIds->unique()->count() !== $questionIds->count()) {
                $validator->errors()->add('answers', 'Não podes repetir a mesma pergunta.');

                return;
            }

            $validQuestionIds = Question::query()
                ->where('quiz_id', $quiz->id)
                ->pluck('id');

            if ($questionIds->diff($validQuestionIds)->isNotEmpty()) {
                $validator->errors()->add('answers', 'Uma ou mais perguntas não pertencem a este quiz.');
            }

            foreach ($answers as $index => $answer) {
                $questionId = $answer['question_id'] ?? null;
                $selectedAnswerId = $answer['selected_answer_id'] ?? null;

                if ($selectedAnswerId === null) {
                    continue;
                }

                $belongsToQuestion = Answer::query()
                    ->whereKey($selectedAnswerId)
                    ->where('question_id', $questionId)
                    ->exists();

                if (! $belongsToQuestion) {
                    $validator->errors()->add(
                        "answers.{$index}.selected_answer_id",
                        'A opção seleccionada não pertence à pergunta indicada.'
                    );
                }
            }
        });
    }
}
