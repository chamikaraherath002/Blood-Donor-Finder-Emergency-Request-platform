import express from "express";

import {
  createDonationRequest,
  getMyReceivedDonationRequests,
  getMySentDonationRequests,
  acceptDonationRequest,
  rejectDonationRequest,
} from "../controllers/donationRequestController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a donation request to a donor
router.post("/", authMiddleware, createDonationRequest);

// Get donation requests received by me as a donor
router.get("/received", authMiddleware, getMyReceivedDonationRequests);

// Get donation requests sent by me as a requester
router.get("/sent", authMiddleware, getMySentDonationRequests);

export default router;

// Accept a donation request
router.patch("/:id/accept", authMiddleware, acceptDonationRequest);

// Reject a donation request
router.patch("/:id/reject", authMiddleware, rejectDonationRequest);
