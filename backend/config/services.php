<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | LLM para geração de quizzes (API OpenAI-compatível)
    |--------------------------------------------------------------------------
    |
    | Escolha recomendada para este projecto: Groq (rápida, barata, PT OK).
    | Ordem de resolução se LLM_PROVIDER=auto: groq → openrouter → google → nvidia
    |
    */
    'llm' => [
        'provider' => env('LLM_PROVIDER', 'groq'),
        'groq' => [
            'key' => env('GROQ_KEY', env('GROQ_API_KEY')),
            'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
            'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
        ],
        'openrouter' => [
            'key' => env('OPENROUTER_KEY', env('OPENROUTER_API_KEY')),
            'model' => env('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct'),
            'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
        ],
        'google' => [
            'key' => env('GOOGLE_AI_KEY', env('GOOGLE_API_KEY')),
            'model' => env('GOOGLE_AI_MODEL', 'gemini-2.0-flash'),
            'base_url' => env(
                'GOOGLE_AI_BASE_URL',
                'https://generativelanguage.googleapis.com/v1beta/openai'
            ),
        ],
        'nvidia' => [
            'key' => env('NVIDIA_KEY', env('NVIDIA_API_KEY')),
            'model' => env('NVIDIA_MODEL', 'meta/llama-3.3-70b-instruct'),
            'base_url' => env('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
        ],
    ],

];
