import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || "admin123@gmail.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const phone = process.env.ADMIN_PHONE || "";
  const name = process.env.ADMIN_NAME || "Platform Admin";

  if (!process.env.MONGODB_URI || !password) {
    throw new Error(
      "Set MONGODB_URI and ADMIN_PASSWORD in server/.env before provisioning the admin account",
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email },
    {
      $set: { name, email, password: hashedPassword, phone, role: "ADMIN" },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  console.log(`Administrator account provisioned for ${admin.email}`);
};

createAdmin()
  .catch((error) => {
    console.error("Admin provisioning failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  });
