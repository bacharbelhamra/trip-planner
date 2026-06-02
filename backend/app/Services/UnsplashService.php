<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class UnsplashService
{
    public function searchImages(string $query, int $perPage = 10): array
    {
        $response = Http::get('https://api.unsplash.com/search/photos', [
            'query'    => $query,
            'per_page' => $perPage,
            'client_id' => config('services.unsplash.access_key'),
        ]);

        if (!$response->successful()) return [];

        return collect($response->json('results', []))->map(fn($photo) => [
            'id'          => $photo['id'],
            'url'         => $photo['urls']['regular'],
            'thumb'       => $photo['urls']['small'],
            'description' => $photo['alt_description'] ?? $query,
            'credit'      => $photo['user']['name'] ?? 'Unsplash',
        ])->all();
    }
}
