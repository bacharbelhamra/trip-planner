<?php

namespace Tests\Feature;

use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_trips(): void
    {
        $this->getJson('/api/v1/trips')->assertStatus(401);
    }

    public function test_authenticated_user_can_get_their_trips(): void
    {
        $user = User::factory()->create();
        Trip::factory()->count(3)->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
             ->getJson('/api/v1/trips')
             ->assertStatus(200)
             ->assertJsonCount(3);
    }

    public function test_user_cannot_see_another_users_trips(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        Trip::factory()->count(2)->create(['user_id' => $userA->id]);
        Trip::factory()->count(3)->create(['user_id' => $userB->id]);

        $this->actingAs($userA, 'sanctum')
             ->getJson('/api/v1/trips')
             ->assertStatus(200)
             ->assertJsonCount(2);
    }

    public function test_trip_generation_with_invalid_budget_returns_422(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')
             ->postJson('/api/v1/trips/generate', ['destination' => 'Paris', 'days' => 5, 'budget' => 'expensive', 'travelers' => 'couple'])
             ->assertStatus(422);
    }

    public function test_trip_generation_with_invalid_travelers_returns_422(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')
             ->postJson('/api/v1/trips/generate', ['destination' => 'Paris', 'days' => 5, 'budget' => 'moderate', 'travelers' => 'group'])
             ->assertStatus(422);
    }

    public function test_trip_generation_with_days_over_14_returns_422(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')
             ->postJson('/api/v1/trips/generate', ['destination' => 'Paris', 'days' => 15, 'budget' => 'moderate', 'travelers' => 'couple'])
             ->assertStatus(422);
    }

    public function test_authenticated_user_can_delete_their_own_trip(): void
    {
        $user = User::factory()->create();
        $trip = Trip::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
             ->deleteJson("/api/v1/trips/{$trip->id}")
             ->assertStatus(200)
             ->assertJson(['message' => 'Trip deleted successfully.']);

        $this->assertDatabaseMissing('trips', ['id' => $trip->id]);
    }

    public function test_user_cannot_delete_another_users_trip(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $trip  = Trip::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($other, 'sanctum')
             ->deleteJson("/api/v1/trips/{$trip->id}")
             ->assertStatus(403);
    }
}
