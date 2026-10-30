import BloodRequest from "../models/BloodRequest.js";
import BloodRequestResponse from "../models/BloodRequestResponse.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Create a new blood request
export const createBloodRequest = async (req, res) => {
  try {
    // Get request data from the client
    const {
      bloodGroup,
      units,
      hospital,
      location,
      urgency,
      requiredDate,
      contactPhone,
      message
    } = req.body;

    // Check required fields
    if (
      !bloodGroup ||
      !units ||
      !hospital ||
      !location?.area ||
      !location?.city ||
      !requiredDate ||
      !contactPhone
    ) {
      return res.status(400).json({
        message: "Please provide all required blood request details"
      });
    }

    // Create the blood request
    const bloodRequest = await BloodRequest.create({
      requester: req.user.userId,
      bloodGroup,
      units,
      hospital,
      location,
      urgency: urgency || "NORMAL",
      requiredDate,
      contactPhone,
      message: message || ""
    });

    // Send the created request back to the client
    res.status(201).json({
      message: "Blood request created successfully",
      bloodRequest
    });
  } catch (error) {
    console.error("Create blood request error:", error);

    res.status(500).json({
      message: "Failed to create blood request"
    });
  }
};


// Get all blood requests created by the logged-in user
export const getMyBloodRequests = async (req, res) => {
  try {
    // Find requests belonging to the logged-in user
    const bloodRequests = await BloodRequest.find({
      requester: req.user.userId
    }).sort({ createdAt: -1 });

    // Send the requests back to the client
    res.status(200).json({
      message: "Blood requests retrieved successfully",
      bloodRequests
    });
  } catch (error) {
    console.error("Get blood requests error:", error);

    res.status(500).json({
      message: "Failed to retrieve blood requests"
    });
  }
};

export const getLatestBloodRequests = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bloodRequests = await BloodRequest.find({
      requester: { $ne: req.user.userId },
      status: { $in: ["PENDING", "ACCEPTED"] },
      requiredDate: { $gte: today },
    })
      .select(
        "bloodGroup units hospital location urgency requiredDate contactPhone message requester createdAt",
      )
      .populate("requester", "name")
      .sort({ createdAt: -1 })
      .limit(3);
    // Include each request's response status so the client can prevent duplicates.
    const respondedRequestIds = await BloodRequestResponse.find({
      donor: req.user.userId,
      bloodRequest: { $in: bloodRequests.map((request) => request._id) },
    }).distinct("bloodRequest");
    const respondedRequestIdSet = new Set(
      respondedRequestIds.map((id) => id.toString()),
    );
    const requestsWithResponseStatus = bloodRequests.map((request) => ({
      ...request.toObject(),
      hasResponded: respondedRequestIdSet.has(request._id.toString()),
    }));

    res.status(200).json({
      message: "Latest blood requests retrieved successfully",
      bloodRequests: requestsWithResponseStatus,
    });
  } catch (error) {
    console.error("Get latest blood requests error:", error);

    res.status(500).json({
      message: "Failed to retrieve latest blood requests",
    });
  }
};

export const respondToBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const bloodRequest = await BloodRequest.findById(id);

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    if (bloodRequest.requester.toString() === req.user.userId.toString()) {
      return res.status(400).json({
        message: "You cannot respond to your own blood request",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (
      !["PENDING", "ACCEPTED"].includes(bloodRequest.status) ||
      bloodRequest.requiredDate < today
    ) {
      return res.status(400).json({
        message: "This blood request is no longer active",
      });
    }

    const donor = await User.findById(req.user.userId).select("name phone");
    if (!donor) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingResponse = await BloodRequestResponse.findOne({
      bloodRequest: bloodRequest._id,
      donor: donor._id,
    });
    if (existingResponse) {
      return res.status(409).json({
        message: "You have already responded to this blood request",
      });
    }

    const bloodRequestResponse = await BloodRequestResponse.create({
      bloodRequest: bloodRequest._id,
      donor: donor._id,
    });

    try {
      await Notification.create({
        recipient: bloodRequest.requester,
        title: "Someone offered to donate",
        message: `${donor.name} has offered to donate for your ${bloodRequest.bloodGroup} blood request. Contact: ${donor.phone}`,
        type: "BLOOD_REQUEST_RESPONSE",
        bloodRequest: bloodRequest._id,
        bloodRequestResponse: bloodRequestResponse._id,
      });
    } catch (error) {
      // Remove the response if its notification could not be created.
      await BloodRequestResponse.findByIdAndDelete(bloodRequestResponse._id);
      throw error;
    }

    res.status(201).json({
      message: "Your offer to donate has been sent to the requester",
      bloodRequestResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already responded to this blood request",
      });
    }

    console.error("Respond to blood request error:", error);
    res.status(500).json({
      message: "Failed to send your offer to donate",
    });
  }
};

