import Donor from "../models/Donor.js";
import bloodCompatibility from "../utils/bloodCompatibility.js";

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

// Search for available donors who can match the requested blood group
export const searchDonors = async (req, res) => {
  try {
    // Get search filters from the URL
    const { bloodGroup, city, area } = req.query;

    // Blood group is required for compatibility matching
    if (!bloodGroup) {
      return res.status(400).json({
        message: "Please provide a blood group"
      });
    }

    // Check whether the blood group is supported
    const compatibleGroups = bloodCompatibility[bloodGroup];

    if (!compatibleGroups) {
      return res.status(400).json({
        message: "Invalid blood group"
      });
    }

    // Build the database search conditions
    const searchConditions = {
      // Only return donors who are currently available
      availability: true,

      // Find donors whose blood group can match the requested group
      bloodGroup: {
        $in: compatibleGroups
      }
    };

    // Add city filter if the user provided one
    if (city) {
      searchConditions["location.city"] = city;
    }

    // Add area filter if the user provided one
    if (area) {
      searchConditions["location.area"] = area;
    }

    // Search the donor collection
    const donors = await Donor.find(searchConditions)
      // Get basic information about the donor's user account
      .populate("user", "name email phone role")
      // Show newest donor profiles first
      .sort({ createdAt: -1 });

    // Return the matching donors
    res.status(200).json({
      message: "Donors retrieved successfully",
      requestedBloodGroup: bloodGroup,
      compatibleBloodGroups: compatibleGroups,
      count: donors.length,
      donors
    });
  } catch (error) {
    console.error("Search donors error:", error);

    res.status(500).json({
      message: "Failed to search donors"
    });
  }
};
