import bcrypt from "bcrypt";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Please provide name, email, password and phone"
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "SEEKER"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
};