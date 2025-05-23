<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = ['device_id', 'accuracy', 'altitude', 'altitude_accuracy', 'latitude', 'longitude', 'battery'];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
