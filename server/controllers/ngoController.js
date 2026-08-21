const NGO = require("../models/NGO");
const Match = require("../models/Match");
const Donation = require("../models/Donation");

async function getMyNGOProfile(req) {
  return NGO.findOne({ user: req.user.id });
}

async function getMatchedDonations(req, res) {
  try {
    const ngo = await getMyNGOProfile(req);
    if (!ngo) return res.status(404).json({ message: "NGO profile not found" });

    const matches = await Match.find({ ngo: ngo._id, status: "suggested" })
      .sort({ score: -1 })
      .populate("donation");

    const awaitingDecision = matches.filter((m) => m.donation && m.donation.status === "matched");

    res.json({ matches: awaitingDecision });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch matches", error: err.message });
  }
}

async function acceptMatch(req, res) {
  try {
    const ngo = await getMyNGOProfile(req);
    if (!ngo) return res.status(404).json({ message: "NGO profile not found" });

    const match = await Match.findById(req.params.matchId);
    if (!match || match.ngo.toString() !== ngo._id.toString()) {
      return res.status(404).json({ message: "Match not found" });
    }

    const donation = await Donation.findById(match.donation);
    if (!donation || donation.status !== "matched") {
      return res.status(400).json({ message: "Donation is no longer available" });
    }

    match.status = "accepted";
    await match.save();

    await Match.updateMany(
      { donation: donation._id, _id: { $ne: match._id }, status: "suggested" },
      { status: "rejected" }
    );

    donation.status = "accepted";
    donation.acceptedNGO = ngo._id;
    await donation.save();

    res.json({ donation, match });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept match", error: err.message });
  }
}

async function rejectMatch(req, res) {
  try {
    const ngo = await getMyNGOProfile(req);
    if (!ngo) return res.status(404).json({ message: "NGO profile not found" });

    const match = await Match.findById(req.params.matchId);
    if (!match || match.ngo.toString() !== ngo._id.toString()) {
      return res.status(404).json({ message: "Match not found" });
    }

    match.status = "rejected";
    await match.save();

    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject match", error: err.message });
  }
}

async function getMyAcceptedDonations(req, res) {
  try {
    const ngo = await getMyNGOProfile(req);
    if (!ngo) return res.status(404).json({ message: "NGO profile not found" });

    const donations = await Donation.find({ acceptedNGO: ngo._id }).sort({ updatedAt: -1 });
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations", error: err.message });
  }
}

async function getAllNGOsForMap(req, res) {
  try {
    const ngos = await NGO.find({ isActive: true }, "organizationName location capacity needs address");
    res.json({ ngos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch NGOs", error: err.message });
  }
}

module.exports = {
  getMatchedDonations,
  acceptMatch,
  rejectMatch,
  getMyAcceptedDonations,
  getAllNGOsForMap,
};
