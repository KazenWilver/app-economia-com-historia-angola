<?php

namespace App\Services;

use App\Models\Content;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class QuizGenerationService
{
    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     time_limit_seconds: int,
     *     is_active: bool,
     *     questions: list<array{
     *         question_text: string,
     *         explanation: string|null,
     *         order: int,
     *         answers: list<array{answer_text: string, is_correct: bool, order: int}>
     *     }>,
     *     meta: array{provider: string, source_title: string|null}
     * }
     */
    public function generateFromContent(Content $content, int $questionCount = 4): array
    {
        $sourceText = trim(strip_tags((string) $content->body));

        if ($sourceText === '') {
            throw new RuntimeException('O conteúdo seleccionado não tem texto suficiente para gerar perguntas.');
        }

        return $this->generate(
            sourceText: $sourceText,
            sourceTitle: $content->title,
            questionCount: $questionCount,
        );
    }

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     time_limit_seconds: int,
     *     is_active: bool,
     *     questions: list<array{
     *         question_text: string,
     *         explanation: string|null,
     *         order: int,
     *         answers: list<array{answer_text: string, is_correct: bool, order: int}>
     *     }>,
     *     meta: array{provider: string, source_title: string|null}
     * }
     */
    public function generateFromText(string $sourceText, ?string $sourceTitle, int $questionCount = 4): array
    {
        $sourceText = trim(strip_tags($sourceText));

        if (mb_strlen($sourceText) < 80) {
            throw new RuntimeException('O texto é demasiado curto para gerar um quiz útil (mínimo ~80 caracteres).');
        }

        return $this->generate(
            sourceText: $sourceText,
            sourceTitle: $sourceTitle,
            questionCount: $questionCount,
        );
    }

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     time_limit_seconds: int,
     *     is_active: bool,
     *     questions: list<array{
     *         question_text: string,
     *         explanation: string|null,
     *         order: int,
     *         answers: list<array{answer_text: string, is_correct: bool, order: int}>
     *     }>,
     *     meta: array{provider: string, source_title: string|null}
     * }
     */
    private function generate(string $sourceText, ?string $sourceTitle, int $questionCount): array
    {
        $questionCount = max(3, min(8, $questionCount));
        $credential = $this->resolveLlmCredential();

        if ($credential !== null) {
            try {
                $questions = $this->generateWithChatApi(
                    sourceText: $sourceText,
                    questionCount: $questionCount,
                    apiKey: $credential['key'],
                    model: $credential['model'],
                    baseUrl: $credential['base_url'],
                    provider: $credential['provider'],
                );

                return $this->buildPayload(
                    questions: $questions,
                    sourceTitle: $sourceTitle,
                    provider: $credential['provider'],
                );
            } catch (\Throwable) {
                // Fallback local se a API falhar.
            }
        }

        $questions = $this->generateHeuristically($sourceText, $questionCount);

        return $this->buildPayload(
            questions: $questions,
            sourceTitle: $sourceTitle,
            provider: 'heuristic',
        );
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

    /**
     * @return list<array{
     *     question_text: string,
     *     explanation: string|null,
     *     order: int,
     *     answers: list<array{answer_text: string, is_correct: bool, order: int}>
     * }>
     */
    private function generateWithChatApi(
        string $sourceText,
        int $questionCount,
        string $apiKey,
        string $model,
        string $baseUrl,
        string $provider,
    ): array {
        $truncated = mb_substr($sourceText, 0, 6000);

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
                'temperature' => 0.4,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'És um assistente educativo em português de Portugal. Gera quizzes de escolha múltipla fiéis ao texto fornecido. Responde apenas JSON válido.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Com base no texto abaixo, cria exactamente {$questionCount} perguntas de escolha múltipla sobre economia/história de Angola.\n".
                            "Cada pergunta deve ter 4 opções e exactamente 1 correcta.\n".
                            "Formato JSON: {\"questions\":[{\"question_text\":\"...\",\"explanation\":\"...\",\"answers\":[{\"answer_text\":\"...\",\"is_correct\":true}]}]}\n\n".
                            "TEXTO:\n{$truncated}",
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
        $rawQuestions = $decoded['questions'] ?? null;

        if (! is_array($rawQuestions) || $rawQuestions === []) {
            throw new RuntimeException('A IA não devolveu perguntas válidas.');
        }

        return $this->normalizeQuestions($rawQuestions);
    }

    /**
     * @return list<array{
     *     question_text: string,
     *     explanation: string|null,
     *     order: int,
     *     answers: list<array{answer_text: string, is_correct: bool, order: int}>
     * }>
     */
    private function generateHeuristically(string $sourceText, int $questionCount): array
    {
        $sentences = $this->extractSentences($sourceText);
        $candidates = array_values(array_filter(
            $sentences,
            fn (string $sentence): bool => mb_strlen($sentence) >= 40 && mb_strlen($sentence) <= 220
        ));

        if (count($candidates) < 2) {
            $candidates = array_slice($sentences, 0, max(2, $questionCount));
        }

        $distractorsPool = [
            'A dependência exclusiva do turismo de massas',
            'A proibição total do comércio externo',
            'A ausência de recursos naturais no território',
            'A substituição imediata do kwanza pelo euro',
            'O abandono completo da agricultura familiar',
            'A capitalização exclusiva no sector automóvel',
        ];

        $questions = [];
        $used = [];

        foreach ($candidates as $sentence) {
            if (count($questions) >= $questionCount) {
                break;
            }

            $keyFact = $this->extractKeyFragment($sentence);
            if ($keyFact === null || isset($used[$keyFact])) {
                continue;
            }

            $used[$keyFact] = true;
            $correct = Str::limit($keyFact, 90, '…');
            $wrong = $this->pickDistractors($distractorsPool, $correct, 3);

            $answers = [
                ['answer_text' => $correct, 'is_correct' => true, 'order' => 0],
            ];

            foreach ($wrong as $index => $option) {
                $answers[] = [
                    'answer_text' => $option,
                    'is_correct' => false,
                    'order' => $index + 1,
                ];
            }

            shuffle($answers);
            foreach ($answers as $index => &$answer) {
                $answer['order'] = $index;
            }
            unset($answer);

            $questions[] = [
                'question_text' => 'Segundo o texto, qual afirmação está correcta?',
                'explanation' => 'Com base no excerto: «'.Str::limit($sentence, 140, '…').'»',
                'order' => count($questions),
                'answers' => $answers,
            ];
        }

        // Garantir número mínimo mesmo com texto pobre.
        while (count($questions) < $questionCount) {
            $fallbackCorrect = 'A diversificação económica reduz a vulnerabilidade aos choques do petróleo';
            $answers = [
                ['answer_text' => $fallbackCorrect, 'is_correct' => true, 'order' => 0],
                ['answer_text' => 'A economia angolana não depende de recursos naturais', 'is_correct' => false, 'order' => 1],
                ['answer_text' => 'O café substituiu totalmente o petróleo em 1975', 'is_correct' => false, 'order' => 2],
                ['answer_text' => 'Luanda deixou de ser a capital após a independência', 'is_correct' => false, 'order' => 3],
            ];
            shuffle($answers);
            foreach ($answers as $index => &$answer) {
                $answer['order'] = $index;
            }
            unset($answer);

            $questions[] = [
                'question_text' => 'Qual ideia alinha melhor com a agenda de diversificação descrita nos conteúdos educativos?',
                'explanation' => 'A diversificação procura complementar o petróleo com outros sectores produtivos.',
                'order' => count($questions),
                'answers' => $answers,
            ];
        }

        // Variar o enunciado das primeiras perguntas.
        foreach ($questions as $index => &$question) {
            if ($index === 0) {
                $question['question_text'] = 'Qual destas ideias está presente no texto de origem?';
            } elseif ($index === 1) {
                $question['question_text'] = 'De acordo com o conteúdo, o que é mais correcto afirmar?';
            }
            $question['order'] = $index;
        }
        unset($question);

        return array_slice($questions, 0, $questionCount);
    }

    /**
     * @return list<string>
     */
    private function extractSentences(string $text): array
    {
        $normalized = preg_replace('/\s+/u', ' ', $text) ?? $text;
        $parts = preg_split('/(?<=[.!?])\s+/u', $normalized) ?: [];

        return array_values(array_filter(
            array_map(fn (string $part): string => trim($part), $parts),
            fn (string $part): bool => $part !== ''
        ));
    }

    private function extractKeyFragment(string $sentence): ?string
    {
        if (preg_match('/\b(19|20)\d{2}\b/u', $sentence, $yearMatch) === 1) {
            return 'Um marco temporal referido é '.$yearMatch[0];
        }

        if (preg_match('/\b(\d{1,3})\s?%\b/u', $sentence, $pctMatch) === 1) {
            return 'O texto refere cerca de '.$pctMatch[1].'% num indicador económico';
        }

        $keywords = ['petróleo', 'café', 'diamantes', 'independência', 'diversificação', 'Luanda', 'OPEP', 'agricultura', 'exportações'];
        foreach ($keywords as $keyword) {
            if (Str::contains(mb_strtolower($sentence), mb_strtolower($keyword))) {
                return Str::of($sentence)->limit(100, '…')->toString();
            }
        }

        return Str::of($sentence)->limit(100, '…')->toString();
    }

    /**
     * @param  list<string>  $pool
     * @return list<string>
     */
    private function pickDistractors(array $pool, string $correct, int $count): array
    {
        $filtered = array_values(array_filter(
            $pool,
            fn (string $item): bool => mb_strtolower($item) !== mb_strtolower($correct)
        ));
        shuffle($filtered);

        return array_slice($filtered, 0, $count);
    }

    /**
     * @param  list<mixed>  $rawQuestions
     * @return list<array{
     *     question_text: string,
     *     explanation: string|null,
     *     order: int,
     *     answers: list<array{answer_text: string, is_correct: bool, order: int}>
     * }>
     */
    private function normalizeQuestions(array $rawQuestions): array
    {
        $normalized = [];

        foreach ($rawQuestions as $index => $raw) {
            if (! is_array($raw)) {
                continue;
            }

            $questionText = trim((string) ($raw['question_text'] ?? ''));
            $answersRaw = $raw['answers'] ?? [];
            if ($questionText === '' || ! is_array($answersRaw)) {
                continue;
            }

            $answers = [];
            $hasCorrect = false;
            foreach (array_values($answersRaw) as $answerIndex => $answerRaw) {
                if (! is_array($answerRaw)) {
                    continue;
                }
                $text = trim((string) ($answerRaw['answer_text'] ?? ''));
                if ($text === '') {
                    continue;
                }
                $isCorrect = (bool) ($answerRaw['is_correct'] ?? false);
                if ($isCorrect) {
                    $hasCorrect = true;
                }
                $answers[] = [
                    'answer_text' => $text,
                    'is_correct' => $isCorrect,
                    'order' => $answerIndex,
                ];
            }

            if (count($answers) < 2 || ! $hasCorrect) {
                continue;
            }

            $normalized[] = [
                'question_text' => $questionText,
                'explanation' => isset($raw['explanation']) ? trim((string) $raw['explanation']) ?: null : null,
                'order' => $index,
                'answers' => $answers,
            ];
        }

        if ($normalized === []) {
            throw new RuntimeException('Não foi possível normalizar as perguntas geradas.');
        }

        return $normalized;
    }

    /**
     * @param  list<array{
     *     question_text: string,
     *     explanation: string|null,
     *     order: int,
     *     answers: list<array{answer_text: string, is_correct: bool, order: int}>
     * }>  $questions
     * @return array{
     *     title: string,
     *     description: string,
     *     time_limit_seconds: int,
     *     is_active: bool,
     *     questions: list<array{
     *         question_text: string,
     *         explanation: string|null,
     *         order: int,
     *         answers: list<array{answer_text: string, is_correct: bool, order: int}>
     *     }>,
     *     meta: array{provider: string, source_title: string|null}
     * }
     */
    private function buildPayload(array $questions, ?string $sourceTitle, string $provider): array
    {
        $title = $sourceTitle
            ? 'Quiz: '.$sourceTitle
            : 'Quiz gerado a partir de conteúdo';

        return [
            'title' => Str::limit($title, 120, ''),
            'description' => $sourceTitle
                ? 'Quiz gerado automaticamente a partir de «'.$sourceTitle.'». Revisa antes de publicar.'
                : 'Quiz gerado automaticamente a partir de texto fornecido. Revisa antes de publicar.',
            'time_limit_seconds' => 300,
            'is_active' => false,
            'questions' => $questions,
            'meta' => [
                'provider' => $provider,
                'source_title' => $sourceTitle,
            ],
        ];
    }
}
