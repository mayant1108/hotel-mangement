import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const withHotelPricing = async (hotels) => {
  const hotelIds = hotels.map((hotel) => hotel._id);
  if (!hotelIds.length) {
    return [];
  }

  const roomStats = await Room.aggregate([
    { $match: { hotelId: { $in: hotelIds } } },
    {
      $group: {
        _id: '$hotelId',
        minPrice: { $min: '$pricePerNight' },
        roomsCount: { $sum: 1 },
      },
    },
  ]);

  const roomStatsMap = new Map(
    roomStats.map((item) => [item._id.toString(), item]),
  );

  return hotels.map((hotel) => {
    const stats = roomStatsMap.get(hotel._id.toString());

    return {
      ...hotel.toObject(),
      startingPrice: stats?.minPrice || 0,
      roomsCount: stats?.roomsCount || 0,
    };
  });
};

// @desc    Create a new hotel (admin only)
// @route   POST /api/hotels
export const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all hotels with filtering & pagination
// @route   GET /api/hotels
export const getHotels = async (req, res) => {
  try {
    const {
      city,
      state,
      minRating,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const hotels = await Hotel.find(filter)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .sort({ createdAt: -1 });
    const total = await Hotel.countDocuments(filter);

    const hotelsWithPricing = await withHotelPricing(hotels);

    res.json({
      hotels: hotelsWithPricing,
      totalPages: Math.ceil(total / limitNumber) || 1,
      currentPage: pageNumber,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    const [hotelWithPricing] = await withHotelPricing([hotel]);
    res.json(hotelWithPricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update hotel (admin only)
// @route   PUT /api/hotels/:id
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete hotel (admin only)
// @route   DELETE /api/hotels/:id
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
