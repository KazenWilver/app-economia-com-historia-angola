<?php

namespace App\Http\Requests\Concerns;

trait ValidatesContentMedia
{
    /**
     * @return array<string, mixed>
     */
    protected function mediaRules(): array
    {
        return [
            'media' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,webp,gif,mp3,wav,ogg,m4a,aac,mp4,webm,mov',
                'max:102400',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function mediaMessages(): array
    {
        return [
            'media.file' => 'O ficheiro de media é inválido.',
            'media.mimes' => 'O ficheiro deve ser imagem (JPEG, PNG, WebP, GIF), áudio (MP3, WAV, OGG, M4A, AAC) ou vídeo (MP4, WebM, MOV).',
            'media.max' => 'O ficheiro não pode exceder 100 MB.',
        ];
    }
}
