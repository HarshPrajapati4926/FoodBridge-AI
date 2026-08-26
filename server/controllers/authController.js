const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const NGO = require("../models/NGO");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

async function register(req, res) {
  try {
    const { name, email, password, role, ngoDetails } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, and role are required" });
    }
    if (!["donor", "ngo"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "ngo" && (!ngoDetails || ngoDetails.lat == null || ngoDetails.lng == null)) {
      return res.status(400).json({
        message: "ngoDetails with organizationName, lat, and lng are required for ngo role",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    if (role === "ngo") {
      await NGO.create({
        user: user._id,
        organizationName: ngoDetails.organizationName || name,
        address: ngoDetails.address || "",
        location: { lat: ngoDetails.lat, lng: ngoDetails.lng },
        capacity: ngoDetails.capacity || "",
        needs: ngoDetails.needs || "",
      });
    }

    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
}

module.exports = { register, login, me };
