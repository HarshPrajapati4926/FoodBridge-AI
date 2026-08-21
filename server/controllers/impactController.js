const Donation = require("../models/Donation");
const NGO = require("../models/NGO");

async function getImpactStats(req, res) {
  try {
    const [totalDonations, distinctDonors, activeNGOs, delivered, timeline] = await Promise.all([
      Donation.countDocuments({}),
      Donation.distinct("donor"),
      NGO.countDocuments({ isActive: true }),
      Donation.countDocuments({ status: "delivered" }),
      Donation.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      totalDonations,
      activeDonors: distinctDonors.length,
      activeNGOs,
      delivered,
      timeline: timeline.map((t) => ({ date: t._id, count: t.count })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch impact stats", error: err.message });
  }
}

module.exports = { getImpactStats };
