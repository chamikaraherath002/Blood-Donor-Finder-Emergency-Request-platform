import express from "express";

import {
  createDonationRequest,
  getMyReceivedDonationRequests,
  getMySentDonationRequests,
  deleteMySentDonationRequest,
  acceptDonationRequest,
  rejectDonationRequest,
} from "../controllers/donationRequestController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createDonationRequest);
router.get("/received", authMiddleware, getMyReceivedDonationRequests);
router.get("/sent", authMiddleware, getMySentDonationRequests);
router.delete("/:id", authMiddleware, deleteMySentDonationRequest);
router.patch("/:id/accept", authMiddleware, acceptDonationRequest);
router.patch("/:id/reject", authMiddleware, rejectDonationRequest);

export default router;