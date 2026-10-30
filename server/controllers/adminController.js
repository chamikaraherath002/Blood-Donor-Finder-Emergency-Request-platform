import BloodRequest from "../models/BloodRequest.js";
import BloodRequestResponse from "../models/BloodRequestResponse.js";
import DonationRequest from "../models/DonationRequest.js";
import Donor from "../models/Donor.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const bloodRequestStatuses = [
  "PENDING",
  "ACCEPTED",
  "DONATED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];
const pageOptions = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
const makeSearchRegex = (value) =>
  new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const userRoles = ["USER", "ADMIN"];

const validateUserFields = ({ name, email, phone, role }) => {
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100
  ) {
    return "Name must be between 2 and 100 characters";
  }
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "Enter a valid email address";
  }
  if (phone !== undefined && typeof phone !== "string") {
    return "Phone number must be text";
  }
  if (typeof phone === "string" && phone.length > 30) {
    return "Phone number must be 30 characters or fewer";
  }
  if (!userRoles.includes(role)) {
    return "Select a valid user role";
  }
  return null;
};

const deleteUserAndRelatedData = async (userId) => {
  const [userBloodRequests, userResponses, userDonationRequests] =
    await Promise.all([
      BloodRequest.find({ requester: userId }).select("_id"),
      BloodRequestResponse.find({ donor: userId }).select("_id"),
      DonationRequest.find({
        $or: [{ requester: userId }, { donor: userId }],
      }).select("_id"),
    ]);

  const bloodRequestIds = userBloodRequests.map((item) => item._id);
  const responseIds = userResponses.map((item) => item._id);
  const donationRequestIds = userDonationRequests.map((item) => item._id);
  const relatedBloodDonationRequests = await DonationRequest.find({
    bloodRequest: { $in: bloodRequestIds },
  }).select("_id");
  relatedBloodDonationRequests.forEach((item) =>
    donationRequestIds.push(item._id),
  );

  await Notification.deleteMany({
    $or: [
      { recipient: userId },
      { bloodRequest: { $in: bloodRequestIds } },
      { donationRequest: { $in: donationRequestIds } },
      { bloodRequestResponse: { $in: responseIds } },
    ],
  });
  await DonationRequest.deleteMany({
    $or: [
      { requester: userId },
      { donor: userId },
      { bloodRequest: { $in: bloodRequestIds } },
    ],
  });
  await BloodRequestResponse.deleteMany({
    $or: [{ donor: userId }, { bloodRequest: { $in: bloodRequestIds } }],
  });
  await BloodRequest.deleteMany({ requester: userId });
  await Donor.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);
};

