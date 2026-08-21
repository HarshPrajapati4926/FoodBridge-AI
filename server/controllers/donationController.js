const Donation = require("../models/Donation");
const Match = require("../models/Match");
const NGO = require("../models/NGO");
const { parseDonationDescription } = require("../utils/openaiParse");
const { matchDonationToNGOs } = require("../utils/matchingEngine");

const STATUS_FLOW = { accepted: "picked_up", picked_up: "delivered" };

const VALID_URGENCIES = ["<1hr", "1-3hrs", "3-6hrs", "6-24hrs", ">24hrs"];

async function createDonation(req, res) {
  try {
    const { foodType, quantity, unit, lat, lng, pickupAddress, urgency, description } = req.body;

    if (!foodType || !quantity || !unit || lat == null || lng == null || !urgency) {
      return res.status(400).json({
        message: "foodType, quantity, unit, lat, lng, and urgency are required",
      });
    }

    if (!VALID_URGENCIES.includes(urgency)) {
      return res.status(400).json({ message: "Invalid urgency value" });
    }

    const numericQuantity = Number(quantity);
    const numericLat = parseFloat(lat);
    const numericLng = parseFloat(lng);

    if (
      !Number.isFinite(numericQuantity) ||
      !Number.isFinite(numericLat) ||
      !Number.isFinite(numericLng)
    ) {
      return res.status(400).json({ message: "quantity, lat, and lng must be valid numbers" });
    }

    const aiParsed = await parseDonationDescription(description);

    const donation = await Donation.create({
      donor: req.user.id,
      foodType,
      quantity: numericQuantity,
      unit,
      location: { lat: numericLat, lng: numericLng },
      pickupAddress: pickupAddress || "",
      urgency,
      description: description || "",
      photoUrl: req.file ? `/uploads/${req.file.filename}` : "",
      aiParsed,
      status: "pending",
    });

    const matches = await matchDonationToNGOs(donation);
    const updatedDonation = await Donation.findById(donation._id);

    res.status(201).json({ donation: updatedDonation, matches });
  } catch (err) {
    res.status(500).json({ message: "Failed to create donation", error: err.message });
  }
}

async function getDonationMatches(req, res) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const matches = await Match.find({ donation: donation._id })
      .sort({ rank: 1 })
      .populate("ngo", "organizationName address location capacity needs");

    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch matches", error: err.message });
  }
}

async function getMyDonations(req, res) {
  try {
    const donations = await Donation.find({ donor: req.user.id }).sort({ createdAt: -1 });
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations", error: err.message });
  }
}

async function advanceDonationStatus(req, res) {
  try {
    const ngo = await NGO.findOne({ user: req.user.id });
    if (!ngo) return res.status(404).json({ message: "NGO profile not found" });

    const donation = await Donation.findById(req.params.id);
    if (!donation || !donation.acceptedNGO || donation.acceptedNGO.toString() !== ngo._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const nextStatus = STATUS_FLOW[donation.status];
    if (!nextStatus) {
      return res.status(400).json({ message: `Cannot advance from status '${donation.status}'` });
    }

    donation.status = nextStatus;
    await donation.save();

    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: "Failed to update donation status", error: err.message });
  }
}

async function getDonationsForMap(req, res) {
  try {
    const donations = await Donation.find(
      {},
      "foodType quantity unit location status urgency createdAt"
    ).limit(500);
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations", error: err.message });
  }
}

module.exports = {
  createDonation,
  getMyDonations,
  getDonationMatches,
  advanceDonationStatus,
  getDonationsForMap,
};
