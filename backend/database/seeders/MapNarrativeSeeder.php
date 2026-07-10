<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Narrativas do mapa a partir de "Divisão Territorial de Angola.md" (Lei n.º 14/24).
 */
class MapNarrativeSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $provinceIds = DB::table('provinces')->pluck('id', 'code');

        // Substitui o conjunto de narrativas seedadas (evita títulos antigos órfãos).
        DB::table('map_narratives')->delete();

        foreach ($this->narratives() as $item) {
            $provinceId = $provinceIds[$item['code']] ?? null;

            if (! $provinceId) {
                continue;
            }

            DB::table('map_narratives')->updateOrInsert(
                [
                    'province_id' => $provinceId,
                    'title' => $item['title'],
                ],
                [
                    'narrative_text' => $item['narrative_text'],
                    'period' => $item['period'],
                    'display_order' => $item['display_order'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    /**
     * @return list<array{code: string, title: string, narrative_text: string, period: string, display_order: int}>
     */
    private function narratives(): array
    {
        return [
            [
                'code' => 'BGO',
                'title' => 'Bengo: Cinturão alimentar de Luanda',
                'narrative_text' => 'A província do Bengo foi criada a 26 de Abril de 1980, no pós-independência, '
                    .'para circundar a capital e reforçar a segurança alimentar e militar de Luanda, com sede no Dande. '
                    .'A economia assenta na agropecuária alimentada pelo rio Dande — banana, mandioca, citrinos e hortícolas — '
                    .'e no polo logístico da Barra do Dande. A sociedade é maioritariamente Ambundu (Kimbundu), com ligação '
                    .'cultural às lagoas sagradas da região, como a Ibendoa.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'BGU',
                'title' => 'Benguela: Corredor do Lobito e memória atlântica',
                'narrative_text' => 'Fundada a 17 de Maio de 1617 por Manuel Cerveira Pereira, Benguela foi eixo da penetração '
                    .'colonial e porto do tráfico transatlântico. Hoje o Corredor do Lobito — Porto de Águas Profundas e '
                    .'Caminho de Ferro de Benguela — liga Angola à RDC e à Zâmbia para o escoamento de cobre e cobalto. '
                    .'Pescas, metalomecânica, cimenteira e açúcar na Catumbela completam a economia. A identidade Ovimbundu '
                    .'(Umbundu) marca a vida cultural e a forte consciência cívica urbana.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'BIE',
                'title' => 'Bié: Planalto fértil e memória do cerco do Cuito',
                'narrative_text' => 'Instituída a 1 de Maio de 1922 e ligada ao antigo Reino do Bié, a província foi um dos '
                    .'palcos mais destruídos da guerra civil; a capital Cuito sofreu um cerco prolongado. A economia é '
                    .'agrícola — batata, milho, feijão, arroz e café arábica — reactivada pelo Caminho de Ferro de Benguela. '
                    .'A população Ovimbundu (Umbundu), com forte presença Bailundo, preserva as ombalas na resolução de conflitos.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'CAB',
                'title' => 'Cabinda: Enclave, petróleo e Mayombe',
                'narrative_text' => 'Exclave angolano entre o Congo e a RDC, Cabinda foi formalizada pelo Tratado de '
                    .'Simulambuco (1 de Fevereiro de 1885). As reservas de petróleo offshore sustentam grande parte das '
                    .'receitas nacionais; a Floresta do Mayombe oferece biodiversidade e potencial de ecoturismo. O povo '
                    .'Bakongo (Kikongo/Fiote) afirma uma identidade cultural própria, marcada por rituais, danças do Bakama '
                    .'e ligação ao mar e à floresta.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'CUA',
                'title' => 'Cuando: Terras do Fim do Mundo e Cuito Cuanavale',
                'narrative_text' => 'Criada a 1 de Janeiro de 2025 pela Lei n.º 14/24 a partir da metade oriental do antigo '
                    .'Cuando Cubango, com capital em Mavinga. Historicamente isolada — as "Terras do Fim do Mundo" — a '
                    .'economia assenta na pecuária e no potencial do corredor de conservação KAZA. O município do Cuito '
                    .'Cuanavale foi palco da maior batalha terrestre contemporânea de África (anos 1980). A população '
                    .'Ovanganguela (Nganguela/Xindonga) vive da caça, pesca e agricultura de subsistência.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'CNO',
                'title' => 'Cuanza Norte: Energia do rio Cuanza',
                'narrative_text' => 'Criada a 15 de Agosto de 1914, com sede em Cazengo (N\'dalatando), a província foi '
                    .'ponto avançado da penetração colonial ao longo do vale do Cuanza. Hoje alberga aproveitamentos '
                    .'hidroelétricos como Cambambe e a proximidade de Laúca, pilares da segurança energética nacional. '
                    .'Produz café robusta, mandioca, milho e fruteiras. A população Ambundu (Kimbundu) partilha ritos '
                    .'tradicionais com Malanje.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'CSU',
                'title' => 'Cuanza Sul: Celeiro do planalto de Cela',
                'narrative_text' => 'Criada a 15 de Setembro de 1914, com capital no Sumbe, a província estende-se da costa '
                    .'atlântica às terras altas do interior. O planalto de Cela (Waku Kungo) é um dos maiores celeiros '
                    .'do país — milho, soja, leite e carne — enquanto o litoral vive da pesca e do sal. Ambundu e '
                    .'Ovimbundu (Kimbundu e Umbundu) partilham ritos agrários ligados às chuvas.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'CUB',
                'title' => 'Cubango: Menongue, madeira e desminagem',
                'narrative_text' => 'Oficializada a 1 de Janeiro de 2025 pela Lei n.º 14/24, herdou a capital Menongue '
                    .'(antiga Serpa Pinto), terminal do Caminho de Ferro de Moçâmedes. A economia assenta na madeira nobre '
                    .'("ouro verde") e na logística ferroviária; a desminagem de áreas agrícolas permanece um desafio '
                    .'estrutural. A população Ovanganguela (Nganguela), com minorias Cokwe, procura reduzir a dependência '
                    .'alimentar face à Namíbia.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'CNN',
                'title' => 'Cunene: Pecuária, seca e fronteira com a Namíbia',
                'narrative_text' => 'Autonomizada a 10 de Julho de 1970, com sede em Cuanhama (Ondjiva), o Cunene enfrenta '
                    .'clima semiárido e secas cíclicas. A pecuária pastoralista concentra o maior efectivo bovino do país; '
                    .'obras como o Canal do Cafu transferem água do rio Cunene para pastagens e consumo. O comércio em '
                    .'Santa Clara liga Angola à Namíbia. A etnia Ovambo (Oshiwambo) mantém lideranças tradicionais fortes.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'HUA',
                'title' => 'Huambo: Nova Lisboa, planalto e Bailundo',
                'narrative_text' => 'Fundada a 8 de Agosto de 1912 por Norton de Mattos como Nova Lisboa, o Huambo foi '
                    .'pensado como possível capital colonial pelo clima de altitude. A guerra civil destruiu indústrias '
                    .'e academias; a reconstrução agrícola (milho, soja, feijão, batata) e o Caminho de Ferro de Benguela '
                    .'devolveram fôlego. Polo universitário do planalto central, é berço do Reino do Bailundo e da '
                    .'identidade Ovimbundu (Umbundu).',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'HUI',
                'title' => 'Huíla: Lubango, Chela e granito negro',
                'narrative_text' => 'Criada a 2 de Setembro de 1901, a Huíla é o motor económico do sul. O Lubango, na '
                    .'bacia da Serra da Chela, combina pedras ornamentais (granito negro), pecuária, bebidas, cimento e '
                    .'turismo na Fenda da Tundavala. É o maior polo comercial e universitário do sul. Nyaneka-Humbi '
                    .'(Olunhaneka) e Ovimbundu partilham o território planáltico.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'ICB',
                'title' => 'Ícolo e Bengo: Catete, Quiminha e berço de Neto',
                'narrative_text' => 'Elevada a província pela Lei n.º 14/24, com sede em Catete, nasceu do desmembramento '
                    .'de Luanda para descentralizar o planeamento e dinamizar o vale do Bengo. A economia agroindustrial '
                    .'inclui o polo da Quiminha e indústrias no Sequele e Bom Jesus. Berço de António Agostinho Neto, '
                    .'primeiro Presidente de Angola, a população Ambundu (Kimbundu) afirma uma identidade histórica '
                    .'ligada à luta pela independência.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'LUA',
                'title' => 'Luanda: Capital metropolitana desde 1576',
                'narrative_text' => 'Fundada por Paulo Dias de Novais a 25 de Janeiro de 1576, Luanda é a capital política '
                    .'e financeira de Angola. Após a Lei n.º 14/24 ficou reduzida ao núcleo metropolitano com sede na '
                    .'Ingombota, concentrando bancos, petrolíferas, o Porto de Luanda e polos em Cacuaco, Viana e Cazenga. '
                    .'O cosmopolitismo pluriétnico convive com a pressão sobre água, energia e saneamento.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'LNO',
                'title' => 'Lunda Norte: Diamantes, Dundo e arte Cokwe',
                'narrative_text' => 'Instituída a 4 de Julho de 1978 com capital no Dundo, após a cisão da antiga Lunda. '
                    .'A economia gira em torno de diamantes aluvionares e quimberlíticos, confrontada com garimpo ilegal '
                    .'e dinâmicas transfronteiriças com a RDC. O Museu do Dundo e a escrita na areia (Sona) preservam o '
                    .'maior acervo de arte Cokwe de África. A língua Tchokwé domina a vida comunitária.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'LSU',
                'title' => 'Lunda Sul: Catoca e coração Cokwe',
                'narrative_text' => 'Instituída a 13 de Julho de 1895, com sede em Saurimo, a Lunda Sul alberga a Sociedade '
                    .'Mineira de Catoca, uma das maiores chaminés quimberlíticas a céu aberto do mundo, e o Polo '
                    .'Diamantífero de Saurimo. A agricultura de subsistência assenta na mandioca e no milho. Saurimo é '
                    .'coração cultural Cokwe, com rituais de iniciação Mukanda de elevado valor antropológico.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'MAL',
                'title' => 'Malanje: Ndongo, Nzinga e Palanca Negra',
                'narrative_text' => 'Instituída a 13 de Fevereiro de 1868, Malanje herda o Reino de Ndongo e de Matamba e '
                    .'a memória da Rainha Nzinga Mbandi. O Polo Agroindustrial de Capanda e a barragem homónima no Cuanza '
                    .'sustentam cereais e cana-de-açúcar. Quedas de Kalandula, Pedras Negras de Pungo Andongo e a Reserva '
                    .'do Luando — habitat da Palanca Negra Gigante — marcam o turismo. A população Ambundu (Kimbundu) '
                    .'preserva linhagens ligadas ao Ndongo.',
                'period' => 'pré-colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'MOX',
                'title' => 'Moxico: Luena, CFB e legado da guerra',
                'narrative_text' => 'Com capital no Luena, o Moxico foi base operacional na guerra civil, que culminou no '
                    .'falecimento de Jonas Savimbi em 2002. A economia assenta no mel, cereais, mandioca e floresta; o '
                    .'Caminho de Ferro de Benguela liga o litoral ao leste. A desminagem condiciona o investimento agrícola. '
                    .'Cokwe, Luchazi e Ovimbundu partilham aldeias ao longo da bacia do Zambeze.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'MLX',
                'title' => 'Moxico Leste: Cazombo, Copperbelt e Lunda Ndembo',
                'narrative_text' => 'Instituída a 1 de Janeiro de 2025 pela Lei n.º 14/24, com sede em Cazombo, na fronteira '
                    .'com a Zâmbia e a RDC. O potencial mineiro (cobre em Calunda/Macondo) e o Polo Industrial do Luau no '
                    .'Corredor do Lobito definem a economia; parques fotovoltaicos em Cazombo e Luau combatem a carência '
                    .'eléctrica. O Festival Lunda Ndembo e a Rainha Nyakatolo Ngambo afirmam a identidade Luvale/Lunda.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'NAM',
                'title' => 'Namibe: Deserto, pescas e Parque do Iona',
                'narrative_text' => 'Fundada em 1840 como Moçâmedes, a província une Atlântico e Deserto do Namibe. '
                    .'Moçâmedes e Tômbua são portos pesqueiros de referência; mármores, granitos e o Caminho de Ferro de '
                    .'Moçâmedes escoam a produção da Huíla. O Parque Nacional do Iona e a lagoa do Arco atraem turismo. '
                    .'Povos Herero e Nyaneka (Oluherero) mantêm pastoralismo nómada, apoiado por escolas móveis.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'UIG',
                'title' => 'Uíge: Café robusta e norte Bakongo',
                'narrative_text' => 'Estabelecida a 15 de Agosto de 1914, o Uíge foi o maior polo de café robusta no '
                    .'período colonial tardio. Hoje fornece mandioca, batata-doce, feijão, amendoim e banana, com '
                    .'revitalização cafeeira e jazigos de cobre, ouro e zinco. A matriz Bakongo (Kikongo) preserva '
                    .'linhagens régias e clãs comunitários no extremo norte do país.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'ZAI',
                'title' => 'Zaire: M\'banza-Kongo e memória do Reino do Congo',
                'narrative_text' => 'Com sede em M\'banza-Kongo — antiga capital do Reino do Congo e Património Mundial '
                    .'da UNESCO — a província do Zaire liga a história pré-colonial à fronteira com a RDC. O território '
                    .'foi eixo político e espiritual bakongo; hoje combina memória histórica, comércio transfronteiriço '
                    .'e identidade Kikongo. A Lei n.º 14/24 manteve a província no quadro das 21 unidades administrativas.',
                'period' => 'pré-colonial',
                'display_order' => 1,
            ],
        ];
    }
}
