import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("role");
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ message: "Administrator access required" });
    }

    next();
  } catch (error) {
    console.error("Verify admin access error:", error);
    res.status(500).json({ message: "Failed to verify administrator access" });
  }
};

export default adminMiddleware;
