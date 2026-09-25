import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Short notification title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Used to identify the notification type
    type: {
      type: String,
      enum: [
        "DONATION_REQUEST",
        "REQUEST_ACCEPTED",
        "REQUEST_REJECTED",
        "BLOOD_REQUEST",
      ],
      required: true,
    },

    // Whether the notification has been read
    isRead: {
      type: Boolean,
      default: false,
    },

    // Related donation request
    donationRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationRequest",
      default: null,
    },

    // Related blood request
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      default: null,
    },
  },
  { timestamps: true }
);

// Create the Notification model
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;