const express = require("express");
const auth = require("../middleware/auth");
const { getImpactStats } = require("../controllers/impactController");

const router = express.Router();

router.get("/stats", auth, getImpactStats);

module.exports = router;
