import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import { calculateTotalPrice, isValidDateRange } from '../utils/helpers.js';

// @desc    Create a booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests, specialRequests } = req.body;
    const userId = req.user._id;

    // Validate dates
    if (!isValidDateRange(checkInDate, checkOutDate)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    // Check room exists and get price
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.isAvailable) return res.status(400).json({ message: 'Room is not available' });
    if (Number(guests) > room.capacity) {
      return res.status(400).json({ message: 'Guest count exceeds room capacity' });
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      roomId,
      status: { $in: ['confirmed', 'pending'] },
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) },
    });
    if (overlapping) {
      return res.status(400).json({ message: 'Room already booked for selected dates' });
    }

    const totalPrice = calculateTotalPrice(room.pricePerNight, checkInDate, checkOutDate);

    const booking = await Booking.create({
      userId,
      hotelId: room.hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      specialRequests,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings for logged-in user
// @route   GET /api/bookings/mybookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hotelId', 'name city')
      .populate('roomId', 'roomNumber type pricePerNight')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('hotelId', 'name')
      .populate('roomId', 'roomNumber type')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (admin only)
// @route   PUT /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking (user or admin)
// @route   PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only allow cancellation if user owns it or admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
