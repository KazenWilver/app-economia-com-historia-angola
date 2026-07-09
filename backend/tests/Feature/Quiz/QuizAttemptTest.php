<?php

namespace Tests\Feature\Quiz;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuizAttemptTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{quiz: Quiz, questions: array<int, Question>, correctAnswers: array<int, Answer>}
     */
    private function createQuizWithQuestions(): array
    {
        $quiz = Quiz::query()->create([
            'title' => 'Quiz de Economia',
            'description' => 'Teste rápido',
            'time_limit_seconds' => 300,
            'is_active' => true,
        ]);

        $firstQuestion = Question::query()->create([
            'quiz_id' => $quiz->id,
            'question_text' => 'Qual é a moeda de Angola?',
            'explanation' => 'O kwanza é a moeda nacional.',
            'order' => 0,
        ]);

        $firstWrong = Answer::query()->create([
            'question_id' => $firstQuestion->id,
            'answer_text' => 'Dólar',
            'is_correct' => false,
            'order' => 0,
        ]);

        $firstCorrect = Answer::query()->create([
            'question_id' => $firstQuestion->id,
            'answer_text' => 'Kwanza',
            'is_correct' => true,
            'order' => 1,
        ]);

        $secondQuestion = Question::query()->create([
            'quiz_id' => $quiz->id,
            'question_text' => 'Angola entrou na OPEP em que ano?',
            'explanation' => 'A adesão ocorreu em 2007.',
            'order' => 1,
        ]);

        $secondWrong = Answer::query()->create([
            'question_id' => $secondQuestion->id,
            'answer_text' => '1990',
            'is_correct' => false,
            'order' => 0,
        ]);

        $secondCorrect = Answer::query()->create([
            'question_id' => $secondQuestion->id,
            'answer_text' => '2007',
            'is_correct' => true,
            'order' => 1,
        ]);

        return [
            'quiz' => $quiz,
            'questions' => [$firstQuestion, $secondQuestion],
            'correctAnswers' => [$firstCorrect, $secondCorrect],
            'wrongAnswers' => [$firstWrong, $secondWrong],
        ];
    }

    public function test_authenticated_user_can_submit_quiz_attempt(): void
    {
        $user = User::factory()->create();
        $fixture = $this->createQuizWithQuestions();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
            ],
            'time_spent_seconds' => 95,
        ]);

        $response->assertCreated()
            ->assertJsonPath('attempt.score', 100)
            ->assertJsonPath('attempt.total_questions', 2)
            ->assertJsonPath('attempt.correct_answers', 2)
            ->assertJsonPath('attempt.time_spent_seconds', 95)
            ->assertJsonPath('attempt.answers.0.is_correct', true)
            ->assertJsonPath('attempt.answers.1.is_correct', true)
            ->assertJsonPath('attempt.answers.0.correct_answer_text', 'Kwanza')
            ->assertJsonPath('attempt.answers.0.explanation', 'O kwanza é a moeda nacional.');

        $this->assertDatabaseHas('quiz_attempts', [
            'user_id' => $user->id,
            'quiz_id' => $fixture['quiz']->id,
            'score' => 100,
            'correct_answers' => 2,
            'total_questions' => 2,
            'time_spent_seconds' => 95,
        ]);

        $this->assertDatabaseCount('quiz_attempt_answers', 2);
    }

    public function test_attempt_calculates_partial_score(): void
    {
        $user = User::factory()->create();
        $fixture = $this->createQuizWithQuestions();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][1]->id,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('attempt.score', 50)
            ->assertJsonPath('attempt.correct_answers', 1)
            ->assertJsonPath('attempt.answers.0.is_correct', true)
            ->assertJsonPath('attempt.answers.1.is_correct', false);
    }

    public function test_guest_cannot_submit_quiz_attempt(): void
    {
        $fixture = $this->createQuizWithQuestions();

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
            ],
        ]);

        $response->assertUnauthorized();
        $this->assertDatabaseCount('quiz_attempts', 0);
    }

    public function test_cannot_submit_attempt_for_inactive_quiz(): void
    {
        $user = User::factory()->create();
        $fixture = $this->createQuizWithQuestions();
        $fixture['quiz']->update(['is_active' => false]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['quiz']);
    }

    public function test_must_answer_all_questions(): void
    {
        $user = User::factory()->create();
        $fixture = $this->createQuizWithQuestions();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][0]->id,
                ],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['answers']);
    }

    public function test_cannot_use_answer_from_different_question(): void
    {
        $user = User::factory()->create();
        $fixture = $this->createQuizWithQuestions();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['answers.0.selected_answer_id']);
    }

    public function test_null_selected_answer_counts_as_incorrect(): void
    {
        $user = User::factory()->create();
        $fixture = $this->createQuizWithQuestions();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => null,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('attempt.score', 50)
            ->assertJsonPath('attempt.answers.0.is_correct', false)
            ->assertJsonPath('attempt.answers.0.selected_answer_id', null);
    }

    public function test_multiple_attempts_are_allowed(): void
    {
        $user = User::factory()->create();
        $fixture = $this->createQuizWithQuestions();
        Sanctum::actingAs($user);

        $payload = [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
            ],
        ];

        $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", $payload)->assertCreated();
        $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", $payload)->assertCreated();

        $this->assertSame(2, QuizAttempt::query()->count());
    }
}
