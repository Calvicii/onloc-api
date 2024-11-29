<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = ['owner_id', 'name', 'icon', 'battery_level'];
}
