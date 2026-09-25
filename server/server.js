import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import donorRoutes from "./routes/donorRoutes.js";
import bloodRequestRoutes from "./routes/bloodRequestRoutes.js";
import donationRequestRoutes from "./routes/donationRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);   // Blood request routes
app.use("/api/donation-requests", donationRequestRoutes); // Donation request routes
app.use("/api/notifications", notificationRoutes);

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Blood Donor Finder API is running"
  });
});

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
