import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user's notifications
router.get("/", authMiddleware, getMyNotifications);

// Mark one notification as read
router.patch("/:id/read", authMiddleware, markNotificationAsRead);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllNotificationsAsRead);

export default router;