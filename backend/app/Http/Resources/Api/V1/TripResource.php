<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'destination' => $this->destination,
            'days'        => $this->days,
            'budget'      => $this->budget,
            'travelers'   => $this->travelers,
            'cover_image' => $this->cover_image,
            'trip_data'   => $this->trip_data,
            'created_at'  => $this->created_at->toISOString(),
        ];
    }
}
