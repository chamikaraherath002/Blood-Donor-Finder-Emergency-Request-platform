import express from "express";

import {
  createBloodRequest,
  getLatestUrgentBloodRequests,
  getMyBloodRequests,
  updateBloodRequest,
  cancelBloodRequest
} from "../controllers/bloodRequestController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new blood request
router.post("/", authMiddleware, createBloodRequest);

// Get the newest active urgent blood requests from other users
router.get("/recent", authMiddleware, getLatestUrgentBloodRequests);

// Get all blood requests created by the logged-in user
router.get("/me", authMiddleware, getMyBloodRequests);

// Update my blood request
router.put("/:id", authMiddleware, updateBloodRequest);

// Cancel my blood request
router.patch("/:id/cancel", authMiddleware, cancelBloodRequest);

export default router;