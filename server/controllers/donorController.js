import Donor from "../models/Donor.js";

export const createDonorProfile = async (req, res) => {
  try {
    const { bloodGroup, availability, location, lastDonationDate } = req.body;

    // Check required fields
    if (!bloodGroup || !location?.area || !location?.city) {
      return res.status(400).json({
        message: "Please provide blood group and location",
      });
    }

    // Check if user already has a donor profile
    const existingDonor = await Donor.findOne({
      user: req.user.userId,
    });

    if (existingDonor) {
      return res.status(409).json({
        message: "Donor profile already exists",
      });
    }

    // Create donor profile
    const donor = await Donor.create({
      user: req.user.userId,
      bloodGroup,
      availability: availability ?? true,
      location,
      lastDonationDate: lastDonationDate || null,
    });

    res.status(201).json({
      message: "Donor profile created successfully",
      donor,
    });
  } catch (error) {
    console.error("Create donor error:", error);

    res.status(500).json({
      message: "Failed to create donor profile",
    });
  }
};

// Get the logged-in user's donor profile
export const getMyDonorProfile = async (req, res) => {
  try {
    // Find donor profile using the logged-in user's ID
    const donor = await Donor.findOne({
      user: req.user.userId
    }).populate("user", "name email phone role");

    // If donor profile doesn't exist
    if (!donor) {
      return res.status(404).json({
        message: "Donor profile not found"
      });
    }

    // Send donor profile to the client
    res.status(200).json({
      message: "Donor profile retrieved successfully",
      donor
    });
  } catch (error) {
    console.error("Get donor profile error:", error);

    res.status(500).json({
      message: "Failed to retrieve donor profile"
    });
  }
};

// Update the logged-in user's donor profile
export const updateMyDonorProfile = async (req, res) => {
  try {
    // Get the updated data from the request
    const {
      bloodGroup,
      availability,
      location,
      lastDonationDate
    } = req.body;

    // Find the donor profile of the logged-in user
    const donor = await Donor.findOne({
      user: req.user.userId
    });

    // If the donor profile doesn't exist
    if (!donor) {
      return res.status(404).json({
        message: "Donor profile not found"
      });
    }

    // Update only the fields that were provided
    if (bloodGroup !== undefined) {
      donor.bloodGroup = bloodGroup;
    }

    if (availability !== undefined) {
      donor.availability = availability;
    }

    if (location !== undefined) {
      donor.location = location;
    }

    if (lastDonationDate !== undefined) {
      donor.lastDonationDate = lastDonationDate;
    }

    // Save the updated donor profile
    await donor.save();

    // Send the updated profile back
    res.status(200).json({
      message: "Donor profile updated successfully",
      donor
    });
  } catch (error) {
    console.error("Update donor error:", error);

    res.status(500).json({
      message: "Failed to update donor profile"
    });
  }
};