export const getAdminUsers = async (req, res) => {
  try {
    const { page, limit, skip } = pageOptions(req.query);
    const filter = {};
    if (req.query.role) {
      if (!userRoles.includes(req.query.role)) {
        return res.status(400).json({ message: "Invalid user role filter" });
      }
      filter.role = req.query.role;
    }
    if (req.query.search?.trim()) {
      const regex = makeSearchRegex(req.query.search.trim());
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("name email phone role createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);
    res.status(200).json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, phone = "", role, password } = req.body;
    const validationError = validateUserFields({ name, email, phone, role });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role,
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Create admin user error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const { name, email, phone = "", role, password } = req.body;
    const validationError = validateUserFields({ name, email, phone, role });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    if (
      password !== undefined &&
      (typeof password !== "string" || (password && password.length < 8))
    ) {
      return res.status(400).json({
        message: "A new password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      user.role === "ADMIN" &&
      role !== "ADMIN" &&
      (user._id.toString() === req.user.userId.toString() ||
        (await User.countDocuments({ role: "ADMIN" })) <= 1)
    ) {
      return res.status(400).json({
        message: "You cannot remove the last administrator account",
      });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone.trim();
    user.role = role;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Update admin user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(req.params.id).select("name role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user._id.toString() === req.user.userId.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    if (
      user.role === "ADMIN" &&
      (await User.countDocuments({ role: "ADMIN" })) <= 1
    ) {
      return res.status(400).json({
        message: "You cannot delete the last administrator account",
      });
    }

    await deleteUserAndRelatedData(user._id);
    res.status(200).json({
      message: `User ${user.name} and related records were deleted`,
    });
  } catch (error) {
    console.error("Delete admin user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getAdminDashboard = async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeRequestFilter = {
      status: { $in: ["PENDING", "ACCEPTED"] },
      requiredDate: { $gte: today },
    };

    const [
      userCount,
      donorCount,
      requestCount,
      activeRequestCount,
      pendingDonationRequestCount,
      recentRequests,
    ] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments(activeRequestFilter),
      DonationRequest.countDocuments({ status: "PENDING" }),
      BloodRequest.find()
        .populate("requester", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("bloodGroup hospital location urgency status requiredDate createdAt"),
    ]);

    res.status(200).json({
      stats: {
        users: userCount,
        donors: donorCount,
        bloodRequests: requestCount,
        activeBloodRequests: activeRequestCount,
        pendingDonationRequests: pendingDonationRequestCount,
      },
      recentRequests,
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};

export const getAdminDonors = async (req, res) => {
  try {
    const { page, limit, skip } = pageOptions(req.query);
    const filter = {};
    const { search, bloodGroup, city } = req.query;

    if (bloodGroup) {
      if (!bloodGroups.includes(bloodGroup)) {
        return res.status(400).json({ message: "Invalid blood group filter" });
      }
      filter.bloodGroup = bloodGroup;
    }
    if (city?.trim()) {
      filter["location.city"] = makeSearchRegex(city.trim());
    }
    if (search?.trim()) {
      const regex = makeSearchRegex(search.trim());
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }],
      }).select("_id");
      filter.$or = [
        { user: { $in: matchingUsers.map((user) => user._id) } },
        { "location.area": regex },
        { "location.city": regex },
      ];
    }

    const [total, donors] = await Promise.all([
      Donor.countDocuments(filter),
      Donor.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      donors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get admin donors error:", error);
    res.status(500).json({ message: "Failed to retrieve donors" });
  }
};

export const getAdminBloodRequests = async (req, res) => {
  try {
    const { page, limit, skip } = pageOptions(req.query);
    const filter = {};
    const { search, bloodGroup, status } = req.query;

    if (bloodGroup) {
      if (!bloodGroups.includes(bloodGroup)) {
        return res.status(400).json({ message: "Invalid blood group filter" });
      }
      filter.bloodGroup = bloodGroup;
    }
    if (status) {
      if (!bloodRequestStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid request status filter" });
      }
      filter.status = status;
    }
    if (search?.trim()) {
      const regex = makeSearchRegex(search.trim());
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }],
      }).select("_id");
      filter.$or = [
        { hospital: regex },
        { "location.area": regex },
        { "location.city": regex },
        { requester: { $in: matchingUsers.map((user) => user._id) } },
      ];
    }

    const [total, bloodRequests] = await Promise.all([
      BloodRequest.countDocuments(filter),
      BloodRequest.find(filter)
        .populate("requester", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      bloodRequests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get admin blood requests error:", error);
    res.status(500).json({ message: "Failed to retrieve blood requests" });
  }
};

export const cancelAdminBloodRequest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blood request ID" });
    }

    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }
    if (["CANCELLED", "COMPLETED"].includes(bloodRequest.status)) {
      return res.status(400).json({
        message: `A ${bloodRequest.status.toLowerCase()} request cannot be cancelled`,
      });
    }

    bloodRequest.status = "CANCELLED";
    await bloodRequest.save();
    res.status(200).json({
      message: "Blood request cancelled successfully",
      bloodRequest,
    });
  } catch (error) {
    console.error("Admin cancel blood request error:", error);
    res.status(500).json({ message: "Failed to cancel blood request" });
  }
};

export const deleteAdminBloodRequest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blood request ID" });
    }

    const bloodRequest = await BloodRequest.findById(req.params.id).select("_id");
    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    const relatedDonationRequests = await DonationRequest.find({
      bloodRequest: bloodRequest._id,
    }).select("_id");
    const donationRequestIds = relatedDonationRequests.map(
      (request) => request._id,
    );

    await BloodRequestResponse.deleteMany({ bloodRequest: bloodRequest._id });
    await DonationRequest.deleteMany({ bloodRequest: bloodRequest._id });
    await Notification.deleteMany({
      $or: [
        { bloodRequest: bloodRequest._id },
        { donationRequest: { $in: donationRequestIds } },
      ],
    });
    await BloodRequest.findByIdAndDelete(bloodRequest._id);

    res.status(200).json({ message: "Blood request removed successfully" });
  } catch (error) {
    console.error("Admin delete blood request error:", error);
    res.status(500).json({ message: "Failed to remove blood request" });
  }
};
