import mongoose from "mongoose";

const donationRequestSchema = new mongoose.Schema(
  {
    // The person who needs blood
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // The donor receiving the request
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Optional link for requests created from a saved blood request.
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      default: null
    },

    // Blood group needed when the request is sent directly to a donor.
    bloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ],
      default: null
    },

    // Current status of the donation request
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "CANCELLED",
        "COMPLETED"
      ],
      default: "PENDING"
    },

    // Optional message from the requester
    message: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const DonationRequest = mongoose.model(
  "DonationRequest",
  donationRequestSchema
);

export default DonationRequest;