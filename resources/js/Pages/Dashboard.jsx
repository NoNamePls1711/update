import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const rooms = [
    {
        name: "Starry Night Villa by Zhang Bin",
        location: "เชียงใหม่, ไทย",
        rating: 8.5,
        reviews: 11,
        image: "/images/room1.jpg",
        type: "villa"
    },
    {
        name: "The Corner's unique house",
        location: "เชียงใหม่, ไทย",
        rating: 9.7,
        reviews: 18,
        image: "/images/room2.jpg",
        type: "house"
    },
    {
        name: "Villa Rajapruek Entire 3 villa with pool near Airport and city center",
        location: "เชียงใหม่, ไทย",
        rating: 9.4,
        reviews: 12,
        image: 
                "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/00/43/9b/b2-chang-phueak-gate.jpg?w=1200&h=-1&s=1",
        type: "villa"
    },
    {
        name: "Villa 89 Nimman Chiang Mai",
        location: "เชียงใหม่, ไทย",
        rating: 9.3,
        reviews: 12,
        image: "/images/room4.jpg",
        type: "villa"
    }
];

export default function RoomRecommendation() {
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const [selectedType, setSelectedType] = useState("all");

    useEffect(() => {
        const savedReviews = localStorage.getItem("reviews");
        if (savedReviews) {
            setReviews(JSON.parse(savedReviews));
        }
    }, []);

    const filteredRooms = selectedType === "all" ? rooms : rooms.filter(room => room.type === selectedType);

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            let newReviews;
            if (editingIndex !== null) {
                newReviews = reviews.map((rev, index) => index === editingIndex ? comment : rev);
                setEditingIndex(null);
            } else {
                newReviews = [...reviews, comment];
            }
            setReviews(newReviews);
            localStorage.setItem("reviews", JSON.stringify(newReviews));
            setComment("");
        }
    };

    const handleDeleteReview = (index) => {
        const newReviews = reviews.filter((_, i) => i !== index);
        setReviews(newReviews);
        localStorage.setItem("reviews", JSON.stringify(newReviews));
    };

    const handleEditReview = (index) => {
        setComment(reviews[index]);
        setEditingIndex(index);
        setDropdownIndex(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-3xl font-bold leading-tight text-gray-800">
                    แนะนำห้องพัก
                </h2>
            }
        >
            <Head title="แนะนำห้องพัก" />

            <div className="py-12 bg-gray-50">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-semibold mb-4">ยังสนใจที่พักเหล่านี้อยู่ใช่ไหม?</h3>

                    <div className="mb-6">
                        <label htmlFor="room-type" className="mr-2 text-lg font-medium">เลือกประเภทห้องพัก</label>
                        <select
    id="room-type"
    className="w-64 p-2 border-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={selectedType}
    onChange={(e) => setSelectedType(e.target.value)}
>
    <option value="all">ทั้งหมด</option>
    <option value="villa">วิลล่า</option>
    <option value="house">บ้าน</option>
</select>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredRooms.map((room, index) => (
                            <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                                <img src={room.image} alt={room.name} className="w-full h-48 object-cover transition-transform duration-500 transform hover:scale-110" />
                                <div className="p-6">
                                    <h4 className="text-xl font-semibold text-gray-800">{room.name}</h4>
                                    <p className="text-gray-600 text-sm">{room.location}</p>
                                    <p className="mt-2 text-blue-600 font-semibold">{room.rating} ★ ({room.reviews} ความคิดเห็น)</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-white shadow-md rounded-lg">
                        <h3 className="text-2xl font-semibold mb-4">ช่องทางการติดต่อ</h3>
                        <p className="text-lg">โทรศัพท์: <span className="text-blue-500">012-345-6789</span></p>
                        <p className="text-lg">อีเมล: <span className="text-blue-500">contact@example.com</span></p>
                        <p className="text-lg">ที่อยู่: <span className="text-blue-500">123 ถนนตัวอย่าง, เชียงใหม่, ไทย</span></p>
                    </div>

                    <div className="mt-8 p-6 bg-white shadow-md rounded-lg">
                        <h3 className="text-2xl font-semibold mb-4">แสดงความคิดเห็น</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <textarea
                                className="w-full p-3 border-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                placeholder="เขียนความคิดเห็นของคุณที่นี่..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                            <button
                                type="submit"
                                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                {editingIndex !== null ? "อัปเดตความคิดเห็น" : "ส่งความคิดเห็น"}
                            </button>
                        </form>
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold">ความคิดเห็นล่าสุด</h4>
                            <ul className="mt-2 space-y-4">
                                {reviews.map((review, index) => (
                                    <li key={index} className="p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center relative">
                                        <span className="text-gray-800">{review}</span>
                                        <div>
                                            <button
                                                className="ml-4 px-3 py-2 bg-gray-300 rounded-lg text-gray-600 hover:bg-gray-400"
                                                onClick={() => setDropdownIndex(dropdownIndex === index ? null : index)}
                                            >
                                                ⋮
                                            </button>
                                            {dropdownIndex === index && (
                                                <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg">
                                                    <button
                                                        onClick={() => handleEditReview(index)}
                                                        className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-gray-200"
                                                    >
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(index)}
                                                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-200"
                                                    >
                                                        ลบ
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
