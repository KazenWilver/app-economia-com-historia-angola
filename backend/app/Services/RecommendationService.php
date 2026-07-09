<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Content;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\Recommendation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RecommendationService
{
    private const MAX_RECOMMENDATIONS = 3;

    /**
     * @var list<string>
     */
    private const STOPWORDS = [
        'qual', 'quais', 'como', 'onde', 'quando', 'quem', 'porque', 'porquê',
        'sobre', 'para', 'pelo', 'pela', 'pelos', 'pelas', 'numa', 'num', 'numa',
        'angola', 'angolana', 'angolano', 'foi', 'são', 'ser', 'está', 'esta',
        'este', 'essa', 'esse', 'mais', 'menos', 'muito', 'pouco', 'entre',
        'desde', 'após', 'apos', 'com', 'sem', 'dos', 'das', 'nos', 'nas',
    ];

    /**
     * @return EloquentCollection<int, Recommendation>
     */
    public function generateForAttempt(QuizAttempt $attempt, User $user): EloquentCollection
    {
        $attempt->loadMissing([
            'answers.question',
            'quiz.topic',
        ]);

        $matchedContents = $this->findRecommendedContents($attempt, $user);

        return DB::transaction(function () use ($attempt, $user, $matchedContents): EloquentCollection {
            Recommendation::query()
                ->where('quiz_attempt_id', $attempt->id)
                ->delete();

            $recommendations = new EloquentCollection;

            foreach ($matchedContents as $match) {
                $recommendations->push(
                    Recommendation::query()->create([
                        'user_id' => $user->id,
                        'content_id' => $match['content']->id,
                        'quiz_attempt_id' => $attempt->id,
                        'reason' => $match['reason'],
                        'is_read' => false,
                    ])
                );
            }

            return $recommendations->load(['content.category']);
        });
    }

    /**
     * @return Collection<int, array{content: Content, reason: string}>
     */
    private function findRecommendedContents(QuizAttempt $attempt, User $user): Collection
    {
        $wrongAnswers = $attempt->answers->where('is_correct', false);
        $categorySlugs = $this->resolveCategorySlugs($attempt);
        $keywords = $this->extractKeywords($wrongAnswers);

        $candidates = Content::query()
            ->with('category:id,name,slug')
            ->where('status', 'published')
            ->when(
                $categorySlugs->isNotEmpty(),
                fn ($query) => $query->whereHas(
                    'category',
                    fn ($categoryQuery) => $categoryQuery->whereIn('slug', $categorySlugs->all())
                )
            )
            ->latest('published_at')
            ->limit(30)
            ->get();

        if ($candidates->isEmpty()) {
            $candidates = Content::query()
                ->with('category:id,name,slug')
                ->where('status', 'published')
                ->latest('published_at')
                ->limit(30)
                ->get();
        }

        $scored = $candidates
            ->map(function (Content $content) use ($attempt, $wrongAnswers, $categorySlugs, $keywords): array {
                $score = 0;
                $reason = 'Conteúdo recomendado para continuares a aprender.';

                if (
                    $content->category !== null
                    && $categorySlugs->contains($content->category->slug)
                ) {
                    $score += 10;
                    $reason = "Conteúdo de {$content->category->name} para aprofundares o que aprendeste.";
                }

                $topicTheme = $attempt->quiz?->topic?->theme;
                if ($topicTheme) {
                    $score += 4;
                    $reason = "Relacionado com o tema «{$topicTheme}» do quiz.";
                }

                $matchedQuestion = $this->firstMatchingWrongQuestion($content, $wrongAnswers, $keywords);
                if ($matchedQuestion !== null) {
                    $score += 8;
                    $reason = 'Sugerido para reveres o tema «'.$matchedQuestion.'».';
                } elseif ($keywords->isNotEmpty()) {
                    $keywordMatches = $keywords->filter(
                        fn (string $keyword) => $this->contentContainsKeyword($content, $keyword)
                    )->count();

                    if ($keywordMatches > 0) {
                        $score += $keywordMatches * 3;
                    }
                }

                if ($wrongAnswers->isEmpty() && $attempt->score >= 80) {
                    $score += 2;
                    $reason = 'Parabéns! Aprofunda o tema com este conteúdo.';
                }

                return [
                    'content' => $content,
                    'reason' => $reason,
                    'score' => $score,
                ];
            })
            ->sortByDesc('score')
            ->values();

        return $scored
            ->unique(fn (array $item) => $item['content']->id)
            ->take(self::MAX_RECOMMENDATIONS)
            ->map(fn (array $item) => [
                'content' => $item['content'],
                'reason' => $item['reason'],
            ])
            ->values();
    }

    /**
     * @return Collection<int, string>
     */
    private function resolveCategorySlugs(QuizAttempt $attempt): Collection
    {
        $slugs = collect();

        $topicTheme = $attempt->quiz?->topic?->theme;
        if ($topicTheme) {
            $slugs->push(Str::slug($topicTheme));
        }

        $quizTitle = $attempt->quiz?->title;
        if ($quizTitle) {
            Category::query()
                ->get(['id', 'slug', 'name'])
                ->each(function (Category $category) use ($quizTitle, $slugs): void {
                    if (Str::contains(Str::lower($quizTitle), Str::lower($category->name))) {
                        $slugs->push($category->slug);
                    }
                });
        }

        return $slugs->filter()->unique()->values();
    }

    /**
     * @param  Collection<int, QuizAttemptAnswer>  $wrongAnswers
     * @return Collection<int, string>
     */
    private function extractKeywords(Collection $wrongAnswers): Collection
    {
        return $wrongAnswers
            ->flatMap(function (QuizAttemptAnswer $answer): array {
                $text = $answer->question?->question_text ?? '';

                return preg_split('/\s+/u', Str::lower($text)) ?: [];
            })
            ->map(fn (string $word) => trim($word, ".,;:!?()[]«»\"'"))
            ->filter(fn (string $word) => mb_strlen($word) >= 5)
            ->reject(fn (string $word) => in_array($word, self::STOPWORDS, true))
            ->unique()
            ->values();
    }

    /**
     * @param  Collection<int, QuizAttemptAnswer>  $wrongAnswers
     * @param  Collection<int, string>  $keywords
     */
    private function firstMatchingWrongQuestion(
        Content $content,
        Collection $wrongAnswers,
        Collection $keywords,
    ): ?string {
        foreach ($wrongAnswers as $answer) {
            $questionText = $answer->question?->question_text;
            if ($questionText === null) {
                continue;
            }

            $matchesQuestion = $keywords->contains(
                fn (string $keyword) => Str::contains(Str::lower($questionText), $keyword)
                    && $this->contentContainsKeyword($content, $keyword)
            );

            if ($matchesQuestion) {
                return $questionText;
            }
        }

        return null;
    }

    private function contentContainsKeyword(Content $content, string $keyword): bool
    {
        $haystack = Str::lower(trim($content->title.' '.$content->body));

        return Str::contains($haystack, Str::lower($keyword));
    }
}
