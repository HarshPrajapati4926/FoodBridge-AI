const express = require("express");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getMatchedDonations,
  acceptMatch,
  rejectMatch,
  getMyAcceptedDonations,
  getAllNGOsForMap,
} = require("../controllers/ngoController");

const router = express.Router();

router.get("/matches", auth, roleCheck("ngo"), getMatchedDonations);
router.patch("/matches/:matchId/accept", auth, roleCheck("ngo"), acceptMatch);
router.patch("/matches/:matchId/reject", auth, roleCheck("ngo"), rejectMatch);
router.get("/donations", auth, roleCheck("ngo"), getMyAcceptedDonations);
router.get("/map", auth, getAllNGOsForMap);

module.exports = router;
