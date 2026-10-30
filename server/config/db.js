import mongoose from "mongoose";
import User from "../models/User.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const migration = await User.updateMany(
      { role: { $in: ["DONOR", "SEEKER"] } },
      { $set: { role: "USER" } },
    );
    if (migration.modifiedCount > 0) {
      console.log(`Migrated ${migration.modifiedCount} accounts to USER role`);
    }
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;