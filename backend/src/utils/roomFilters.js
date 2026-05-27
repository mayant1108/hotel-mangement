import Booking from '../models/Booking.js';

export const buildRoomAvailabilityFilter = async ({
  checkIn,
  checkOut,
  guests,
  hotelId,
  type,
} = {}) => {
  const filter = {};

  if (hotelId) {
    filter.hotelId = hotelId;
  }

  if (type) {
    filter.type = type;
  }

  if (guests) {
    filter.capacity = { $gte: Number(guests) };
  }

  if (checkIn && checkOut) {
    const overlappingBookings = await Booking.find({
      status: { $in: ['confirmed', 'pending'] },
      checkInDate: { $lt: new Date(checkOut) },
      checkOutDate: { $gt: new Date(checkIn) },
    }).select('roomId');

    const bookedRoomIds = overlappingBookings.map((booking) => booking.roomId);
    filter._id = { $nin: bookedRoomIds };
  }

  return filter;
};
