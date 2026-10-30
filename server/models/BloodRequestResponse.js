import mongoose from "mongoose";

const bloodRequestResponseSchema = new mongoose.Schema(
  {
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent a donor from responding to the same request more than once.
bloodRequestResponseSchema.index(
  { bloodRequest: 1, donor: 1 },
  { unique: true },
);

const BloodRequestResponse = mongoose.model(
  "BloodRequestResponse",
  bloodRequestResponseSchema,
);

export default BloodRequestResponse;
