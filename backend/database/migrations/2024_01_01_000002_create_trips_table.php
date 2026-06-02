<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('destination');
            $table->unsignedTinyInteger('days');
            $table->enum('budget', ['cheap', 'moderate', 'luxury']);
            $table->enum('travelers', ['solo', 'couple', 'family', 'friends']);
            $table->string('cover_image')->nullable();
            $table->json('trip_data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
