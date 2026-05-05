import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// @desc    Create room (admin only)
// @route   POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rooms for a hotel with availability filter
// @route   GET /api/rooms
export const getRooms = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, type, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (hotelId) filter.hotelId = hotelId;
    if (type) filter.type = type;

    // If checkIn and checkOut provided, exclude rooms that are booked in that period
    let bookedRoomIds = [];
    if (checkIn && checkOut) {
      const overlappingBookings = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        checkInDate: { $lt: new Date(checkOut) },
        checkOutDate: { $gt: new Date(checkIn) },
      }).select('roomId');
      bookedRoomIds = overlappingBookings.map(b => b.roomId);
      filter._id = { $nin: bookedRoomIds };
    }

    const rooms = await Room.find(filter)
      .populate('hotelId', 'name city')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Room.countDocuments(filter);
    res.json({
      rooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room (admin only)
// @route   PUT /api/rooms/:id
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete room (admin only)
// @route   DELETE /api/rooms/:id
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};