import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';

export default function Edit() {
  const { booking, rooms } = usePage().props;
  const [formData, setFormData] = useState({
    customer_name: booking.customer.name || '',
    customer_phone: booking.customer.phone || '',
    room_id: booking.room.id || '',
    check_in_date: booking.check_in_date || '',
    check_out_date: booking.check_out_date || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.put(`/rooms/${booking.id}`, formData, {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          router.get('/rooms');
        });
      },
      onError: (errors) => {
        setErrors(errors); // แสดงข้อผิดพลาดจากการ validate
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง',
        });
      }
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-8 max-w-3xl bg-green shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold text-black-700 mb-6 text-center">แก้ไขข้อมูลการจอง</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">ชื่อลูกค้า</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.customer_name ? 'border-red-500' : ''}`}
              required
            />
            {errors.customer_name && <p className="text-red-500 text-sm">{errors.customer_name}</p>}
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">เบอร์โทรลูกค้า</label>
            <input
              type="text"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.customer_phone ? 'border-red-500' : ''}`}
              required
            />
            {errors.customer_phone && <p className="text-red-500 text-sm">{errors.customer_phone}</p>}
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">เลือกห้อง</label>
            <select
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.room_id ? 'border-red-500' : ''}`}
            >
              {rooms
                .map((room) => room.room_number) // เลือกเลขห้อง
                .filter((value, index, self) => self.indexOf(value) === index) // กรองห้องที่ซ้ำ
                .sort() // เรียงลำดับ
                .map((roomNumber) => {
                  const room = rooms.find((r) => r.room_number === roomNumber);
                  return (
                    <option key={room.id} value={room.id}>
                      ห้อง {room.room_number} ({room.status})
                    </option>
                  );
                })}
            </select>
            {errors.room_id && <p className="text-red-500 text-sm">{errors.room_id}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">วันที่เช็คอิน</label>
            <input
              type="date"
              name="check_in_date"
              value={formData.check_in_date}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.check_in_date ? 'border-red-500' : ''}`}
              required
            />
            {errors.check_in_date && <p className="text-red-500 text-sm">{errors.check_in_date}</p>}
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">วันที่เช็คเอาท์</label>
            <input
              type="date"
              name="check_out_date"
              value={formData.check_out_date}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.check_out_date ? 'border-red-500' : ''}`}
              required
            />
            {errors.check_out_date && <p className="text-red-500 text-sm">{errors.check_out_date}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg shadow-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            บันทึกการเปลี่ยนแปลง
          </button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
