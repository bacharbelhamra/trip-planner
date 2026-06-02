<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'destination' => fake()->city() . ', ' . fake()->country(),
            'days'        => fake()->numberBetween(1, 14),
            'budget'      => fake()->randomElement(['cheap', 'moderate', 'luxury']),
            'travelers'   => fake()->randomElement(['solo', 'couple', 'family', 'friends']),
            'trip_data'   => ['days' => [], 'hotels' => [], 'restaurants' => []],
        ];
    }
}
