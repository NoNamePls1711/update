import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AvailableRooms() {
  const { rooms = [] } = usePage().props;
  const [availableRooms, setAvailableRooms] = useState([]);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  useEffect(() => {
    console.log("Rooms data received:", rooms);

    rooms.forEach(room => {
      console.log(`Room ${room.room_number}: available_from: ${room.available_from}, available_to: ${room.available_to}`);
    });

    // ฟังก์ชันตรวจสอบวันที่ที่ถูกต้อง
    const checkValidDate = (dateString) => {
      const date = new Date(dateString);
      return !isNaN(date.getTime());  // ตรวจสอบว่าเป็นวันที่ที่ถูกต้องหรือไม่
    };

    const roomsAvailable = rooms.filter(room => room.status === 'not_reserved');
    const uniqueRooms = Array.from(new Set(roomsAvailable.map(room => room.room_number)))
      .map(roomNumber => roomsAvailable.find(room => room.room_number === roomNumber));

    const sortedRooms = uniqueRooms.sort((a, b) => {
      const getLetter = room => room.room_number.charAt(0);
      const getNumber = room => parseInt(room.room_number.slice(1), 10);

      if (getLetter(a) === getLetter(b)) {
        return getNumber(a) - getNumber(b);
      }
      return getLetter(a).localeCompare(getLetter(b));
    });

    if (availableRooms.length === 0) {
      setAvailableRooms(sortedRooms);
    }
  }, [rooms]);

  const handleFilterByDate = () => {
    if (!checkInDate || !checkOutDate) {
      alert('กรุณาเลือกวันที่ Check-in และ Check-out');
      return;
    }
  
    console.log("🔍 วันที่ที่เลือก:", checkInDate, checkOutDate);
    console.log("📦 ข้อมูลห้องที่ได้จาก API:", rooms);
  
    // ฟังก์ชันตรวจสอบวันที่ที่ถูกต้อง
    const checkValidDate = (dateString) => {
      const date = new Date(dateString);
      return !isNaN(date.getTime());  // ตรวจสอบว่าเป็นวันที่ที่ถูกต้องหรือไม่
    };
  
    const filteredRooms = rooms.filter((room) => {
      // กำหนดค่าตั้งต้นหากไม่มีข้อมูลวันที่
      const availableFrom = checkValidDate(room.available_from) ? new Date(room.available_from) : new Date();  // ใช้วันที่ปัจจุบัน
      const availableTo = checkValidDate(room.available_to) ? new Date(room.available_to) : new Date();  // ใช้วันที่ปัจจุบัน
  
      // ตรวจสอบห้องที่ไม่มีการจอง
      if (!checkValidDate(room.available_from) || !checkValidDate(room.available_to)) {
        console.log(`ห้อง ${room.room_number} ไม่มีวันที่ที่ไม่มีการจอง`);
        return true;  // หากไม่มีวันที่ก็ให้ห้องนี้ผ่านการกรอง
      }
  
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
  
      console.log("📅 Room Dates:", room.room_number, room.available_from, room.available_to);
  
      // ตรวจสอบว่า availableFrom และ availableTo ไม่เป็น null ก่อนการเปรียบเทียบ
      return availableFrom <= checkIn && availableTo >= checkOut;
    });
  
    console.log("✅ ห้องที่ผ่านการกรอง:", filteredRooms);
    setAvailableRooms(filteredRooms);
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-8 bg-white shadow-xl rounded-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-black-600">ห้องที่สามารถจองได้</h2>

        <div className="flex justify-center gap-4 mb-6">
          <div>
            <label className="block text-gray-700">Check-in</label>
            <input
              type="date"
              className="border border-gray-300 p-2 rounded-lg"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Check-out</label>
            <input
              type="date"
              className="border border-gray-300 p-2 rounded-lg"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
            />
          </div>
          <button
            onClick={handleFilterByDate}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 mt-6"
          >
            ค้นหาห้องว่าง
          </button>
        </div>

        {availableRooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                  <th className="py-3 px-4 text-left">หมายเลขห้อง</th>
                  <th className="py-3 px-4 text-left">สถานะ</th>
                  <th className="py-3 px-4 text-left">ราคา</th>
                  <th className="py-3 px-4 text-left">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {availableRooms.map((room, index) => (
                  <tr key={index} className="border-b hover:bg-blue-100 odd:bg-gray-50">
                    <td className="py-3 px-4">{room.room_number}</td>
                    <td className="py-3 px-4 text-green-600">{room.status}</td>
                    <td className="py-3 px-4">{(1000).toLocaleString()} บาท</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/rooms/${room.id}/details`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600"
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-6 text-gray-500">ไม่มีห้องว่าง</p>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
