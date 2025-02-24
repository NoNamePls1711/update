<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['room_number', 'status'];

    protected $casts = [
        'room_number' => 'string',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($room) {
            $validator = Validator::make(
                ['room_number' => $room->room_number],
                ['room_number' => 'required|string|regex:/^[A-Za-z0-9]+$/']
            );

            if ($validator->fails()) {
                throw new \Exception('หมายเลขห้องไม่ถูกต้อง');
            }
        });
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
