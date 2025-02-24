import React, { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';

export default function Index() {
  const { bookings = [] } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 10;

  // ฟังก์ชันสำหรับกรองข้อมูลที่ถูกลบ
  const filterDeletedBookings = (bookings) => {
    const deletedBookings = JSON.parse(localStorage.getItem('deletedBookings')) || [];
    return bookings.filter(booking => !deletedBookings.includes(booking.id));
  };

  // เมื่อมีการโหลดข้อมูลการจองหรือเปลี่ยนหน้า จะกรองข้อมูลใหม่
  useEffect(() => {
    const updatedBookings = filterDeletedBookings(bookings);
    setFilteredBookings(updatedBookings);
  }, [bookings]);

  useEffect(() => {
    const filtered = bookings.filter(booking => {
      const checkInDate = new Date(booking.check_in_date);
      const checkOutDate = new Date(booking.check_out_date);
      const isWithinDateRange =
        (!startDate || checkInDate >= new Date(startDate)) &&
        (!endDate || checkOutDate <= new Date(endDate));
      return isWithinDateRange;
    });
    const updatedBookings = filterDeletedBookings(filtered); // กรองข้อมูลที่ถูกลบออก
    setFilteredBookings(updatedBookings);
  }, [startDate, endDate, bookings]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = a.check_in_date ? new Date(a.check_in_date) : new Date(0);
    const dateB = b.check_in_date ? new Date(b.check_in_date) : new Date(0);
    return dateA - dateB;
  });

  const currentBookings = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    const filtered = bookings.filter(booking =>
      [booking.customer_name, booking.customer_phone, booking.room_number]
        .some(field => field?.toLowerCase().includes(e.target.value.toLowerCase()))
    );
    const updatedBookings = filterDeletedBookings(filtered); // กรองข้อมูลที่ถูกลบออก
    setFilteredBookings(updatedBookings);
  };

  const handleDelete = (id, e) => {
    e.preventDefault();

    Swal.fire({
      title: 'คุณต้องการลบการจองนี้หรือไม่?',
      text: "การลบจะไม่ถูกบันทึกในฐานข้อมูล",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        const deletedBookings = JSON.parse(localStorage.getItem('deletedBookings')) || [];
        deletedBookings.push(id);
        localStorage.setItem('deletedBookings', JSON.stringify(deletedBookings));

        // กรองการจองที่ถูกลบออกจาก filteredBookings
        const updatedBookings = filteredBookings.filter(booking => booking.id !== id);
        setFilteredBookings(updatedBookings);

        Swal.fire('ลบสำเร็จ!', 'การจองถูกลบแล้ว', 'success');
      }
    });
  };

  const calculateTotalPrice = (checkInDate, checkOutDate, pricePerNight = 1000) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffInTime = checkOut - checkIn;
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    return diffInDays * pricePerNight;
  };

  const totalAmount = filteredBookings.reduce((sum, booking) => {
    if (booking.check_in_date && booking.check_out_date) {
      return sum + calculateTotalPrice(booking.check_in_date, booking.check_out_date, booking.room_price);
    }
    return sum;
  }, 0);

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-8 bg-white shadow-xl rounded-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-black-600">รายชื่อลูกค้าจองที่พัก</h2>

        <div className="flex justify-center mb-6 space-x-4">
          <input
            type="text"
            placeholder="🔍 ค้นหาด้วยชื่อลูกค้า หมายเลขโทรศัพท์ หรือหมายเลขห้อง"
            className="border px-4 py-2 w-2/3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Link
            href="/rooms/create"
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
          >
            เพิ่มข้อมูลการจอง
          </Link>
        </div>

        {currentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                  <th className="py-3 px-4 text-left">ชื่อของลูกค้า</th>
                  <th className="py-3 px-4 text-left">หมายเลขโทรศัพท์</th>
                  <th className="py-3 px-4 text-left">หมายเลขห้อง</th>
                  <th className="py-3 px-4 text-left">สถานะห้อง</th>
                  <th className="py-3 px-4 text-left">วันที่เช็คอิน</th>
                  <th className="py-3 px-4 text-left">วันที่เช็คเอาท์</th>
                  <th className="py-3 px-4 text-left">ราคา</th>
                  <th className="py-3 px-4 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking, index) => (
                  <tr key={index} className="border-b hover:bg-blue-100 odd:bg-gray-50">
                    <td className="py-3 px-4">{booking.customer_name ?? "ไม่ระบุ"}</td>
                    <td className="py-3 px-4">{booking.customer_phone ?? "ไม่ระบุ"}</td>
                    <td className="py-3 px-4">{booking.room_number ?? "ไม่ระบุ"}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      {booking.room_status === 'not_reserved' ? 'reserved' : booking.room_status}
                    </td>
                    <td className="py-3 px-4">
                      {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : "ไม่ระบุ"}
                    </td>
                    <td className="py-3 px-4">
                      {booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : "ไม่ระบุ"}
                    </td>
                    <td className="py-3 px-4">
                      {booking.check_in_date && booking.check_out_date ? (
                        <span>
                          {`${calculateTotalPrice(booking.check_in_date, booking.check_out_date, booking.room_price).toLocaleString()} บาท`}
                        </span>
                      ) : (
                        "ไม่ระบุ"
                      )}
                    </td>
                    <td className="py-3 px-4 flex justify-center space-x-2">
                      <Link
                        href={`/rooms/${booking.id}/edit`}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600"
                      >
                        แก้ไข
                      </Link>
                      <button onClick={(e) => handleDelete(booking.id, e)} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-6 text-gray-500">ไม่มีข้อมูลการจอง</p>
        )}

        <div className="flex justify-center space-x-4 mb-6">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between bg-gray-200 p-4 rounded-lg mt-4">
          <h3 className="text-lg font-semibold">ยอดรวมการจอง: {filteredBookings.length} รายการ</h3>
          <h3 className="text-lg font-semibold">ราคารวมทั้งหมด: {totalAmount.toLocaleString()} บาท</h3>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-400 text-black-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <span className="text-xl">{currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-blue-400 text-black-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
