import express from "express";
import {
  cancelAdminBloodRequest,
  deleteAdminBloodRequest,
  getAdminBloodRequests,
  getAdminDashboard,
  getAdminDonors,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../controllers/adminController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get("/dashboard", getAdminDashboard);
router.get("/users", getAdminUsers);
router.post("/users", createAdminUser);
router.put("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);
router.get("/donors", getAdminDonors);
router.get("/blood-requests", getAdminBloodRequests);
router.patch("/blood-requests/:id/cancel", cancelAdminBloodRequest);
router.delete("/blood-requests/:id", deleteAdminBloodRequest);

export default router;
