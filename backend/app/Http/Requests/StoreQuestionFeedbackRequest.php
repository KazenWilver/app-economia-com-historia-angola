<?php

namespace App\Http\Requests;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQuestionFeedbackRequest extends FormRequest
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
            'selected_answer_id' => ['required', 'integer', 'exists:answers,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'selected_answer_id.required' => 'Deves seleccionar uma resposta.',
            'selected_answer_id.exists' => 'A opção seleccionada é inválida.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var Quiz|null $quiz */
            $quiz = $this->route('quiz');

            /** @var Question|null $question */
            $question = $this->route('question');

            if ($quiz === null || $question === null) {
                return;
            }

            if ($question->quiz_id !== $quiz->id) {
                $validator->errors()->add('question', 'Esta pergunta não pertence ao quiz.');

                return;
            }

            if (! $quiz->is_active) {
                $validator->errors()->add('quiz', 'Este quiz não está disponível.');

                return;
            }

            $selectedAnswerId = $this->input('selected_answer_id');

            if ($selectedAnswerId === null) {
                return;
            }

            $belongsToQuestion = Answer::query()
                ->whereKey($selectedAnswerId)
                ->where('question_id', $question->id)
                ->exists();

            if (! $belongsToQuestion) {
                $validator->errors()->add(
                    'selected_answer_id',
                    'A opção seleccionada não pertence a esta pergunta.'
                );
            }
        });
    }
}
