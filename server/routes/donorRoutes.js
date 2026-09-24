import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createDonorProfile,
  getMyDonorProfile,
  updateMyDonorProfile
} from "../controllers/donorController.js";

const router = express.Router();

//Create a new donor profile
router.post("/", authMiddleware, createDonorProfile);

// Get the logged-in user's donor profile
router.get("/me", authMiddleware, getMyDonorProfile);

// Update the logged-in user's donor profile
router.put("/me", authMiddleware, updateMyDonorProfile);

export default router;