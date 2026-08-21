const express = require("express");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const upload = require("../middleware/upload");
const {
  createDonation,
  getMyDonations,
  getDonationMatches,
  advanceDonationStatus,
  getDonationsForMap,
} = require("../controllers/donationController");

const router = express.Router();

router.post("/", auth, roleCheck("donor"), upload.single("photo"), createDonation);
router.get("/mine", auth, roleCheck("donor"), getMyDonations);
router.get("/map", auth, getDonationsForMap);
router.get("/:id/matches", auth, roleCheck("donor"), getDonationMatches);
router.patch("/:id/status", auth, roleCheck("ngo"), advanceDonationStatus);

module.exports = router;
