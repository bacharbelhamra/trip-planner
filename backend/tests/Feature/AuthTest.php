<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\FirebaseTokenVerifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_firebase_login_with_invalid_token_returns_401(): void
    {
        $this->mock(FirebaseTokenVerifier::class, function ($mock) {
            $mock->shouldReceive('verify')->once()->andReturn(null);
        });

        $this->postJson('/api/v1/auth/firebase-login', ['firebase_token' => 'bad-token'])
             ->assertStatus(401)
             ->assertJson(['message' => 'Invalid or expired Firebase token.']);
    }

    public function test_firebase_login_with_valid_token_creates_user_and_returns_token(): void
    {
        $this->mock(FirebaseTokenVerifier::class, function ($mock) {
            $mock->shouldReceive('verify')->once()->andReturn([
                'sub'     => 'uid-abc123',
                'email'   => 'newuser@example.com',
                'name'    => 'New User',
                'picture' => null,
            ]);
        });

        $this->postJson('/api/v1/auth/firebase-login', ['firebase_token' => 'valid-token'])
             ->assertStatus(200)
             ->assertJsonStructure(['token', 'user', 'is_new']);

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    public function test_logout_revokes_token(): void
    {
        $user   = User::factory()->create();
        $result = $user->createToken('test-token');

        $this->withHeaders(['Authorization' => 'Bearer ' . $result->plainTextToken])
             ->postJson('/api/v1/auth/logout')
             ->assertStatus(200)
             ->assertJson(['message' => 'Logged out successfully.']);

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $result->accessToken->id]);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
             ->getJson('/api/v1/auth/me')
             ->assertStatus(200)
             ->assertJsonFragment(['email' => $user->email]);
    }

    public function test_me_without_token_returns_401(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}
