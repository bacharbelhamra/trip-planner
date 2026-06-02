<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'destination', 'days', 'budget', 'travelers', 'cover_image', 'trip_data'];

    protected $casts = ['trip_data' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
