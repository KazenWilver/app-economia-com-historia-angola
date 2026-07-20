<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\LearningPath;
use App\Models\LearningPathStep;
use App\Models\Quiz;
use Illuminate\Database\Seeder;

class LearningPathSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = LearningPath::query()->updateOrCreate(
            ['slug' => 'economia-com-historia'],
            [
                'title' => 'Percurso: Economia com História',
                'description' => 'Um trilho guiado: lê conteúdos, faz quizzes, explora o mapa e participa no fórum.',
                'is_active' => true,
            ]
        );

        $introContent = Content::query()
            ->where('slug', 'economia-angolana-apos-independencia')
            ->first();
        $oilContent = Content::query()
            ->where('slug', 'petroleo-e-diversificacao-economica')
            ->first();
        $independenceQuiz = Quiz::query()
            ->where('title', 'Independência e transformação económica')
            ->first();
        $oilQuiz = Quiz::query()
            ->where('title', 'Petróleo, OPEP e volatilidade')
            ->first();

        $steps = [
            [
                'title' => 'Lê: economia após a independência',
                'description' => 'Compreende o marco de 1975 e a transição económica.',
                'step_type' => 'content',
                'reference_id' => $introContent?->id,
                'href' => $introContent
                    ? '/explorar/'.$introContent->slug
                    : '/explorar',
                'order' => 0,
            ],
            [
                'title' => 'Quiz: independência e transformação',
                'description' => 'Testa o que aprendeste sobre 1975 e a estrutura económica.',
                'step_type' => 'quiz',
                'reference_id' => $independenceQuiz?->id,
                'href' => $independenceQuiz
                    ? '/quiz/'.$independenceQuiz->id
                    : '/quiz',
                'order' => 1,
            ],
            [
                'title' => 'Lê: petróleo e diversificação',
                'description' => 'Percebe a dependência do crude e as vias de diversificação.',
                'step_type' => 'content',
                'reference_id' => $oilContent?->id,
                'href' => $oilContent
                    ? '/explorar/'.$oilContent->slug
                    : '/explorar',
                'order' => 2,
            ],
            [
                'title' => 'Quiz: petróleo, OPEP e volatilidade',
                'description' => 'Consolida factos sobre o sector petrolífero e a OPEP.',
                'step_type' => 'quiz',
                'reference_id' => $oilQuiz?->id,
                'href' => $oilQuiz ? '/quiz/'.$oilQuiz->id : '/quiz',
                'order' => 3,
            ],
            [
                'title' => 'Explora o mapa de Angola',
                'description' => 'Visita o mapa interactivo e selecciona pelo menos uma província.',
                'step_type' => 'map',
                'reference_id' => null,
                'href' => '/mapa',
                'order' => 4,
            ],
            [
                'title' => 'Participa no fórum',
                'description' => 'Lê um debate e, se quiseres, deixa a tua contribuição.',
                'step_type' => 'forum',
                'reference_id' => null,
                'href' => '/forum',
                'order' => 5,
            ],
        ];

        foreach ($steps as $step) {
            LearningPathStep::query()->updateOrCreate(
                [
                    'learning_path_id' => $path->id,
                    'order' => $step['order'],
                ],
                [
                    'title' => $step['title'],
                    'description' => $step['description'],
                    'step_type' => $step['step_type'],
                    'reference_id' => $step['reference_id'],
                    'href' => $step['href'],
                ]
            );
        }
    }
}
