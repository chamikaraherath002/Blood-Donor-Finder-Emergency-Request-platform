import express from "express";

import {
  createDonorProfile,
  getMyDonorProfile,
  updateMyDonorProfile,
  searchDonors
} from "../controllers/donorController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a donor profile
router.post("/", authMiddleware, createDonorProfile);

// Search for compatible available donors
router.get("/search", authMiddleware, searchDonors);

// Get my donor profile
router.get("/me", authMiddleware, getMyDonorProfile);

// Update my donor profile
router.put("/me", authMiddleware, updateMyDonorProfile);

export default router;