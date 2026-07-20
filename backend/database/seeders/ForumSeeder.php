<?php

namespace Database\Seeders;

use App\Models\Forum;
use App\Models\Reply;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $forum = Forum::query()->updateOrCreate(
            ['slug' => 'debates'],
            [
                'name' => 'Debates',
                'description' => 'Espaço central de discussão sobre economia e história de Angola.',
            ]
        );

        $admin = User::query()->where('email', 'admin@jindungo.ao')->first();
        $user1 = User::query()->where('email', 'utilizador1@jindungo.ao')->first();
        $user2 = User::query()->where('email', 'utilizador2@jindungo.ao')->first();

        if ($admin === null || $user1 === null || $user2 === null) {
            return;
        }

        $topics = [
            [
                'title' => 'Como reduzir a dependência do petróleo até 2030?',
                'description' => 'Partilha propostas realistas de diversificação: agricultura, pescas, indústria e serviços. Que prioridades escolherias primeiro?',
                'theme' => 'Economia',
                'author' => $admin,
                'replies' => [
                    [$user1, 'Começaria por logística e crédito agrícola no planalto — sem escoamento, a produção não chega aos mercados.'],
                    [$user2, 'Concordo, mas sem estabilidade macro o investimento privado foge. Petróleo paga a transição; não se corta de um dia para o outro.'],
                ],
            ],
            [
                'title' => 'O café pode voltar a ser motor de exportação?',
                'description' => 'Antes de 1975 o café tinha peso nas exportações. Que condições (qualidade, marcas, mercados) seriam necessárias hoje?',
                'theme' => 'História',
                'author' => $user1,
                'replies' => [
                    [$admin, 'É preciso distinguir nostalgia de estratégia: hoje compete-se por qualidade, certificação e cadeias curtas com valor acrescentado.'],
                ],
            ],
            [
                'title' => 'Luanda vs interior: como equilibrar o desenvolvimento territorial?',
                'description' => 'A capital concentra serviços e população. Que políticas aproximariam o interior dos mercados e do emprego formal?',
                'theme' => 'Geografia',
                'author' => $user2,
                'replies' => [
                    [$user1, 'Corredores rodoviários e energia fiável no interior mudam tudo — sem isso, a indústria não sai de Luanda.'],
                    [$admin, 'Também importa descentralizar formação técnica e serviços públicos, não só infra-estruturas físicas.'],
                ],
            ],
            [
                'title' => 'Diamantes: receita extractiva ou emprego local?',
                'description' => 'Debatemos governação mineira, formalização e lapidação local. O que falta para o valor ficar em Angola?',
                'theme' => 'Economia',
                'author' => $admin,
                'replies' => [
                    [$user2, 'Transparência das concessões e formação em lapidação seriam um bom começo.'],
                ],
            ],
            [
                'title' => 'Jovens e informalidade: que políticas públicas funcionam?',
                'description' => 'Com população jovem e informalidade elevada, que combinações de formação, crédito e formalização fazem sentido?',
                'theme' => 'Sociedade',
                'author' => $user1,
                'replies' => [
                    [$user2, 'Estágios remunerados ligados a empresas reais > cursos sem saída profissional.'],
                    [$admin, 'E simplificar o registo de microempresas: formalizar tem de ser barato e rápido.'],
                ],
            ],
            [
                'title' => 'Economia criativa em Luanda: hobby ou sector estratégico?',
                'description' => 'Música, moda e audiovisual criam emprego? Ou precisam de política industrial própria?',
                'theme' => 'Cultura',
                'author' => $user2,
                'replies' => [
                    [$user1, 'Já é sector — falta reconhecimento estatístico e financiamento adequado ao risco criativo.'],
                ],
            ],
            [
                'title' => 'Que estatísticas económicas devemos acompanhar todos os trimestres?',
                'description' => 'INE, reservas, inflação, desemprego, produção petrolífera… Monta a tua «dashboard» cidadã.',
                'theme' => 'Política',
                'author' => $admin,
                'replies' => [
                    [$user1, 'Inflação e taxa de câmbio afectam o dia-a-dia mais depressa do que o PIB anual.'],
                    [$user2, 'Eu juntaria emprego formal vs informal e produção agrícola — senão só olhamos para o crude.'],
                ],
            ],
        ];

        foreach ($topics as $topicData) {
            $topic = Topic::query()->updateOrCreate(
                [
                    'forum_id' => $forum->id,
                    'title' => $topicData['title'],
                ],
                [
                    'user_id' => $topicData['author']->id,
                    'description' => $topicData['description'],
                    'theme' => $topicData['theme'],
                    'is_private' => false,
                    'is_visible' => true,
                ]
            );

            foreach ($topicData['replies'] as [$author, $body]) {
                Reply::query()->updateOrCreate(
                    [
                        'topic_id' => $topic->id,
                        'user_id' => $author->id,
                        'body' => $body,
                        'parent_id' => null,
                    ],
                    []
                );
            }
        }
    }
}
