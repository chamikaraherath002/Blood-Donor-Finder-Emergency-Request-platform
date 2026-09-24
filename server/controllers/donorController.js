import Donor from "../models/Donor.js";

export const createDonorProfile = async (req, res) => {
  try {
    const { bloodGroup, availability, location, lastDonationDate } =
      req.body;

    // Check required fields
    if (!bloodGroup || !location?.area || !location?.city) {
      return res.status(400).json({
        message: "Please provide blood group and location"
      });
    }

    // Check if user already has a donor profile
    const existingDonor = await Donor.findOne({
      user: req.user.userId
    });

    if (existingDonor) {
      return res.status(409).json({
        message: "Donor profile already exists"
      });
    }

    // Create donor profile
    const donor = await Donor.create({
      user: req.user.userId,
      bloodGroup,
      availability: availability ?? true,
      location,
      lastDonationDate: lastDonationDate || null
    });

    res.status(201).json({
      message: "Donor profile created successfully",
      donor
    });
  } catch (error) {
    console.error("Create donor error:", error);

    res.status(500).json({
      message: "Failed to create donor profile"
    });
  }
};