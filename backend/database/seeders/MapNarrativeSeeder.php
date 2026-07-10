<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Narrativas do mapa a partir de "Divisão Territorial de Angola.md" (Lei n.º 14/24).
 * Duas narrativas por província (história + economia/sociedade), ordens 1 e 2.
 */
class MapNarrativeSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $provinceIds = DB::table('provinces')->pluck('id', 'code');

        DB::table('map_narratives')->delete();

        foreach ($this->narratives() as $item) {
            $provinceId = $provinceIds[$item['code']] ?? null;

            if (! $provinceId) {
                continue;
            }

            DB::table('map_narratives')->insert([
                'province_id' => $provinceId,
                'title' => $item['title'],
                'narrative_text' => $item['narrative_text'],
                'period' => $item['period'],
                'display_order' => $item['display_order'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    /**
     * @return list<array{code: string, title: string, narrative_text: string, period: string, display_order: int}>
     */
    private function narratives(): array
    {
        return [
            // Bengo
            [
                'code' => 'BGO',
                'title' => 'Bengo: criação e cinturão de Luanda',
                'narrative_text' => 'A província do Bengo foi criada formalmente a 26 de Abril de 1980, no pós-independência, '
                    .'para circundar a capital e criar um cinturão de segurança alimentar e militar para Luanda, com sede '
                    .'no município do Dande. Em 2011, Ícolo e Bengo e a Quiçama foram integrados em Luanda, regressando '
                    .'mais tarde à autonomia sob formatos diferenciados. A sociedade é maioritariamente Ambundu (Kimbundu), '
                    .'com franjas Kikongo no norte e ligação cultural às lagoas sagradas, como a Ibendoa.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'BGO',
                'title' => 'Bengo: agropecuária e Barra do Dande',
                'narrative_text' => 'A economia do Bengo assenta na agropecuária alimentada pelo rio Dande e bacias '
                    .'circundantes — banana, mandioca, citrinos e hortícolas. O polo da Barra do Dande projecta-se como '
                    .'centro logístico com ligações portuárias e armazenamento de combustíveis para aliviar a pressão '
                    .'sobre Luanda. As prioridades locais passam pela atracção de investimento agroindustrial e pela '
                    .'consolidação urbana de Caxito.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Benguela
            [
                'code' => 'BGU',
                'title' => 'Benguela: fundação colonial e porto atlântico',
                'narrative_text' => 'Fundada a 17 de Maio de 1617 por Manuel Cerveira Pereira, Benguela foi eixo da '
                    .'penetração mercantil colonial na costa sudoeste africana e um dos principais portos do tráfico '
                    .'transatlântico de escravos. A sociedade é dominada pela etnia Ovimbundu (Umbundu), com minorias '
                    .'Ohvanyaneka, e é conhecida pela tradição musical, folclórica e pelas festividades urbanas.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'BGU',
                'title' => 'Benguela: Corredor do Lobito e CFB',
                'narrative_text' => 'O Corredor do Lobito — Porto de Águas Profundas e Caminho de Ferro de Benguela — '
                    .'liga Angola à RDC e à Zâmbia para o escoamento de cobre e cobalto. A província destaca-se ainda '
                    .'nas pescas (Baía Farta e Lobito), na metalomecânica, cimenteira, açúcar na Catumbela e no turismo '
                    .'de praia. É um dos círculos eleitorais mais disputados do país.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Bié
            [
                'code' => 'BIE',
                'title' => 'Bié: Reino, cerco do Cuito e guerra civil',
                'narrative_text' => 'Instituída a 1 de Maio de 1922 e associada ao antigo Reino do Bié, a província foi '
                    .'um dos palcos mais destruídos do conflito civil. A capital Cuito sofreu um cerco prolongado com '
                    .'milhares de mortes e destruição quase total da malha urbana. A população Ovimbundu (Umbundu), com '
                    .'forte presença Bailundo, preserva as ombalas na resolução de conflitos comunitários.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'BIE',
                'title' => 'Bié: planalto agrícola e Caminho de Ferro',
                'narrative_text' => 'A economia biena assenta em solos planálticos férteis — batata, milho, feijão, arroz '
                    .'e café arábica. O Caminho de Ferro de Benguela reactiva o escoamento e a introdução de factores de '
                    .'produção. Há também potencial em ferro e caulino. A administração local prioriza estradas secundárias, '
                    .'desminagem e reinserção de antigos combatentes e deslocados.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Cabinda
            [
                'code' => 'CAB',
                'title' => 'Cabinda: Simulambuco e identidade Bakongo',
                'narrative_text' => 'Exclave angolano entre o Congo e a RDC, Cabinda foi formalizada pelo Tratado de '
                    .'Simulambuco (1 de Fevereiro de 1885), elevando o protetorado a distrito. O povo Bakongo (Kikongo/Fiote '
                    .'ou Ibinda) afirma identidade cultural própria — rituais, danças do Bakama e ligação ao mar e à floresta. '
                    .'A região mantém complexidade política ligada a reivindicações históricas de autonomia.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'CAB',
                'title' => 'Cabinda: petróleo offshore e Floresta do Mayombe',
                'narrative_text' => 'As reservas de petróleo offshore sustentam grande parte das receitas de exportação '
                    .'e do Orçamento Geral do Estado. A Floresta do Mayombe é uma das reservas de biodiversidade mais '
                    .'importantes do mundo, com potencial de madeiras nobres e ecoturismo. Programas de reinvestimento '
                    .'local das receitas petrolíferas acompanham a gestão da segurança nacional na região.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Cuando
            [
                'code' => 'CUA',
                'title' => 'Cuando: Lei 14/24 e Terras do Fim do Mundo',
                'narrative_text' => 'Criada a 1 de Janeiro de 2025 pela Lei n.º 14/24 a partir da metade oriental do antigo '
                    .'Cuando Cubango, com capital em Mavinga. Historicamente isolada — as "Terras do Fim do Mundo" — pela '
                    .'escassa densidade populacional e ausência de vias consolidadas. A população Ovanganguela (Nganguela/'
                    .'Xindonga) vive da caça, pesca fluvial e agricultura de subsistência.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'CUA',
                'title' => 'Cuando: KAZA, pecuária e Cuito Cuanavale',
                'narrative_text' => 'A economia assenta na criação de gado bovino, caprino e ovino, com potencial agropecuário '
                    .'e de ecoturismo no corredor de conservação Okavango-Zambeze (KAZA). O município do Cuito Cuanavale '
                    .'foi palco da maior batalha terrestre contemporânea de África (anos 1980). O desafio actual é instalar '
                    .'a estrutura provincial em Mavinga e assegurar saúde e ensino às populações dispersas.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Cuanza Norte
            [
                'code' => 'CNO',
                'title' => 'Cuanza Norte: penetração colonial no vale do Cuanza',
                'narrative_text' => 'Criada a 15 de Agosto de 1914, com sede em Cazengo (N\'dalatando), a província foi '
                    .'ponto avançado da penetração colonial ao longo do vale do Cuanza, base do comércio entre o litoral '
                    .'de Luanda e os reinos do interior. A população Ambundu (Kimbundu) partilha festividades e ritos '
                    .'tradicionais com Malanje.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'CNO',
                'title' => 'Cuanza Norte: Cambambe, Laúca e café robusta',
                'narrative_text' => 'O motor económico reside nos recursos hídricos do Cuanza — aproveitamentos como '
                    .'Cambambe e a proximidade de Laúca, pilares da segurança energética nacional. No sector primário '
                    .'destacam-se café robusta, mandioca, milho e fruteiras tropicais. A governação procura atrair '
                    .'indústrias transformadoras ao longo do eixo que liga Luanda às Lundas e a Malanje.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Cuanza Sul
            [
                'code' => 'CSU',
                'title' => 'Cuanza Sul: da costa atlântica ao planalto',
                'narrative_text' => 'Criada a 15 de Setembro de 1914, com capital no Sumbe, a província estende-se das '
                    .'praias e planícies áridas da costa às terras altas do interior. É encruzilhada cultural Ambundu e '
                    .'Ovimbundu (Kimbundu e Umbundu), com ritos agrários ligados ao início das chuvas.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'CSU',
                'title' => 'Cuanza Sul: celeiro de Cela, pesca e sal',
                'narrative_text' => 'O planalto de Cela (Waku Kungo) acolhe agro-negócio de milho, soja, leite, queijo e '
                    .'carne — um dos maiores celeiros de Angola. No litoral, pesca e sal marinho geram receitas; no '
                    .'interior há gesso e calcário para cimento. A reabilitação da EN 100 visa abastecer Luanda sem '
                    .'entraves.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Cubango
            [
                'code' => 'CUB',
                'title' => 'Cubango: Menongue e herança do Cuando Cubango',
                'narrative_text' => 'Oficializada a 1 de Janeiro de 2025 pela Lei n.º 14/24, herdou a capital Menongue '
                    .'(antiga Serpa Pinto), guarnição avançada e terminal do Caminho de Ferro de Moçâmedes. A população '
                    .'é majoritariamente Ovanganguela (Nganguela), com minorias Cokwe.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'CUB',
                'title' => 'Cubango: ouro verde e desminagem',
                'narrative_text' => 'A economia assenta na madeira nobre ("ouro verde") e na logística ferroviária a partir '
                    .'de Moçâmedes. A desminagem permanece crítica — mais de 245 áreas com engenhos explosivos da guerra '
                    .'civil. A prioridade é agricultura comercial na bacia do Cubango para reduzir a dependência alimentar '
                    .'face à Namíbia.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Cunene
            [
                'code' => 'CNN',
                'title' => 'Cunene: fronteira sul, seca e Ovambo',
                'narrative_text' => 'Autonomizada a 10 de Julho de 1970, com sede em Cuanhama (Ondjiva), na fronteira com '
                    .'a Namíbia. O clima semiárido e as secas cíclicas marcam a sobrevivência das populações. A etnia '
                    .'Ovambo (Oshiwambo) mantém lideranças tradicionais fortes, como os soberanos do Cuanhama.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'CNN',
                'title' => 'Cunene: pecuária, Canal do Cafu e Santa Clara',
                'narrative_text' => 'A pecuária pastoralista concentra o maior efectivo bovino do país — principal indicador '
                    .'de riqueza local. O Canal do Cafu transfere água do rio Cunene para pastagens e consumo. O comércio '
                    .'transfronteiriço em Santa Clara é o outro pilar económico, juntamente com a gestão da ajuda '
                    .'humanitária nas secas.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Huambo
            [
                'code' => 'HUA',
                'title' => 'Huambo: Nova Lisboa e Reino do Bailundo',
                'narrative_text' => 'Fundada a 8 de Agosto de 1912 por Norton de Mattos como Nova Lisboa, pensada como '
                    .'possível capital colonial pelo clima de altitude. É berço do Reino do Bailundo e de monarquias '
                    .'tradicionais Ovimbundu (Umbundu). A guerra civil destruiu indústrias e academias com bombardeamentos '
                    .'e combates urbanos.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'HUA',
                'title' => 'Huambo: agricultura, CFB e polo universitário',
                'narrative_text' => 'A reconstrução agrícola — milho, soja, feijão, batata e fruteiras de clima temperado — '
                    .'e a reactivação do Caminho de Ferro de Benguela devolveram fôlego logístico. O Huambo é o principal '
                    .'polo universitário e científico do planalto central e um círculo eleitoral de elevada participação '
                    .'cívica.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Huíla
            [
                'code' => 'HUI',
                'title' => 'Huíla: Lubango e Serra da Chela',
                'narrative_text' => 'Criada a 2 de Setembro de 1901, a Huíla é o motor económico do sul. O Lubango situa-se '
                    .'numa bacia planáltica delimitada pela Serra da Chela, entre a costa árida e o interior fértil. '
                    .'Nyaneka-Humbi (Olunhaneka) e Ovimbundu partilham o território. O turismo destaca a Fenda da Tundavala '
                    .'e o Miradouro da Serra da Chela.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'HUI',
                'title' => 'Huíla: granito negro, pecuária e logística sul',
                'narrative_text' => 'A economia combina pedras ornamentais (granito negro de renome mundial), pecuária de '
                    .'corte, bebidas, cimenteira e metalurgia. O Lubango é o maior polo comercial, financeiro e universitário '
                    .'do sul, consolidando-se como centro de distribuição para a Namíbia e o interior sul angolano.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Ícolo e Bengo
            [
                'code' => 'ICB',
                'title' => 'Ícolo e Bengo: Catete e berço de Agostinho Neto',
                'narrative_text' => 'Elevada a província pela Lei n.º 14/24, com sede em Catete, nasceu do desmembramento '
                    .'de Luanda (cerca de 17.234 km²). Berço de António Agostinho Neto, primeiro Presidente de Angola, '
                    .'a população Ambundu (Kimbundu) afirma identidade ligada à luta pela independência e à '
                    .'descentralização do planeamento metropolitano.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'ICB',
                'title' => 'Ícolo e Bengo: Quiminha, Sequele e Bom Jesus',
                'narrative_text' => 'A economia agroindustrial inclui o mega-projecto da Quiminha, que abastece Luanda de '
                    .'hortícolas, e polos industriais no Sequele e Bom Jesus. O potencial de arrecadação local é elevado, '
                    .'sustentando previsões orçamentais robustas. A institucionalização provincial consolidou-se com a '
                    .'nova estrutura de governação em 2025.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Luanda
            [
                'code' => 'LUA',
                'title' => 'Luanda: fundação de 1576 e capital da República',
                'narrative_text' => 'Fundada por Paulo Dias de Novais a 25 de Janeiro de 1576, Luanda acolhe a capital '
                    .'política, administrativa e financeira de Angola. Após a Lei n.º 14/24 ficou reduzida ao núcleo '
                    .'metropolitano com sede na Ingombota. A sociedade é cosmopolita e pluriétnica, com matriz Kimbundu '
                    .'Ambundu e falantes de todas as línguas nacionais.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'LUA',
                'title' => 'Luanda: porto, finanças e pressão urbana',
                'narrative_text' => 'Concentra sedes de empresas públicas, bancos e multinacionais petrolíferas e '
                    .'diamantíferas, o Porto de Luanda e polos em Cacuaco, Viana e Cazenga. O crescimento desordenado '
                    .'pressiona água, energia e saneamento. É o círculo eleitoral mais importante e volátil do país.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Lunda Norte
            [
                'code' => 'LNO',
                'title' => 'Lunda Norte: Dundo, fronteira e povo Cokwe',
                'narrative_text' => 'Instituída a 4 de Julho de 1978 com capital no Dundo, após a cisão da antiga Lunda. '
                    .'Partilha fronteira porosa com a RDC. A matriz etnolinguística é Cokwe (Tchokwé). O Museu do Dundo '
                    .'e a escrita na areia (Sona) preservam o maior acervo de arte Cokwe de África.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'LNO',
                'title' => 'Lunda Norte: diamantes e diversificação agrícola',
                'narrative_text' => 'A economia liga-se a diamantes aluvionares e quimberlíticos, confrontada com garimpo '
                    .'ilegal e dinâmicas transfronteiriças. A governação foca a contenção da imigração ilegal e a criação '
                    .'de polos agrícolas para diversificar a economia mineira.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Lunda Sul
            [
                'code' => 'LSU',
                'title' => 'Lunda Sul: Saurimo e tradição Cokwe',
                'narrative_text' => 'Instituída a 13 de Julho de 1895, com sede em Saurimo, no planalto lunda. A população '
                    .'é Cokwe (Tchokwé). Saurimo é coração cultural e espiritual da tradição Cokwe, com rituais de '
                    .'iniciação Mukanda de elevado valor antropológico.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'LSU',
                'title' => 'Lunda Sul: Catoca e Polo Diamantífero',
                'narrative_text' => 'A Sociedade Mineira de Catoca é uma das maiores chaminés quimberlíticas a céu aberto '
                    .'do mundo. O Polo Diamantífero de Saurimo congrega lapidação e formação técnica. A agricultura de '
                    .'subsistência assenta na mandioca e no milho; a sociedade civil pressiona por distribuição mais '
                    .'equitativa das receitas dos diamantes.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Malanje
            [
                'code' => 'MAL',
                'title' => 'Malanje: Ndongo, Matamba e Rainha Nzinga',
                'narrative_text' => 'Instituída a 13 de Fevereiro de 1868, Malanje herda o Reino de Ndongo e de Matamba e '
                    .'a memória da Rainha Nzinga Mbandi, símbolo de resistência à ocupação colonial. A população Ambundu '
                    .'(Kimbundu) preserva linhagens ligadas ao Ndongo.',
                'period' => 'pré-colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'MAL',
                'title' => 'Malanje: Capanda, Kalandula e Palanca Negra',
                'narrative_text' => 'O Polo Agroindustrial de Capanda e a barragem no Cuanza sustentam cereais e cana-de-açúcar. '
                    .'O turismo destaca as Quedas de Kalandula, as Pedras Negras de Pungo Andongo e a Reserva do Luando — '
                    .'habitat da Palanca Negra Gigante, símbolo nacional. A governação prioriza estradas do norte e cultivo '
                    .'familiar de mandioca e milho.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Moxico
            [
                'code' => 'MOX',
                'title' => 'Moxico: Luena e legado da guerra civil',
                'narrative_text' => 'Com capital no Luena, o Moxico foi base operacional na guerra civil, que culminou no '
                    .'falecimento de Jonas Savimbi em 2002. Cokwe, Luchazi e Ovimbundu partilham aldeias ao longo da bacia '
                    .'do Zambeze. A desminagem condiciona o investimento agrícola privado.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'MOX',
                'title' => 'Moxico: mel, floresta e Caminho de Ferro de Benguela',
                'narrative_text' => 'A economia assenta no mel, cereais, mandioca e floresta sustentável. O Caminho de Ferro '
                    .'de Benguela liga o litoral ao leste isolado. A administração foca a reconstrução de Luena, estradas '
                    .'para as Lundas e desminagem das terras de camponeses.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Moxico Leste
            [
                'code' => 'MLX',
                'title' => 'Moxico Leste: Cazombo e povos Lunda Ndembo',
                'narrative_text' => 'Instituída a 1 de Janeiro de 2025 pela Lei n.º 14/24, com sede em Cazombo, na fronteira '
                    .'com a Zâmbia e a RDC. A sociedade preserva a identidade Lunda Ndembo e Luvale. O Festival Tradicional '
                    .'do Povo Lunda Ndembo e a Rainha Nyakatolo Ngambo marcam a vida sociocultural.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'MLX',
                'title' => 'Moxico Leste: cobre, Luau e energia solar',
                'narrative_text' => 'Calunda (Macondo) revela potencial de cobre no Copperbelt da África Central. O Polo '
                    .'Industrial do Luau liga-se ao Corredor do Lobito. Parques fotovoltaicos em Cazombo e Luau combatem '
                    .'a carência eléctrica rural, reforçando o novo eixo geopolítico do leste angolano.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Namibe
            [
                'code' => 'NAM',
                'title' => 'Namibe: Moçâmedes, deserto e Atlântico',
                'narrative_text' => 'Fundada em 1840 como Moçâmedes, a província une Oceano Atlântico e Deserto do Namibe. '
                    .'Povos Herero e Nyaneka (Oluherero) mantêm pastoralismo nómada. O projecto educativo Okulinonga leva '
                    .'escolas móveis às comunidades fustigadas pelas secas.',
                'period' => 'contemporâneo',
                'display_order' => 1,
            ],
            [
                'code' => 'NAM',
                'title' => 'Namibe: pescas, Iona e Caminho de Ferro',
                'narrative_text' => 'Moçâmedes e Tômbua são portos pesqueiros de referência. Mármores, granitos e o Caminho '
                    .'de Ferro de Moçâmedes escoam a produção da Huíla. O Parque Nacional do Iona e a lagoa do Arco atraem '
                    .'turismo. A governação prioriza modernização portuária e combate aos efeitos da seca.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Uíge
            [
                'code' => 'UIG',
                'title' => 'Uíge: café robusta e norte Bakongo',
                'narrative_text' => 'Estabelecida a 15 de Agosto de 1914, o Uíge foi o maior polo de café robusta no período '
                    .'colonial tardio (década de 1970). A matriz Bakongo (Kikongo) preserva linhagens régias e clãs '
                    .'comunitários no extremo norte do país.',
                'period' => 'colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'UIG',
                'title' => 'Uíge: agricultura familiar e minerais',
                'narrative_text' => 'Hoje fornece mandioca, batata-doce, feijão, amendoim e banana, com revitalização '
                    .'cafeeira e eixos logísticos para Luanda. Há jazigos promissores de cobre, ouro e zinco. A administração '
                    .'prioriza tecnologias de informação na formação da juventude e o ordenamento urbano.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],

            // Zaire (sem secção própria no documento — síntese a partir da tabela e contexto bakongo/Reino do Congo)
            [
                'code' => 'ZAI',
                'title' => 'Zaire: M\'banza-Kongo e Reino do Congo',
                'narrative_text' => 'Com sede em M\'banza-Kongo — antiga capital do Reino do Congo e Património Mundial da '
                    .'UNESCO — a província do Zaire liga a história pré-colonial à fronteira com a RDC. Foi eixo político '
                    .'e espiritual bakongo; a Lei n.º 14/24 manteve-a no quadro das 21 unidades administrativas.',
                'period' => 'pré-colonial',
                'display_order' => 1,
            ],
            [
                'code' => 'ZAI',
                'title' => 'Zaire: identidade Kikongo e fronteira norte',
                'narrative_text' => 'A província combina memória histórica, comércio transfronteiriço e identidade Kikongo. '
                    .'Com cerca de 40.130 km² e onze municípios na nova divisão, integra o ordenamento político-administrativo '
                    .'de 2025, aproximando o Estado das comunidades do extremo norte-oeste de Angola.',
                'period' => 'contemporâneo',
                'display_order' => 2,
            ],
        ];
    }
}
