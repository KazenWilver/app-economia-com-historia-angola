<?php

namespace App\Http\Requests\Concerns;

trait ValidatesContentMedia
{
    /**
     * @return list<string>
     */
    protected function allowedMimesForContentType(string $type): array
    {
        return match ($type) {
            'audio', 'podcast' => ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
            'video' => ['mp4', 'webm', 'mov'],
            'texto', 'jindungo' => ['jpeg', 'jpg', 'png', 'webp', 'gif'],
            default => ['jpeg', 'jpg', 'png', 'webp', 'gif', 'mp3', 'wav', 'ogg', 'm4a', 'aac', 'mp4', 'webm', 'mov'],
        };
    }

    protected function mediaMimeDescriptionForType(string $type): string
    {
        return match ($type) {
            'audio', 'podcast' => 'áudio (MP3, WAV, OGG, M4A, AAC)',
            'video' => 'vídeo (MP4, WebM, MOV)',
            'texto' => 'imagem (JPEG, PNG, WebP, GIF)',
            'jindungo' => 'imagem de capa (JPEG, PNG, WebP, GIF)',
            default => 'imagem, áudio ou vídeo',
        };
    }

    /**
     * @return array<string, mixed>
     */
    protected function mediaRules(): array
    {
        $type = (string) $this->input('type', 'texto');
        $mimes = implode(',', $this->allowedMimesForContentType($type));

        return [
            'media' => [
                'nullable',
                'file',
                "mimes:{$mimes}",
                'max:102400',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function mediaMessages(): array
    {
        $type = (string) $this->input('type', 'texto');
        $description = $this->mediaMimeDescriptionForType($type);

        return [
            'media.file' => 'O upload falhou. Verifica o tamanho do ficheiro (máx. 100 MB) e o formato permitido para o tipo seleccionado.',
            'media.mimes' => "Para o tipo seleccionado, o ficheiro deve ser {$description}.",
            'media.max' => 'O ficheiro não pode exceder 100 MB.',
        ];
    }
}
