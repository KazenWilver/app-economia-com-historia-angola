<?php

namespace App\Services;

use App\Models\Content;
use App\Models\TutorExchange;
use App\Models\User;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class TutorRagService
{
    private const MAX_CONTEXT_CHARS = 4500;

    private const TOP_K = 3;

    /**
     * @return array{
     *     exchange: TutorExchange,
     *     answer: string,
     *     sources: list<array{id: int, title: string, slug: string, excerpt: string}>,
     *     provider: string
     * }
     */
    public function ask(User $user, string $question, ?int $contentId = null): array
    {
        $question = trim($question);
        if ($question === '') {
            throw new RuntimeException('A pergunta não pode estar vazia.');
        }

        $focusedContent = null;
        if ($contentId !== null) {
            $focusedContent = Content::query()
                ->whereKey($contentId)
                ->where('status', 'published')
                ->first();

            if ($focusedContent === null) {
                throw new RuntimeException('O conteúdo seleccionado não está publicado.');
            }
        }

        $retrieved = $this->retrieveRelevantContents($question, $focusedContent);
        $sources = $this->buildSources($retrieved);
        $context = $this->buildContext($retrieved);

        $credential = $this->resolveLlmCredential();
        $provider = 'heuristic';
        $answer = null;

        if ($credential !== null && $context !== '') {
            try {
                $answer = $this->generateWithChatApi(
                    question: $question,
                    context: $context,
                    apiKey: $credential['key'],
                    model: $credential['model'],
                    baseUrl: $credential['base_url'],
                    provider: $credential['provider'],
                );
                $provider = $credential['provider'];
            } catch (\Throwable) {
                $answer = null;
            }
        }

        if ($answer === null) {
            $answer = $this->generateHeuristically($question, $retrieved);
            $provider = 'heuristic';
        }

        $exchange = TutorExchange::query()->create([
            'user_id' => $user->id,
            'content_id' => $focusedContent?->id,
            'question' => $question,
            'answer' => $answer,
            'sources' => $sources,
            'provider' => $provider,
        ]);

        return [
            'exchange' => $exchange,
            'answer' => $answer,
            'sources' => $sources,
            'provider' => $provider,
        ];
    }

    /**
     * @return Collection<int, Content>
     */
    private function retrieveRelevantContents(string $question, ?Content $focused): Collection
    {
        if ($focused !== null) {
            return collect([$focused]);
        }

        $tokens = $this->tokenize($question);
        $candidates = Content::query()
            ->select(['id', 'title', 'slug', 'body', 'type', 'is_exclusive', 'published_at'])
            ->where('status', 'published')
            ->whereNotNull('body')
            ->latest('published_at')
            ->limit(40)
            ->get();

        if ($candidates->isEmpty()) {
            return collect();
        }

        $scored = $candidates
            ->map(function (Content $content) use ($tokens, $question): array {
                $plain = $this->plainText((string) $content->body);
                $haystack = mb_strtolower($content->title.' '.$plain);
                $score = 0;

                foreach ($tokens as $token) {
                    if (Str::contains($haystack, $token)) {
                        $score += Str::contains(mb_strtolower($content->title), $token) ? 3 : 1;
                    }
                }

                if (Str::contains($haystack, mb_strtolower($question))) {
                    $score += 5;
                }

                return ['content' => $content, 'score' => $score];
            })
            ->sortByDesc('score')
            ->values();

        $top = $scored
            ->filter(fn (array $row): bool => $row['score'] > 0)
            ->take(self::TOP_K)
            ->pluck('content');

        if ($top->isNotEmpty()) {
            return $top;
        }

        return $candidates->take(self::TOP_K);
    }

    /**
     * @param  Collection<int, Content>  $contents
     * @return list<array{id: int, title: string, slug: string, excerpt: string}>
     */
    private function buildSources(Collection $contents): array
    {
        return $contents->map(function (Content $content): array {
            $plain = $this->plainText((string) $content->body);

            return [
                'id' => $content->id,
                'title' => $content->title,
                'slug' => $content->slug,
                'excerpt' => Str::limit($plain, 160, '…'),
            ];
        })->values()->all();
    }

    /**
     * @param  Collection<int, Content>  $contents
     */
    private function buildContext(Collection $contents): string
    {
        $parts = [];
        $used = 0;

        foreach ($contents as $index => $content) {
            $plain = $this->plainText((string) $content->body);
            if ($plain === '') {
                continue;
            }

            $header = 'FONTE '.($index + 1).': '.$content->title.' (slug: '.$content->slug.")\n";
            $remaining = self::MAX_CONTEXT_CHARS - $used - mb_strlen($header);
            if ($remaining < 80) {
                break;
            }

            $chunk = mb_substr($plain, 0, $remaining);
            $parts[] = $header.$chunk;
            $used += mb_strlen($header) + mb_strlen($chunk);
        }

        return implode("\n\n---\n\n", $parts);
    }

    /**
     * @param  Collection<int, Content>  $contents
     */
    private function generateHeuristically(string $question, Collection $contents): string
    {
        if ($contents->isEmpty()) {
            return 'Ainda não há conteúdos publicados suficientes para responder com confiança. '
                .'Explora a biblioteca em /explorar e volta a perguntar.';
        }

        /** @var Content $best */
        $best = $contents->first();
        $plain = $this->plainText((string) $best->body);
        $tokens = $this->tokenize($question);
        $sentences = preg_split('/(?<=[.!?])\s+/u', $plain) ?: [];

        $bestSentence = null;
        $bestScore = -1;
        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if (mb_strlen($sentence) < 40) {
                continue;
            }
            $lower = mb_strtolower($sentence);
            $score = 0;
            foreach ($tokens as $token) {
                if (Str::contains($lower, $token)) {
                    $score++;
                }
            }
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestSentence = $sentence;
            }
        }

        $excerpt = $bestSentence
            ? Str::limit($bestSentence, 280, '…')
            : Str::limit($plain, 280, '…');

        return "Com base no conteúdo «{$best->title}»: {$excerpt}\n\n"
            .'Nota: esta resposta foi construída a partir da biblioteca publicada '
            .'(modo local). Com a API Groq activa, o tutor elabora uma explicação mais completa.';
    }

    private function generateWithChatApi(
        string $question,
        string $context,
        string $apiKey,
        string $model,
        string $baseUrl,
        string $provider,
    ): string {
        $headers = [];
        if ($provider === 'openrouter') {
            $headers['HTTP-Referer'] = (string) config('app.url', 'http://localhost');
            $headers['X-Title'] = (string) config('app.name', 'Economia com Historia');
        }

        $response = Http::withToken($apiKey)
            ->withHeaders($headers)
            ->timeout(45)
            ->acceptJson()
            ->post("{$baseUrl}/chat/completions", [
                'model' => $model,
                'temperature' => 0.3,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'És o tutor educativo da plataforma «Economia com História – Angola». '
                            .'Responde em português de Portugal, de forma clara e pedagógica. '
                            .'Usa APENAS o contexto fornecido (conteúdos publicados). '
                            .'Se o contexto não cobrir a pergunta, diz honestamente que não encontraste base suficiente '
                            .'e sugere explorar a biblioteca. Não inventes factos. '
                            .'Responde apenas JSON: {"answer":"..."}',
                    ],
                    [
                        'role' => 'user',
                        'content' => "CONTEXTO DA BIBLIOTECA:\n{$context}\n\nPERGUNTA DO ALUNO:\n{$question}",
                    ],
                ],
            ]);

        if (! $response->successful()) {
            throw new RequestException($response);
        }

        $content = data_get($response->json(), 'choices.0.message.content');
        if (! is_string($content) || $content === '') {
            throw new RuntimeException('Resposta de IA vazia.');
        }

        /** @var array<string, mixed> $decoded */
        $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        $answer = trim((string) ($decoded['answer'] ?? ''));

        if ($answer === '') {
            throw new RuntimeException('A IA não devolveu uma resposta válida.');
        }

        return $answer;
    }

    /**
     * @return array{provider: string, key: string, model: string, base_url: string}|null
     */
    private function resolveLlmCredential(): ?array
    {
        $preferred = strtolower((string) config('services.llm.provider', 'groq'));
        $order = $preferred === 'auto'
            ? ['groq', 'openrouter', 'google', 'nvidia']
            : [$preferred, 'groq', 'openrouter', 'google', 'nvidia'];

        $seen = [];
        foreach ($order as $provider) {
            if (isset($seen[$provider])) {
                continue;
            }
            $seen[$provider] = true;

            $config = config("services.llm.{$provider}");
            if (! is_array($config)) {
                continue;
            }

            $key = $config['key'] ?? null;
            if (! is_string($key) || trim($key) === '') {
                continue;
            }

            return [
                'provider' => $provider,
                'key' => trim($key),
                'model' => (string) ($config['model'] ?? 'llama-3.3-70b-versatile'),
                'base_url' => rtrim((string) ($config['base_url'] ?? ''), '/'),
            ];
        }

        return null;
    }

    private function plainText(string $html): string
    {
        $text = trim(html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return preg_replace('/\s+/u', ' ', $text) ?? $text;
    }

    /**
     * @return list<string>
     */
    private function tokenize(string $text): array
    {
        $normalized = mb_strtolower($text);
        $parts = preg_split('/[^\p{L}\p{N}]+/u', $normalized) ?: [];
        $stop = [
            'a', 'as', 'o', 'os', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'um', 'uma',
            'para', 'por', 'com', 'que', 'qual', 'quais', 'como', 'sobre', 'na', 'no',
            'me', 'explica', 'explique', 'diz', 'diga', 'o', 'que', 'é', 'sao', 'são',
        ];

        $tokens = [];
        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '' || mb_strlen($part) < 3 || in_array($part, $stop, true)) {
                continue;
            }
            $tokens[$part] = $part;
        }

        return array_values($tokens);
    }
}
