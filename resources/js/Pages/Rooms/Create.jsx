import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';
import { QRCodeCanvas } from 'qrcode.react';

export default function Create({ rooms, existingBookings }) {
  const { data, setData, post, errors } = useForm({
    customer_name: '',
    customer_phone: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
  });

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const checkIn = new Date(data.check_in_date);
      const checkOut = new Date(data.check_out_date);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
      setTotalPrice(diffDays * 1000);
    } else {
      setTotalPrice(0);
    }
  }, [data.check_in_date, data.check_out_date]);

  const availableRooms = rooms
    .filter((room) => room.status === 'not_reserved' && /^([AB]10?|A[1-9]|B[1-9])$/.test(room.room_number))
    .sort((a, b) => {
      const getLetter = (room) => room.room_number.charAt(0);
      const getNumber = (room) => parseInt(room.room_number.slice(1), 10);

      if (getLetter(a) === getLetter(b)) {
        return getNumber(a) - getNumber(b);
      }
      return getLetter(a).localeCompare(getLetter(b));
    });

  const uniqueRooms = Array.from(new Set(availableRooms.map(room => room.room_number)))
    .map(roomNumber => availableRooms.find(room => room.room_number === roomNumber));

    const handleSubmit = (e) => {
      e.preventDefault();
    
      if (!rooms || !Array.isArray(rooms)) {
        console.error("Rooms data is undefined or not an array.");
        return;
      }
    
      const checkInDate = new Date(data.check_in_date);
      const checkOutDate = new Date(data.check_out_date);
    
      // ตรวจสอบว่ามีการจองห้องในช่วงเวลาที่เลือกหรือไม่
      const isRoomBooked = rooms.some(room =>
        room.id === data.room_id &&
        room.status === 'reserved' &&
        (
          // ตรวจสอบช่วงเวลาในการจอง
          (
            (new Date(room.check_in_date) < checkOutDate && new Date(room.check_out_date) > checkInDate) ||  // ถ้าช่วงเวลามีการทับซ้อน
            (new Date(room.check_in_date).toDateString() === checkInDate.toDateString() && new Date(room.check_out_date).toDateString() === checkOutDate.toDateString())  // ตรวจสอบว่าเป็นวันที่เดียวกัน
          )
        )
      );
    
      if (isRoomBooked) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ห้องนี้ถูกจองไปแล้วในช่วงเวลาที่คุณเลือก กรุณาเลือกห้องอื่น',
        });
        return;
      }
    
      // ส่งข้อมูลการจองไปยังเซิร์ฟเวอร์
      post('/bookings', {
        onSuccess: () => {
          const paymentURL = `https://promptpay.io/0832654075/${totalPrice}`;
    
          Swal.fire({
            title: 'การจองสำเร็จ',
            html: `
              <p>กรุณาชำระเงินจำนวน <strong>${totalPrice.toLocaleString()} บาท</strong></p>
              <div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentURL)}&size=200x200" alt="QR Code" />
              </div>
            `,
            confirmButtonText: 'เสร็จสิ้น',
          });
        },
        onError: (errors) => {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: errors.room_id || errors.message || 'กรุณาลองใหม่อีกครั้ง',
          });
        },
      });
    };
    
    
    
  return (
    <AuthenticatedLayout>
      <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-black-700 mb-6">เพิ่มข้อมูลการจอง</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-lg font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              value={data.customer_name}
              onChange={(e) => setData('customer_name', e.target.value)}
              className="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.customer_name && <div className="text-red-500 mt-1">{errors.customer_name}</div>}
          </div>

          <div>
            <label className="block mb-2 text-lg font-medium text-gray-700">เบอร์โทร</label>
            <input
              type="text"
              value={data.customer_phone}
              onChange={(e) => setData('customer_phone', e.target.value)}
              className="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.customer_phone && <div className="text-red-500 mt-1">{errors.customer_phone}</div>}
          </div>

          <div>
            <label className="block mb-2 text-lg font-medium text-gray-700">เลขห้อง</label>
            <select
              value={data.room_id || ''}
              onChange={(e) => setData('room_id', e.target.value)}
              className="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- เลือกหมายเลขห้อง --</option>
              {uniqueRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number}
                </option>
              ))}
            </select>
            {errors.room_id && <div className="text-red-500 mt-1">{errors.room_id}</div>}
          </div>

          <div>
            <label className="block mb-2 text-lg font-medium text-gray-700">Check-in Date</label>
            <input
              type="date"
              value={data.check_in_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setData('check_in_date', e.target.value)}
              className="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.check_in_date && <div className="text-red-500 mt-1">{errors.check_in_date}</div>}
          </div>

          <div>
            <label className="block mb-2 text-lg font-medium text-gray-700">Check-out Date</label>
            <input
              type="date"
              value={data.check_out_date}
              min={data.check_in_date || new Date().toISOString().split('T')[0]}
              onChange={(e) => setData('check_out_date', e.target.value)}
              className="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.check_out_date && <div className="text-red-500 mt-1">{errors.check_out_date}</div>}
          </div>

          <div className="text-xl font-semibold text-center text-blue-700">
            ราคาทั้งหมด: {totalPrice.toLocaleString()} บาท
          </div>

          <button
            type="submit"
            className="p-3 w-full rounded-lg shadow-lg text-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
