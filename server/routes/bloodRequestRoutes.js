import express from "express";

import {
  createBloodRequest,
  getCommunityBloodRequests,
  getLatestBloodRequests,
  getMyBloodRequests,
  respondToBloodRequest,
  updateBloodRequest,
  cancelBloodRequest
} from "../controllers/bloodRequestController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new blood request
router.post("/", authMiddleware, createBloodRequest);

// Get the newest active blood requests from other users
router.get("/recent", authMiddleware, getLatestBloodRequests);

// Get all active blood requests from other users
router.get("/community", authMiddleware, getCommunityBloodRequests);

// Respond to another user's active blood request
router.post("/:id/respond", authMiddleware, respondToBloodRequest);

// Get all blood requests created by the logged-in user
router.get("/me", authMiddleware, getMyBloodRequests);

// Update my blood request
router.put("/:id", authMiddleware, updateBloodRequest);

// Cancel my blood request
router.patch("/:id/cancel", authMiddleware, cancelBloodRequest);

export default router;