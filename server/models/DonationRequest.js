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

    // The blood request connected to this donation request
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true
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