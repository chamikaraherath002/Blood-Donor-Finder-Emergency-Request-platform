import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

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

    availability: {
      type: Boolean,
      default: true
    },

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

    lastDonationDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Donor = mongoose.model("Donor", donorSchema);

export default Donor;