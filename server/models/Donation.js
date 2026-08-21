const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodType: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true }, // e.g. kg, plates, packets
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    pickupAddress: { type: String, trim: true, default: "" },
    urgency: {
      type: String,
      enum: ["<1hr", "1-3hrs", "3-6hrs", "6-24hrs", ">24hrs"],
      required: true,
    },
    description: { type: String, trim: true, default: "" },
    photoUrl: { type: String, default: "" },
    aiParsed: {
      food_type: { type: String, default: "" },
      estimated_quantity: { type: String, default: "" },
      perishability: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "matched", "accepted", "picked_up", "delivered", "rejected"],
      default: "pending",
    },
    acceptedNGO: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", default: null },
    isSeedData: { type: Boolean, default: false }, // marks demo/seeded donations for impact dashboard
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
