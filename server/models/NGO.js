const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    organizationName: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    capacity: { type: String, default: "" }, // e.g. "up to 100 meals/day"
    needs: { type: String, default: "" }, // free-text stated needs, used as matching context
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
