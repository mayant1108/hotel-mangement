import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import { escapeRegex, toPositiveInteger } from '../utils/helpers.js';
import { buildRoomAvailabilityFilter } from '../utils/roomFilters.js';

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

const collectUniqueStrings = (...groups) => Array.from(
  new Set(
    groups
      .flatMap((items) => items || [])
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .map((item) => item?.trim?.() || '')
      .filter(Boolean),
  ),
);

const buildHotelFilter = ({ city, minRating, search, state }) => {
  const filter = {};

  if (city) {
    filter.city = { $regex: escapeRegex(city), $options: 'i' };
  }

  if (state) {
    filter.state = { $regex: escapeRegex(state), $options: 'i' };
  }

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  if (search?.trim()) {
    const searchPattern = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [
      { name: searchPattern },
      { city: searchPattern },
      { state: searchPattern },
      { address: searchPattern },
      { description: searchPattern },
      { amenities: searchPattern },
    ];
  }

  return filter;
};

export const getHotelCatalog = async (req, res) => {
  try {
    const hotelLimit = toPositiveInteger(req.query.hotelLimit, 6);
    const featuredLimit = toPositiveInteger(req.query.featuredLimit, 3);

    const [
      hotels,
      hotelOptions,
      hotelsCount,
      roomsCount,
      cities,
      hotelAmenities,
      roomAmenities,
      roomTypes,
      lowestPriceResult,
      hotelImages,
      roomImages,
    ] = await Promise.all([
      Hotel.find({}).sort({ createdAt: -1 }).limit(hotelLimit),
      Hotel.find({}, 'name').sort({ name: 1 }),
      Hotel.countDocuments({}),
      Room.countDocuments({}),
      Hotel.distinct('city'),
      Hotel.distinct('amenities'),
      Room.distinct('amenities'),
      Room.distinct('type'),
      Room.aggregate([
        {
          $group: {
            _id: null,
            lowestStartingPrice: { $min: '$pricePerNight' },
          },
        },
      ]),
      Hotel.distinct('images'),
      Room.distinct('images'),
    ]);

    const hotelsWithPricing = await withHotelPricing(hotels);

    res.json({
      featuredHotel: hotelsWithPricing[0] || null,
      featuredHotels: hotelsWithPricing.slice(0, featuredLimit),
      hotelOptions: hotelOptions.map((hotel) => ({
        _id: hotel._id,
        name: hotel.name,
      })),
      roomTypes: collectUniqueStrings(roomTypes),
      uniqueAmenities: collectUniqueStrings(hotelAmenities, roomAmenities).slice(0, 8),
      galleryImages: collectUniqueStrings(hotelImages, roomImages).slice(0, 8),
      stats: {
        hotelsCount,
        roomsCount,
        citiesCount: cities.filter(Boolean).length,
        lowestStartingPrice: lowestPriceResult[0]?.lowestStartingPrice || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
      search,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = buildHotelFilter({
      city,
      state,
      minRating,
      search,
    });
    const pageNumber = toPositiveInteger(page, 1);
    const limitNumber = toPositiveInteger(limit, 10);

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
    const {
      checkIn,
      checkOut,
      guests,
      includeRooms,
      roomLimit = 100,
      type,
    } = req.query;
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    const [hotelWithPricing] = await withHotelPricing([hotel]);

    if (includeRooms !== 'true') {
      return res.json(hotelWithPricing);
    }

    const roomFilter = await buildRoomAvailabilityFilter({
      hotelId: hotel._id,
      checkIn,
      checkOut,
      guests,
      type,
    });
    const rooms = await Room.find(roomFilter)
      .limit(toPositiveInteger(roomLimit, 100))
      .sort({ createdAt: -1 });

    return res.json({
      ...hotelWithPricing,
      rooms,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
