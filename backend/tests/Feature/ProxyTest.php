<?php

namespace Tests\Feature;

use App\Services\UnsplashService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProxyTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_images_is_publicly_accessible_without_auth(): void
    {
        $this->mock(UnsplashService::class, function ($mock) {
            $mock->shouldReceive('searchImages')->once()->andReturn([
                ['id' => '1', 'url' => 'https://example.com/img.jpg', 'title' => 'Paris'],
            ]);
        });

        $this->getJson('/api/v1/proxy/search-images?query=Paris')
             ->assertStatus(200)
             ->assertJsonStructure(['images']);
    }

    public function test_search_images_with_missing_query_returns_422(): void
    {
        $this->getJson('/api/v1/proxy/search-images')
             ->assertStatus(422);
    }
}
