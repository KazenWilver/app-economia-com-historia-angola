<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', implode(',', [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
    ])))),

    'allowed_origins_patterns' => [
        '#^exp://#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Accept-Ranges', 'Content-Range', 'Content-Length'],

    'max_age' => 86400,

    'supports_credentials' => true,

];
