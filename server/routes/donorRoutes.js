import express from "express";
import { createDonorProfile } from "../controllers/donorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createDonorProfile);

export default router;