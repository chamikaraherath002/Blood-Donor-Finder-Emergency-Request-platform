import DonationRequest from "../models/DonationRequest.js";
import Donor from "../models/Donor.js";
import BloodRequest from "../models/BloodRequest.js";
import Notification from "../models/Notification.js";

// Send a donation request to a donor
export const createDonationRequest = async (req, res) => {
  try {
    const { donorId, bloodRequestId, message } = req.body;

    // Check that required IDs were provided
    if (!donorId || !bloodRequestId) {
      return res.status(400).json({
        message: "Please provide donor ID and blood request ID",
      });
    }

    // Check that the blood request belongs to the logged-in user
    const bloodRequest = await BloodRequest.findOne({
      _id: bloodRequestId,
      requester: req.user.userId,
    });

    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found",
      });
    }

    // Only pending blood requests can receive donation requests
    if (bloodRequest.status !== "PENDING") {
      return res.status(400).json({
        message:
          "Donation requests can only be sent for pending blood requests",
      });
    }

    // Find the donor profile
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({
        message: "Donor not found",
      });
    }

    // Make sure the donor is currently available
    if (!donor.availability) {
      return res.status(400).json({
        message: "This donor is currently unavailable",
      });
    }

    // Prevent sending a request to yourself
    if (donor.user.toString() === req.user.userId.toString()) {
      return res.status(400).json({
        message: "You cannot send a donation request to yourself",
      });
    }

    // Check whether a request already exists
    const existingRequest = await DonationRequest.findOne({
      requester: req.user.userId,
      donor: donor.user,
      bloodRequest: bloodRequestId,
      status: "PENDING",
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "A donation request has already been sent to this donor",
      });
    }

    // Create the donation request
    const donationRequest = await DonationRequest.create({
      requester: req.user.userId,
      donor: donor.user,
      bloodRequest: bloodRequestId,
      message: message || "",
    });
    console.log("Creating notification for donor:", donor.user);
    // Create a notification for the donor
    await Notification.create({
      recipient: donor.user,
      title: "New Donation Request",
      message: "You received a new blood donation request.",
      type: "DONATION_REQUEST",
      donationRequest: donationRequest._id,
      bloodRequest: bloodRequest._id,
    });

    // Return the created request
    res.status(201).json({
      message: "Donation request sent successfully",
      donationRequest,
    });
  } catch (error) {
    console.error("Create donation request error:", error);

    res.status(500).json({
      message: "Failed to send donation request",
    });
  }
};

// Get donation requests received by the logged-in donor
export const getMyReceivedDonationRequests = async (req, res) => {
  try {
    // Find requests where the logged-in user is the donor
    const donationRequests = await DonationRequest.find({
      donor: req.user.userId,
    })
      .populate("requester", "name email phone")
      .populate(
        "bloodRequest",
        "bloodGroup units hospital location urgency requiredDate status",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Received donation requests retrieved successfully",
      donationRequests,
    });
  } catch (error) {
    console.error("Get received donation requests error:", error);

    res.status(500).json({
      message: "Failed to retrieve received donation requests",
    });
  }
};

// Get donation requests sent by the logged-in user
export const getMySentDonationRequests = async (req, res) => {
  try {
    // Find requests where the logged-in user is the requester
    const donationRequests = await DonationRequest.find({
      requester: req.user.userId,
    })
      .populate("donor", "name email phone")
      .populate(
        "bloodRequest",
        "bloodGroup units hospital location urgency requiredDate status",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sent donation requests retrieved successfully",
      donationRequests,
    });
  } catch (error) {
    console.error("Get sent donation requests error:", error);

    res.status(500).json({
      message: "Failed to retrieve sent donation requests",
    });
  }
};

// Accept a donation request
export const acceptDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the donation request sent to the logged-in donor
    const donationRequest = await DonationRequest.findOne({
      _id: id,
      donor: req.user.userId,
    });

    if (!donationRequest) {
      return res.status(404).json({
        message: "Donation request not found",
      });
    }

    // Only pending requests can be accepted
    if (donationRequest.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending donation requests can be accepted",
      });
    }

    // Update the donation request status
    donationRequest.status = "ACCEPTED";

    await donationRequest.save();

    // Create a notification for the requester
    await Notification.create({
      recipient: donationRequest.requester,
      title: "Donation Request Accepted",
      message: "Your donation request has been accepted by the donor.",
      type: "REQUEST_ACCEPTED",
      donationRequest: donationRequest._id,
      bloodRequest: donationRequest.bloodRequest,
    });

    res.status(200).json({
      message: "Donation request accepted successfully",
      donationRequest,
    });
  } catch (error) {
    console.error("Accept donation request error:", error);

    res.status(500).json({
      message: "Failed to accept donation request",
    });
  }
};

// Reject a donation request
export const rejectDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the donation request sent to the logged-in donor
    const donationRequest = await DonationRequest.findOne({
      _id: id,
      donor: req.user.userId,
    });

    if (!donationRequest) {
      return res.status(404).json({
        message: "Donation request not found",
      });
    }

    // Only pending requests can be rejected
    if (donationRequest.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending donation requests can be rejected",
      });
    }

    // Update the donation request status
    donationRequest.status = "REJECTED";

    await donationRequest.save();

    // Create a notification for the requester
    await Notification.create({
      recipient: donationRequest.requester,
      title: "Donation Request Rejected",
      message: "Your donation request has been rejected by the donor.",
      type: "REQUEST_REJECTED",
      donationRequest: donationRequest._id,
      bloodRequest: donationRequest.bloodRequest,
    });

    res.status(200).json({
      message: "Donation request rejected successfully",
      donationRequest,
    });
  } catch (error) {
    console.error("Reject donation request error:", error);

    res.status(500).json({
      message: "Failed to reject donation request",
    });
  }
};
