<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $bookings = Booking::with(['customer', 'room'])
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'customer_name' => optional($booking->customer)->name ?? 'ไม่มีข้อมูลลูกค้า',
                    'customer_phone' => optional($booking->customer)->phone ?? 'ไม่มีเบอร์โทร',
                    'room_status' => optional($booking->room)->status ?? 'ไม่มีข้อมูลห้อง',
                    'room_number' => optional($booking->room)->room_number ?? 'ไม่มีหมายเลขห้อง',
                    'check_in_date' => $booking->check_in_date,
                    'check_out_date' => $booking->check_out_date,
                ];
            });

        return Inertia::render('Rooms/Index', ['bookings' => $bookings]);
    }

    public function create()
    {
        $rooms = Room::where('status', 'not_reserved')->get(['id', 'room_number', 'status']);
        return Inertia::render('Rooms/Create', ['rooms' => $rooms]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:10',
            'room_id' => 'required|string|exists:rooms,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
        ]);

        DB::transaction(function () use ($validated) {
            $customer = Customer::firstOrCreate(
                ['phone' => $validated['customer_phone']],
                ['name' => $validated['customer_name']]
            );

            $room = Room::findOrFail($validated['room_id']);
            if ($room->status !== 'not_reserved') {
                throw new \Exception('ห้องนี้ถูกจองแล้ว');
            }

            Booking::create([
                'customer_id' => $customer->id,
                'room_id' => $validated['room_id'],
                'check_in_date' => $validated['check_in_date'],
                'check_out_date' => $validated['check_out_date'],
            ]);

            $room->update(['status' => 'reserved']);
        });

        return redirect()->route('rooms.index')->with('success', 'การจองสำเร็จแล้ว');
    }

    public function edit($id)
    {
        $booking = Booking::with('customer', 'room')->findOrFail($id);
        $rooms = Room::where('status', 'not_reserved')
            ->orWhere('id', $booking->room_id)
            ->get(['id', 'room_number', 'status']);
        
        return Inertia::render('Rooms/Edit', [
            'booking' => $booking,
            'rooms' => $rooms,
        ]);
    }
    
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:10',
            'room_id' => 'required|string|exists:rooms,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
        ]);

        DB::transaction(function () use ($validated, $id) {
            $booking = Booking::findOrFail($id);

            $room = Room::findOrFail($validated['room_id']);
            if ($room->status !== 'not_reserved' && $room->id !== $booking->room_id) {
                throw new \Exception('ห้องนี้ถูกจองแล้ว');
            }

            $booking->update([
                'check_in_date' => $validated['check_in_date'],
                'check_out_date' => $validated['check_out_date'],
                'room_id' => $validated['room_id'],
            ]);

            $customer = Customer::find($booking->customer_id);
            $customer->update([
                'name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'],
            ]);

            if ($room->id !== $booking->room_id) {
                $booking->room->update(['status' => 'not_reserved']);
                $room->update(['status' => 'reserved']);
            }
        });

        return redirect()->route('rooms.index')->with('success', 'อัปเดตข้อมูลสำเร็จแล้ว');
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            $booking = Booking::findOrFail($id);

            if ($booking->room) {
                $booking->room->update(['status' => 'not_reserved']);
            }

            $booking->delete();
        });

        return redirect()->route('rooms.index')->with('success', 'ลบการจองสำเร็จแล้ว');
    }

    public function availableRooms(Request $request)
    {
        $checkIn = $request->query('check_in_date');
        $checkOut = $request->query('check_out_date');
    
        if (!$checkIn || !$checkOut) {
            $rooms = Room::where('status', 'not_reserved')->get();
            return Inertia::render('AvailableRooms', ['rooms' => $rooms]);
        }
    
        \Log::info("🔍 ค้นหาห้องที่พร้อมใช้งาน", ['check_in' => $checkIn, 'check_out' => $checkOut]);

        $rooms = Room::with('bookings')
            ->whereDoesntHave('bookings', function ($query) use ($checkIn, $checkOut) {
                $query->where(function ($q) use ($checkIn, $checkOut) {
                    $q->whereBetween('check_in_date', [$checkIn, $checkOut])
                      ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                      ->orWhere(function ($q) use ($checkIn, $checkOut) {
                          $q->where('check_in_date', '<', $checkIn)
                            ->where('check_out_date', '>', $checkOut);
                      });
                });
            })
            ->where('status', 'not_reserved')
            ->get();

        \Log::info("✅ ห้องที่พร้อมใช้งาน:", $rooms->toArray());

        return response()->json(['rooms' => $rooms]);
    }
}