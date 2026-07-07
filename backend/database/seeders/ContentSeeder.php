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
                'body' => 'Este texto apresenta as transformações económicas de Angola desde 1975, com foco na transição do colonialismo para um Estado soberano e nos desafios do desenvolvimento nacional.',
                'type' => 'texto',
                'category_slug' => 'economia',
                'is_exclusive' => false,
                'media_url' => null,
            ],
            [
                'title' => 'Petróleo e diversificação económica em Angola',
                'slug' => 'petroleo-e-diversificacao-economica',
                'body' => 'Análise do papel do petróleo na economia angolana e das políticas de diversificação para reduzir a dependência de uma única fonte de receita.',
                'type' => 'texto',
                'category_slug' => 'economia',
                'is_exclusive' => false,
                'media_url' => null,
            ],
            [
                'title' => 'Podcast: História do comércio em Benguela',
                'slug' => 'podcast-historia-comercio-benguela',
                'body' => 'Episódio sobre o papel de Benguela no comércio regional e nas rotas históricas que ligaram o interior de Angola ao litoral.',
                'type' => 'podcast',
                'category_slug' => 'historia',
                'is_exclusive' => false,
                'media_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            ],
            [
                'title' => 'Áudio: Agricultura familiar no Planalto',
                'slug' => 'audio-agricultura-familiar-planalto',
                'body' => 'Testemunhos sobre práticas agrícolas, ciclos de produção e a importância da agricultura familiar para a segurança alimentar.',
                'type' => 'audio',
                'category_slug' => 'sociedade',
                'is_exclusive' => false,
                'media_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            ],
            [
                'title' => 'Vídeo: O porto de Luanda ao longo dos séculos',
                'slug' => 'video-porto-de-luanda',
                'body' => 'Documentário curto sobre a evolução do porto de Luanda como centro logístico, comercial e estratégico para Angola.',
                'type' => 'video',
                'category_slug' => 'geografia',
                'is_exclusive' => false,
                'media_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            ],
            [
                'title' => 'Jindungo: Memórias da independência em Cabinda',
                'slug' => 'jindungo-memorias-independencia-cabinda',
                'body' => 'Texto exclusivo Jindungo com narrativas locais sobre identidade, território e memória colectiva em Cabinda. Disponível apenas para utilizadores registados.',
                'type' => 'jindungo',
                'category_slug' => 'historia',
                'is_exclusive' => true,
                'media_url' => null,
            ],
            [
                'title' => 'Jindungo: Economia criativa em Luanda',
                'slug' => 'jindungo-economia-criativa-luanda',
                'body' => 'Reflexão exclusiva sobre empreendedorismo cultural, música, moda e novas oportunidades económicas na capital angolana.',
                'type' => 'jindungo',
                'category_slug' => 'cultura',
                'is_exclusive' => true,
                'media_url' => null,
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
                    'statistics_data' => null,
                    'is_exclusive' => $item['is_exclusive'],
                    'status' => 'published',
                    'view_count' => 0,
                    'published_at' => now()->subDays(random_int(1, 30)),
                ]
            );
        }
    }
}
