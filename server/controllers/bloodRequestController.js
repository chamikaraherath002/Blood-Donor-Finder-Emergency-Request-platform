import BloodRequest from "../models/BloodRequest.js";

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