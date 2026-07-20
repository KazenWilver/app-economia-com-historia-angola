<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $quizzes = [
            [
                'title' => 'Independência e transformação económica',
                'description' => 'Testa o que sabes sobre 1975 e as mudanças estruturais da economia angolana.',
                'time_limit_seconds' => 360,
                'questions' => [
                    [
                        'question_text' => 'Em que data Angola proclamou a independência?',
                        'explanation' => 'A independência foi proclamada a 11 de Novembro de 1975.',
                        'answers' => [
                            ['A 11 de Novembro de 1975', true],
                            ['A 25 de Abril de 1974', false],
                            ['A 1 de Janeiro de 1980', false],
                            ['A 4 de Fevereiro de 1961', false],
                        ],
                    ],
                    [
                        'question_text' => 'Qual sector se tornou dominante nas exportações angolanas após a independência?',
                        'explanation' => 'O petróleo consolidou-se como principal produto de exportação.',
                        'answers' => [
                            ['Petróleo', true],
                            ['Café processado', false],
                            ['Automóveis', false],
                            ['Turismo', false],
                        ],
                    ],
                    [
                        'question_text' => 'Que culturas de exportação eram importantes antes de 1975?',
                        'explanation' => 'Café, sisal e algodão tiveram peso relevante na economia agrária colonial.',
                        'answers' => [
                            ['Café, sisal e algodão', true],
                            ['Soja e milho híbrido apenas', false],
                            ['Apenas flores ornamentais', false],
                            ['Uva e azeite', false],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Petróleo, OPEP e volatilidade',
                'description' => 'Questões sobre o sector petrolífero e a integração internacional de Angola.',
                'time_limit_seconds' => 300,
                'questions' => [
                    [
                        'question_text' => 'Em que ano Angola se tornou membro da OPEP?',
                        'explanation' => 'Angola aderiu à Organização dos Países Exportadores de Petróleo em 2007.',
                        'answers' => [
                            ['2007', true],
                            ['1990', false],
                            ['2015', false],
                            ['1975', false],
                        ],
                    ],
                    [
                        'question_text' => 'Segundo sínteses recentes do Banco Mundial, o petróleo representa aproximadamente que fatia das exportações de bens?',
                        'explanation' => 'O petróleo representa cerca de 95% das exportações de bens — ordem de grandeza corrente nas análises do Banco Mundial.',
                        'answers' => [
                            ['Cerca de 95%', true],
                            ['Cerca de 20%', false],
                            ['Cerca de 50%', false],
                            ['Menos de 10%', false],
                        ],
                    ],
                    [
                        'question_text' => 'Porque é a dependência do petróleo um risco macroeconómico?',
                        'explanation' => 'Os preços internacionais são voláteis e afectam receitas fiscais e investimento público.',
                        'answers' => [
                            ['Porque os preços internacionais são voláteis', true],
                            ['Porque o petróleo não gera receita', false],
                            ['Porque Angola não exporta petróleo', false],
                            ['Porque o petróleo não tem mercado mundial', false],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Diversificação e desenvolvimento',
                'description' => 'Avalia ideias-chave do debate «para além do petróleo».',
                'time_limit_seconds' => 300,
                'questions' => [
                    [
                        'question_text' => 'Qual destes eixos aparece frequentemente nas agendas de diversificação de Angola?',
                        'explanation' => 'Agricultura, pescas, mineração não petrolífera e serviços são eixos recorrentes.',
                        'answers' => [
                            ['Agricultura e pescas', true],
                            ['Apenas importação de automóveis de luxo', false],
                            ['Abandono total imediato do petróleo', false],
                            ['Proibição do comércio externo', false],
                        ],
                    ],
                    [
                        'question_text' => 'O «dividendo demográfico» depende sobretudo de…',
                        'explanation' => 'Uma população jovem só gera dividendo com educação, saúde e emprego produtivo.',
                        'answers' => [
                            ['Educação, saúde e emprego produtivo', true],
                            ['Apenas aumento da produção de petróleo', false],
                            ['Redução da população urbana', false],
                            ['Eliminação do sector privado', false],
                        ],
                    ],
                    [
                        'question_text' => 'Além do petróleo, que recurso mineral é frequentemente referido no potencial extractivo angolano?',
                        'explanation' => 'Os diamantes são um recurso mineral relevante para a diversificação extractiva.',
                        'answers' => [
                            ['Diamantes', true],
                            ['Urânio como único recurso', false],
                            ['Apenas carvão vegetal', false],
                            ['Petróleo de xisto exclusivo', false],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Geografia económica de Angola',
                'description' => 'Capital, portos e dualismo territorial.',
                'time_limit_seconds' => 240,
                'questions' => [
                    [
                        'question_text' => 'Qual é a capital de Angola?',
                        'explanation' => 'Luanda é a capital política e o principal centro económico.',
                        'answers' => [
                            ['Luanda', true],
                            ['Lobito', false],
                            ['Huambo', false],
                            ['Lubango', false],
                        ],
                    ],
                    [
                        'question_text' => 'Que infra-estrutura de Luanda é crítica para o comércio externo?',
                        'explanation' => 'O porto de Luanda é um nó logístico histórico e contemporâneo.',
                        'answers' => [
                            ['O porto de Luanda', true],
                            ['Uma linha de metro subterrânea nacional', false],
                            ['Um oleoduto até Lisboa', false],
                            ['Um aeroporto exclusivo de carga espacial', false],
                        ],
                    ],
                    [
                        'question_text' => 'Cabinda distingue-se geograficamente por ser…',
                        'explanation' => 'Cabinda é um enclave costeiro, separado do restante território continental.',
                        'answers' => [
                            ['Um enclave costeiro', true],
                            ['Uma ilha no Oceano Índico', false],
                            ['A capital administrativa', false],
                            ['Um deserto interior sem litoral', false],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Trabalho, juventude e informalidade',
                'description' => 'Mercado de trabalho e desafios sociais.',
                'time_limit_seconds' => 240,
                'questions' => [
                    [
                        'question_text' => 'Que característica demográfica é frequentemente destacada para Angola?',
                        'explanation' => 'Cerca de metade da população tem menos de 18 anos (sínteses do Banco Mundial).',
                        'answers' => [
                            ['População muito jovem', true],
                            ['Maioria com mais de 65 anos', false],
                            ['População exclusivamente rural', false],
                            ['Ausência total de jovens urbanos', false],
                        ],
                    ],
                    [
                        'question_text' => 'A informalidade no emprego significa, em regra, que…',
                        'explanation' => 'Muitos postos de trabalho carecem de protecção formal e estabilidade contratual.',
                        'answers' => [
                            ['Muitos empregos estão fora do quadro formal', true],
                            ['Todos os trabalhadores têm contratos públicos', false],
                            ['Não existe desemprego', false],
                            ['Só há emprego no petróleo', false],
                        ],
                    ],
                    [
                        'question_text' => 'Para converter potencial demográfico em desenvolvimento, é essencial…',
                        'explanation' => 'Competências e emprego produtivo transformam juventude em dividendo económico.',
                        'answers' => [
                            ['Investir em competências e emprego', true],
                            ['Ignorar a educação técnica', false],
                            ['Dependência exclusiva de importações', false],
                            ['Eliminar o comércio interno', false],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Cultura, criatividade e território',
                'description' => 'Economia criativa e leitura territorial.',
                'time_limit_seconds' => 240,
                'questions' => [
                    [
                        'question_text' => 'A economia criativa em Luanda pode incluir…',
                        'explanation' => 'Música, moda e design são exemplos de sectores criativos urbanos.',
                        'answers' => [
                            ['Música, moda e design', true],
                            ['Apenas extracção de crude', false],
                            ['Somente monocultura de café', false],
                            ['Exportação exclusiva de minério bruto sem valor cultural', false],
                        ],
                    ],
                    [
                        'question_text' => 'Benguela é historicamente associada a…',
                        'explanation' => 'Benguela teve papel relevante nas rotas comerciais do litoral centro-sul.',
                        'answers' => [
                            ['Rotas comerciais litorais', true],
                            ['Ser a capital desde 1975', false],
                            ['Produção exclusiva de petróleo offshore', false],
                            ['Ausência total de porto histórico', false],
                        ],
                    ],
                    [
                        'question_text' => 'Porque importa estudar a história económica para o presente?',
                        'explanation' => 'O passado explica dependências, oportunidades regionais e escolhas de política actual.',
                        'answers' => [
                            ['Porque explica dependências e oportunidades actuais', true],
                            ['Porque a história económica não tem relevância', false],
                            ['Porque substitui a matemática financeira', false],
                            ['Porque anula a necessidade de dados estatísticos', false],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($quizzes as $quizData) {
            $quiz = Quiz::query()->updateOrCreate(
                ['title' => $quizData['title']],
                [
                    'description' => $quizData['description'],
                    'time_limit_seconds' => $quizData['time_limit_seconds'],
                    'is_active' => true,
                    'topic_id' => null,
                ]
            );

            $quiz->questions()->delete();

            foreach ($quizData['questions'] as $order => $questionData) {
                $question = Question::query()->create([
                    'quiz_id' => $quiz->id,
                    'question_text' => $questionData['question_text'],
                    'explanation' => $questionData['explanation'],
                    'order' => $order,
                ]);

                foreach ($questionData['answers'] as $answerOrder => [$text, $isCorrect]) {
                    Answer::query()->create([
                        'question_id' => $question->id,
                        'answer_text' => $text,
                        'is_correct' => $isCorrect,
                        'order' => $answerOrder,
                    ]);
                }
            }
        }
    }
}
