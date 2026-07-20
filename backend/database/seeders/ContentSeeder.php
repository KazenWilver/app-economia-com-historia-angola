<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Content;
use App\Models\User;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@jindungo.ao')->first();

        if ($admin === null) {
            return;
        }

        $categories = Category::query()->pluck('id', 'slug');

        $contents = [
            [
                'title' => 'A economia angolana após a independência',
                'slug' => 'economia-angolana-apos-independencia',
                'excerpt' => 'De 1975 aos desafios actuais de diversificação.',
                'body' => <<<'TXT'
Em 11 de Novembro de 1975, Angola proclamou a independência. Nas décadas seguintes, a economia sofreu o impacto da guerra civil, da saída de quadros técnicos e da transição para um modelo económico inicialmente centralizado.

Antes da independência, Angola mantinha um tecido produtivo relativamente diversificado (agricultura de exportação, pescas, indústria ligeira). Depois de 1975, a produção agrícola de exportação — nomeadamente café e algodão — sofreu quebras profundas, enquanto o petróleo consolidou-se como principal motor das receitas externas.

Hoje, fontes como o Banco Mundial assinalam que o petróleo continua a representar uma fatia dominante das exportações (na ordem de cerca de 95% das exportações de bens), o que torna a economia sensível aos ciclos internacionais de preços. A agenda de diversificação (agricultura, pescas, diamantes, serviços) é, por isso, central no debate de desenvolvimento.
TXT,
                'type' => 'texto',
                'category_slug' => 'economia',
                'is_exclusive' => false,
                'media_url' => null,
                'statistics_data' => json_encode([
                    'fonte' => 'Banco Mundial / síntese educativa',
                    'marco' => 'Independência: 11/11/1975',
                    'nota' => 'Petróleo ~95% das exportações de bens (ordem de grandeza corrente)',
                ], JSON_UNESCAPED_UNICODE),
            ],
            [
                'title' => 'Petróleo e diversificação económica em Angola',
                'slug' => 'petroleo-e-diversificacao-economica',
                'excerpt' => 'Por que a dependência do crude condiciona o crescimento.',
                'body' => <<<'TXT'
O sector petrolífero é o principal pilar fiscal e externo de Angola. Estimativas recentes do Banco Mundial apontam para um peso elevado do petróleo no PIB, nas receitas públicas e, sobretudo, nas exportações.

Esta dependência traz volatilidade: quando os preços internacionais caem, o espaço orçamental apertase e o investimento público sofre. Por isso, documentos oficiais e análises internacionais (como o Memorando Económico «Para Além do Petróleo») defendem reformas para fortalecer o sector privado não petrolífero, a produtividade agrícola e o capital humano.

Diversificar não significa abandonar o petróleo de um dia para o outro: significa construir fontes adicionais de emprego e receita — agricultura, pescas, mineração não petrolífera, turismo e economia digital — para reduzir o risco macroeconómico.
TXT,
                'type' => 'texto',
                'category_slug' => 'economia',
                'is_exclusive' => false,
                'media_url' => null,
                'statistics_data' => json_encode([
                    'fonte' => 'Banco Mundial — CEM Angola',
                    'eixos' => ['estabilidade macro', 'produtividade', 'capital humano', 'agricultura'],
                ], JSON_UNESCAPED_UNICODE),
            ],
            [
                'title' => 'Café, sisal e algodão: a Angola agrária antes de 1975',
                'slug' => 'cafe-sisal-algodao-angola-agraria',
                'excerpt' => 'Como as culturas de exportação moldaram a economia colonial.',
                'body' => <<<'TXT'
Na primeira metade do século XX, a economia angolana conheceu expansão agrária ligada a culturas de exportação — café, sisal, algodão e outras. Este crescimento, porém, esteve associado a relações laborais desiguais e a tensões sociais que, em 1961, se cruzaram com o início da luta pela independência.

Após 1975, a combinação de conflito armado e reorganização institucional reduziu drasticamente a capacidade exportadora agrícola. Relatórios históricos do Banco Mundial documentam quebras severas na produção de café e de outras culturas nos primeiros anos pós-independência.

Compreender este passado ajuda a enquadrar o debate actual: a revitalização agrícola não é só «voltar ao passado», mas construir cadeias de valor modernas, com crédito, logística e mercados internos estáveis.
TXT,
                'type' => 'texto',
                'category_slug' => 'historia',
                'is_exclusive' => false,
                'media_url' => null,
                'statistics_data' => null,
            ],
            [
                'title' => 'Diamantes e mineração: além do petróleo',
                'slug' => 'diamantes-e-mineracao-alem-do-petroleo',
                'excerpt' => 'O papel dos diamantes na diversificação extractiva.',
                'body' => <<<'TXT'
Além do petróleo, Angola é um dos produtores relevantes de diamantes em África. A mineração — formal e, em alguns períodos, informal — tem peso social e económico em várias regiões do interior.

No ciclo recente, análises do Banco Mundial destacam dinamismo em sectores não petrolíferos como diamantes, comércio e pescas, mesmo quando o sector petrolífero se contrai. Isto ilustra o potencial de diversificação, mas também a necessidade de governação transparente, formalização e ligação a cadeias industriais (corte, lapidação, joalharia).

Para estudantes, o ponto-chave é distinguir: recursos naturais criam receita, mas emprego sustentável exige transformação local e instituições fiáveis.
TXT,
                'type' => 'texto',
                'category_slug' => 'economia',
                'is_exclusive' => false,
                'media_url' => null,
                'statistics_data' => null,
            ],
            [
                'title' => 'Luanda: capital, porto e nó logístico',
                'slug' => 'luanda-capital-porto-no-logistico',
                'excerpt' => 'Porque a capital concentra população, serviços e comércio externo.',
                'body' => <<<'TXT'
Luanda é a capital política e o principal centro económico de Angola. O porto de Luanda historicamente ligou o território às rotas atlânticas e continua a ser um eixo crítico de importações e exportações.

A concentração demográfica e de serviços na capital cria oportunidades (mercados, emprego formal) e desafios (habitação, mobilidade, informalidade). Compreender Luanda ajuda a ler o dualismo territorial: um litoral urbano dinâmico e um interior com potencial agrícola e mineral ainda por integrar plenamente nas cadeias nacionais.
TXT,
                'type' => 'texto',
                'category_slug' => 'geografia',
                'is_exclusive' => false,
                'media_url' => null,
                'statistics_data' => null,
            ],
            [
                'title' => 'Podcast: História do comércio em Benguela',
                'slug' => 'podcast-historia-comercio-benguela',
                'excerpt' => 'Rotas comerciais do litoral centro-sul.',
                'body' => <<<'TXT'
Benguela desempenhou um papel histórico nas rotas comerciais que ligaram o interior ao Atlântico. Este episódio (áudio demonstrativo) convida a reflectir sobre como portos e cidades costeiras moldaram a integração económica regional — e como essa memória informa o desenvolvimento actual do litoral centro-sul.
TXT,
                'type' => 'podcast',
                'category_slug' => 'historia',
                'is_exclusive' => false,
                'media_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                'statistics_data' => null,
            ],
            [
                'title' => 'Áudio: Agricultura familiar no Planalto',
                'slug' => 'audio-agricultura-familiar-planalto',
                'excerpt' => 'Segurança alimentar e ciclos de produção.',
                'body' => <<<'TXT'
A agricultura familiar permanece essencial para a segurança alimentar em várias regiões do planalto. Este áudio (demonstrativo) enquadra práticas locais, desafios de acesso a mercados e a importância de políticas públicas de apoio à produção doméstica — alinhadas com a agenda de diversificação económica.
TXT,
                'type' => 'audio',
                'category_slug' => 'sociedade',
                'is_exclusive' => false,
                'media_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                'statistics_data' => null,
            ],
            [
                'title' => 'Vídeo: O porto de Luanda ao longo dos séculos',
                'slug' => 'video-porto-de-luanda',
                'excerpt' => 'Evolução logística da capital.',
                'body' => <<<'TXT'
Documentário curto (vídeo demonstrativo) sobre a evolução do porto de Luanda como centro logístico e estratégico. Serve de ponto de partida para discutir comércio externo, dependência de importações e a necessidade de corredores logísticos que liguem o interior aos mercados.
TXT,
                'type' => 'video',
                'category_slug' => 'geografia',
                'is_exclusive' => false,
                'media_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                'statistics_data' => null,
            ],
            [
                'title' => 'Jovens, emprego e informalidade em Angola',
                'slug' => 'jovens-emprego-e-informalidade',
                'excerpt' => 'O desafio demográfico e o mercado de trabalho.',
                'body' => <<<'TXT'
Angola tem uma população muito jovem: cerca de metade tem menos de 18 anos, segundo sínteses do Banco Mundial. Este «dividendo demográfico» só se concretiza com educação, saúde e empregos produtivos.

Dados recentes apontam para desemprego ainda elevado e uma informalidade que pode atingir a grande maioria dos postos de trabalho. Para a política económica, isto significa que diversificar não é só exportar mais produtos — é criar emprego formal, competências técnicas e um ambiente de negócios previsível.
TXT,
                'type' => 'texto',
                'category_slug' => 'sociedade',
                'is_exclusive' => false,
                'media_url' => null,
                'statistics_data' => json_encode([
                    'fonte' => 'Banco Mundial — síntese país Angola',
                    'nota' => 'População jovem; informalidade elevada no emprego',
                ], JSON_UNESCAPED_UNICODE),
            ],
            [
                'title' => 'Instituições e governação após a paz',
                'slug' => 'instituicoes-e-governacao-apos-a-paz',
                'excerpt' => 'Do conflito à construção de regras económicas.',
                'body' => <<<'TXT'
O fim do conflito armado abriu espaço para reformas macroeconómicas, estabilização e maior integração internacional. Ainda assim, a qualidade das instituições — transparência orçamental, regulação do sector extractivo, justiça económica — condiciona o investimento privado.

Este texto convida a pensar a economia não só como recursos naturais, mas como conjunto de regras: propriedade, contratos, crédito e confiança. Sem instituições sólidas, a diversificação avança lentamente.
TXT,
                'type' => 'texto',
                'category_slug' => 'politica',
                'is_exclusive' => false,
                'media_url' => null,
                'statistics_data' => null,
            ],
            [
                'title' => 'Exclusivo: Memórias da independência em Cabinda',
                'slug' => 'jindungo-memorias-independencia-cabinda',
                'excerpt' => 'Território, identidade e memória colectiva.',
                'body' => <<<'TXT'
Texto exclusivo para utilizadores autenticados. Cabinda ocupa um lugar particular na geografia e na história política de Angola — enclave costeiro rico em petróleo e com trajetórias identitárias próprias.

Esta leitura convida a cruzar narrativa local, recursos naturais e construção do Estado, sem simplificar a complexidade histórica. Ideal para debates no fórum e para ligar geografia económica à memória colectiva.
TXT,
                'type' => 'jindungo',
                'category_slug' => 'historia',
                'is_exclusive' => true,
                'media_url' => null,
                'statistics_data' => null,
            ],
            [
                'title' => 'Exclusivo: Economia criativa em Luanda',
                'slug' => 'jindungo-economia-criativa-luanda',
                'excerpt' => 'Música, moda e empreendedorismo cultural.',
                'body' => <<<'TXT'
Texto exclusivo sobre a economia criativa em Luanda: música, moda, design e novos negócios culturais. Em economias jovens e urbanas, estes sectores geram emprego, identidade e exportação de serviços simbólicos.

Para a agenda de diversificação, a economia criativa é um complemento ao extractivo: assenta em talento, redes e mercado interno dinâmico — e beneficia de políticas de formação, espaços de ensaio e acesso a financiamento.
TXT,
                'type' => 'jindungo',
                'category_slug' => 'cultura',
                'is_exclusive' => true,
                'media_url' => null,
                'statistics_data' => null,
            ],
        ];

        foreach ($contents as $item) {
            $categoryId = $categories[$item['category_slug']] ?? $categories->first();

            Content::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'category_id' => $categoryId,
                    'author_id' => $admin->id,
                    'title' => $item['title'],
                    'body' => $item['body'],
                    'type' => $item['type'],
                    'media_url' => $item['media_url'],
                    'statistics_data' => $item['statistics_data'],
                    'is_exclusive' => $item['is_exclusive'],
                    'status' => 'published',
                    'view_count' => random_int(12, 240),
                    'published_at' => now()->subDays(random_int(1, 45)),
                ]
            );
        }
    }
}
