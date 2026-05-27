import Room from '../models/Room.js';
import { toPositiveInteger } from '../utils/helpers.js';
import { buildRoomAvailabilityFilter } from '../utils/roomFilters.js';

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
    const {
      hotelId,
      checkIn,
      checkOut,
      type,
      guests,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = await buildRoomAvailabilityFilter({
      hotelId,
      checkIn,
      checkOut,
      type,
      guests,
    });
    const pageNumber = toPositiveInteger(page, 1);
    const limitNumber = toPositiveInteger(limit, 10);

    const rooms = await Room.find(filter)
      .populate('hotelId', 'name city')
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .sort({ createdAt: -1 });
    const total = await Room.countDocuments(filter);
    res.json({
      rooms,
      totalPages: Math.ceil(total / limitNumber) || 1,
      currentPage: pageNumber,
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
