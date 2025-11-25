import mongoose from "mongoose";

const consultantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    designation: { type: String, required: true },
    experience: { type: Number, required: true },
    money: { type: Number, required: true },
    moneyType: {
      type: String,
      enum: ["minute", "hour", "project"],
      default: "project",
    },
    expertise: { type: String, required: true },
    certifications: { type: String, default: "" },
    languages: { type: [String], default: [] },
    image: { type: String, required: true },
    idProof: { type: String, required: true },
    address: { type: String, default: "" },
    location: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
  },
  { timestamps: true }
);

consultantSchema.index({ name: 1, phone: 1 }, { unique: true });

export default mongoose.model("Consultant", consultantSchema);