export const getCommunityBloodRequests = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bloodRequests = await BloodRequest.find({
      requester: { $ne: req.user.userId },
      status: { $in: ["PENDING", "ACCEPTED"] },
      requiredDate: { $gte: today },
    })
      .select(
        "bloodGroup units hospital location urgency requiredDate contactPhone message requester createdAt",
      )
      .populate("requester", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Community blood requests retrieved successfully",
      bloodRequests,
    });
  } catch (error) {
    console.error("Get community blood requests error:", error);

    res.status(500).json({
      message: "Failed to retrieve community blood requests",
    });
  }
};

// Update one of the logged-in user's blood requests
export const updateBloodRequest = async (req, res) => {
  try {
    // Get the request ID from the URL
    const { id } = req.params;

    // Find the request
    const bloodRequest = await BloodRequest.findOne({
      _id: id,
      requester: req.user.userId
    });

    // Check if the request exists
    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }

    // Get updated data from the request body
    const {
      bloodGroup,
      units,
      hospital,
      location,
      urgency,
      requiredDate,
      contactPhone,
      message
    } = req.body;

    // Update only the fields that were provided
    if (bloodGroup !== undefined) {
      bloodRequest.bloodGroup = bloodGroup;
    }

    if (units !== undefined) {
      bloodRequest.units = units;
    }

    if (hospital !== undefined) {
      bloodRequest.hospital = hospital;
    }

    if (location !== undefined) {
      bloodRequest.location = location;
    }

    if (urgency !== undefined) {
      bloodRequest.urgency = urgency;
    }

    if (requiredDate !== undefined) {
      bloodRequest.requiredDate = requiredDate;
    }

    if (contactPhone !== undefined) {
      bloodRequest.contactPhone = contactPhone;
    }

    if (message !== undefined) {
      bloodRequest.message = message;
    }

    // Save the updated request
    await bloodRequest.save();

    // Return the updated request
    res.status(200).json({
      message: "Blood request updated successfully",
      bloodRequest
    });
  } catch (error) {
    console.error("Update blood request error:", error);

    res.status(500).json({
      message: "Failed to update blood request"
    });
  }
};

// Cancel one of the logged-in user's blood requests
export const cancelBloodRequest = async (req, res) => {
  try {
    // Get the request ID from the URL
    const { id } = req.params;

    // Find the request belonging to the logged-in user
    const bloodRequest = await BloodRequest.findOne({
      _id: id,
      requester: req.user.userId
    });

    // Check if the request exists
    if (!bloodRequest) {
      return res.status(404).json({
        message: "Blood request not found"
      });
    }

    // Check if the request is already completed
    if (bloodRequest.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed blood requests cannot be cancelled"
      });
    }

    // Change the status to CANCELLED
    bloodRequest.status = "CANCELLED";

    // Save the change
    await bloodRequest.save();

    // Return the updated request
    res.status(200).json({
      message: "Blood request cancelled successfully",
      bloodRequest
    });
  } catch (error) {
    console.error("Cancel blood request error:", error);

    res.status(500).json({
      message: "Failed to cancel blood request"
    });
  }
};