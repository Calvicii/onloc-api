<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = ['device_id', 'accuracy', 'altitude', 'altitude_accuracy', 'heading', 'latitude', 'longitude', 'speed'];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
