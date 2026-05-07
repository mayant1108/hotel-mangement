import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controller/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile
router.get("/profile", protect, getUserProfile);

export default router;