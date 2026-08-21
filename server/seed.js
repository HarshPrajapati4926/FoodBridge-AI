// Demo/seed data for hackathon presentation purposes only.
// Creates a handful of demo donors, NGOs, and backdated past donations so the
// impact dashboard and map have realistic-looking activity during a live demo.
// Idempotent: safe to re-run - skips donation seeding if seed donations already exist.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const NGO = require("./models/NGO");
const Donation = require("./models/Donation");
const Match = require("./models/Match");

const SEED_DONORS = [
  { name: "Green Leaf Restaurant", email: "seed.donor1@foodbridge.demo" },
  { name: "Sunrise Banquet Hall", email: "seed.donor2@foodbridge.demo" },
  { name: "Fresh Farms Co-op", email: "seed.donor3@foodbridge.demo" },
];

const SEED_NGOS = [
  {
    name: "Helping Hands Trust",
    email: "seed.ngo1@foodbridge.demo",
    organizationName: "Helping Hands Trust",
    lat: 19.076,
    lng: 72.8777,
    capacity: "150 meals/day",
    needs: "cooked meals, rice, vegetables",
  },
  {
    name: "City Food Bank",
    email: "seed.ngo2@foodbridge.demo",
    organizationName: "City Food Bank",
    lat: 19.09,
    lng: 72.86,
    capacity: "300 meals/day",
    needs: "packaged food, dry goods, bread",
  },
];

const FOOD_TYPES = [
  { foodType: "Cooked rice and curry", unit: "plates" },
  { foodType: "Packaged bread", unit: "packets" },
  { foodType: "Fresh vegetables", unit: "kg" },
  { foodType: "Sweets and snacks", unit: "boxes" },
];

const URGENCIES = ["<1hr", "1-3hrs", "3-6hrs", "6-24hrs", ">24hrs"];
const STATUS_CYCLE = ["pending", "matched", "accepted", "picked_up", "delivered", "delivered", "delivered"];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function upsertUser(name, email, role) {
  let user = await User.findOne({ email });
  if (!user) {
    const password = await bcrypt.hash("password123", 10);
    user = await User.create({ name, email, password, role });
  }
  return user;
}

async function seed() {
  await connectDB();

  const donorUsers = [];
  for (const d of SEED_DONORS) {
    donorUsers.push(await upsertUser(d.name, d.email, "donor"));
  }

  const ngoRecords = [];
  for (const n of SEED_NGOS) {
    const user = await upsertUser(n.name, n.email, "ngo");
    let ngo = await NGO.findOne({ user: user._id });
    if (!ngo) {
      ngo = await NGO.create({
        user: user._id,
        organizationName: n.organizationName,
        location: { lat: n.lat, lng: n.lng },
        capacity: n.capacity,
        needs: n.needs,
      });
    }
    ngoRecords.push(ngo);
  }

  const existingSeedDonations = await Donation.countDocuments({ isSeedData: true });
  if (existingSeedDonations > 0) {
    console.log(`Seed donations already exist (${existingSeedDonations}). Skipping donation seeding.`);
    console.log(`Donors: ${donorUsers.length}, NGOs: ${ngoRecords.length} (already present or just created).`);
    console.log("Demo login password for all seed accounts: password123");
    await mongoose.disconnect();
    return;
  }

  const donations = [];
  for (let i = 0; i < 20; i++) {
    const donor = donorUsers[i % donorUsers.length];
    const food = FOOD_TYPES[i % FOOD_TYPES.length];
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
    const ngo = ngoRecords[i % ngoRecords.length];
    const createdAt = daysAgo(Math.round(30 - i * 1.4));

    donations.push({
      _id: new mongoose.Types.ObjectId(),
      donor: donor._id,
      foodType: food.foodType,
      quantity: 10 + (i % 5) * 5,
      unit: food.unit,
      location: {
        lat: 19.05 + Math.random() * 0.1,
        lng: 72.85 + Math.random() * 0.1,
      },
      pickupAddress: "Demo pickup address",
      urgency: URGENCIES[i % URGENCIES.length],
      description: "",
      photoUrl: "",
      aiParsed: {
        food_type: food.foodType,
        estimated_quantity: `${10 + (i % 5) * 5} ${food.unit}`,
        perishability: "medium",
      },
      status,
      acceptedNGO: ["accepted", "picked_up", "delivered"].includes(status) ? ngo._id : null,
      isSeedData: true,
      createdAt,
      updatedAt: createdAt,
    });
  }

  await Donation.collection.insertMany(donations);

  const matches = donations
    .filter((d) => d.status !== "pending")
    .map((d, idx) => ({
      _id: new mongoose.Types.ObjectId(),
      donation: d._id,
      ngo: d.acceptedNGO || ngoRecords[idx % ngoRecords.length]._id,
      score: 70 + (idx % 30),
      reasoning: "Seeded demo match for historical data",
      distanceKm: Math.round(Math.random() * 100) / 10,
      rank: 1,
      status: d.status === "matched" ? "suggested" : "accepted",
      createdAt: d.createdAt,
      updatedAt: d.createdAt,
    }));

  if (matches.length > 0) {
    await Match.collection.insertMany(matches);
  }

  console.log(
    `Seeded ${donorUsers.length} donors, ${ngoRecords.length} NGOs, ${donations.length} donations, ${matches.length} matches.`
  );
  console.log("Demo login password for all seed accounts: password123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
