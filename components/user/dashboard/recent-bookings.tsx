export default function RecentBookings() {
  const bookings = [
    { id: 1, name: "Rahul Sharma", hostel: "City Boys Hostel", date: "12 Mar" },
    { id: 2, name: "Amit Kumar", hostel: "Green View Hostel", date: "11 Mar" },
    { id: 3, name: "Sneha Patel", hostel: "Girls Comfort Stay", date: "10 Mar" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">

      <h3 className="font-semibold text-lg mb-4">
        Recent Bookings
      </h3>

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p className="font-medium">{booking.name}</p>
              <p className="text-sm text-gray-500">{booking.hostel}</p>
            </div>

            <span className="text-sm text-gray-400">
              {booking.date}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}