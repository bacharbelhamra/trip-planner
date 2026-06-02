<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqService
{
    private string $apiKey;
    private string $model = 'llama-3.3-70b-versatile';

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key');
    }

    public function generateTrip(string $destination, int $days, string $budget, string $travelers): ?array
    {
        $prompt = $this->buildPrompt($destination, $days, $budget, $travelers);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(60)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'       => $this->model,
            'messages'    => [['role' => 'user', 'content' => $prompt]],
            'temperature' => 0.7,
            'max_tokens'  => 4000,
        ]);

        if (!$response->successful()) {
            Log::error('Groq API error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        }

        $text = $response->json('choices.0.message.content', '');
        preg_match('/\{[\s\S]*\}/', $text, $matches);
        if (!$matches) return null;

        $json = preg_replace(['/,\s*}/', '/,\s*]/'], ['}', ']'], $matches[0]);

        try {
            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            Log::error('Groq JSON parse error', ['error' => $e->getMessage(), 'raw' => substr($json, 0, 500)]);
            return null;
        }
    }

    private function buildPrompt(string $destination, int $days, string $budget, string $travelers): string
    {
        return <<<PROMPT
Generate a detailed {$days}-day trip itinerary for {$destination}.
Budget: {$budget} | Travelers: {$travelers}

Return ONLY a valid JSON object with this exact structure:
{
  "days": [
    {
      "day": 1,
      "title": "Day theme",
      "activities": [
        {
          "name": "Place name",
          "time": "09:00 - 11:00",
          "description": "Brief description (2 sentences max)",
          "geo": {"lat": 48.8606, "lng": 2.3376},
          "travelNext": {"mode": "walk", "mins": 15}
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Hotel name",
      "area": "Neighborhood",
      "rating": 4.5,
      "price": 150,
      "lat": 48.86,
      "lng": 2.34,
      "description": "Brief description"
    }
  ],
  "restaurants": [
    {
      "name": "Restaurant name",
      "cuisine": "French",
      "rating": 4.3,
      "priceRange": "€€",
      "lat": 48.86,
      "lng": 2.34,
      "description": "Brief description"
    }
  ]
}

Rules:
- Include {$days} days, 4-5 activities each
- Include 3-4 hotels, 4-5 restaurants
- All geo coordinates must be real for {$destination}
- Budget "{$budget}": cheap = budget hostels/street food, moderate = 3-star/bistros, luxury = 5-star/fine dining
- Travelers "{$travelers}": tailor recommendations accordingly
- Return ONLY the JSON, no markdown, no explanation
PROMPT;
    }
}
