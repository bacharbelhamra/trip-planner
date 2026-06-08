<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\GenerateTripRequest;
use App\Http\Resources\Api\V1\TripResource;
use App\Models\Trip;
use App\Services\GroqService;
use App\Services\UnsplashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TripController extends Controller
{
    public function __construct(
        private GroqService $groq,
        private UnsplashService $unsplash,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $trips = $request->user()->trips()->latest()->get();
        return response()->json(TripResource::collection($trips));
    }

    public function show(Request $request, Trip $trip): JsonResponse
    {
        $this->authorizeOwnership($request, $trip);
        return response()->json(new TripResource($trip));
    }

    public function generate(GenerateTripRequest $request): JsonResponse
    {
        $data = $request->validated();

        $tripData = $this->groq->generateTrip(
            $data['destination'],
            $data['days'],
            $data['budget'],
            $data['travelers'],
        );

        if (!$tripData) {
            return response()->json(['message' => 'Failed to generate trip. Please try again.'], 500);
        }

        $images = $this->unsplash->searchImages($data['destination'], 1);
        $coverImage = $images[0]['url'] ?? null;

        $trip = $request->user()->trips()->create([
            'destination' => $data['destination'],
            'days'        => $data['days'],
            'budget'      => $data['budget'],
            'travelers'   => $data['travelers'],
            'start_date'  => $data['start_date'] ?? null,
            'cover_image' => $coverImage,
            'trip_data'   => $tripData,
        ]);

        return response()->json(new TripResource($trip), 201);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination' => 'required|string|max:255',
            'days'        => 'required|integer|min:1|max:14',
            'budget'      => 'required|in:cheap,moderate,luxury',
            'travelers'   => 'required|in:solo,couple,family,friends',
            'start_date'  => 'nullable|date',
            'trip_data'   => 'nullable|array',
            'cover_image' => 'nullable|string',
        ]);

        $trip = $request->user()->trips()->create($validated);
        return response()->json(new TripResource($trip), 201);
    }

    public function updatePhotos(Request $request, Trip $trip): JsonResponse
    {
        $this->authorizeOwnership($request, $trip);

        $validated = $request->validate([
            'hotels'        => 'nullable|array',
            'hotels.*'      => 'nullable|string|max:500',
            'restaurants'   => 'nullable|array',
            'restaurants.*' => 'nullable|string|max:500',
        ]);

        $tripData = $trip->trip_data ?? [];

        foreach (['hotels', 'restaurants'] as $key) {
            if (!empty($validated[$key]) && !empty($tripData[$key])) {
                foreach ($validated[$key] as $i => $url) {
                    if (isset($tripData[$key][$i])) {
                        $tripData[$key][$i]['photo_url'] = $url;
                    }
                }
            }
        }

        $trip->update(['trip_data' => $tripData]);

        return response()->json(['message' => 'Photos saved.']);
    }

    public function destroy(Request $request, Trip $trip): JsonResponse
    {
        $this->authorizeOwnership($request, $trip);
        $trip->delete();
        return response()->json(['message' => 'Trip deleted successfully.']);
    }

    private function authorizeOwnership(Request $request, Trip $trip): void
    {
        if ($trip->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
