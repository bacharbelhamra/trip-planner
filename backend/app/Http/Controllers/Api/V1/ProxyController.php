<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\UnsplashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ProxyController extends Controller
{
    public function __construct(private UnsplashService $unsplash) {}

    public function searchImages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query'    => 'required|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $images = $this->unsplash->searchImages($validated['query'], $validated['per_page'] ?? 10);

        return response()->json(['images' => $images]);
    }
}
