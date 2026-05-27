import express from 'express';
import {
  createHotel,
  getHotelCatalog,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} from '../controller/hotelController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/catalog', getHotelCatalog);

router.route('/')
  .get(getHotels)
  .post(protect, adminOnly, createHotel);

router.route('/:id')
  .get(getHotelById)
  .put(protect, adminOnly, updateHotel)
  .delete(protect, adminOnly, deleteHotel);

export default router;
