import express from "express";

import {
  createBloodRequest,
  getMyBloodRequests,
  updateBloodRequest,
  cancelBloodRequest
} from "../controllers/bloodRequestController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new blood request
router.post("/", authMiddleware, createBloodRequest);

// Get all blood requests created by the logged-in user
router.get("/me", authMiddleware, getMyBloodRequests);

// Update my blood request
router.put("/:id", authMiddleware, updateBloodRequest);

// Cancel my blood request
router.patch("/:id/cancel", authMiddleware, cancelBloodRequest);

export default router;