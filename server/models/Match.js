const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    reasoning: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    rank: { type: Number, required: true }, // 1 = top match
    status: {
      type: String,
      enum: ["suggested", "accepted", "rejected"],
      default: "suggested",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
