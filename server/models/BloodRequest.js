import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    // User who created the blood request
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Blood group needed
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
      required: true
    },

    // Number of blood units needed
    units: {
      type: Number,
      required: true,
      min: 1
    },

    // Hospital where the blood is needed
    hospital: {
      type: String,
      required: true,
      trim: true
    },

    // Hospital/city location
    location: {
      area: {
        type: String,
        required: true,
        trim: true
      },

      city: {
        type: String,
        required: true,
        trim: true
      }
    },

    // How urgent the request is
    urgency: {
      type: String,
      enum: ["NORMAL", "URGENT", "EMERGENCY"],
      default: "NORMAL"
    },

    // Date when blood is required
    requiredDate: {
      type: Date,
      required: true
    },

    // Contact number for the request
    contactPhone: {
      type: String,
      required: true,
      trim: true
    },

    // Additional information from the requester
    message: {
      type: String,
      trim: true,
      default: ""
    },

    // Current status of the request
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "DONATED",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
        "EXPIRED"
      ],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

// Create the BloodRequest model
const BloodRequest = mongoose.model(
  "BloodRequest",
  bloodRequestSchema
);

export default BloodRequest;