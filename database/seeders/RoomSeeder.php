<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\Customer;
use App\Models\Booking;

class RoomSeeder extends Seeder
{
    public function run()
    {


        Room::factory(50)->create();  // สร้าง Room 20 รายการ

    }
}

