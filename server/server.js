require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const impactRoutes = require("./routes/impactRoutes");

const app = express();

// CLIENT_URL may hold one or more comma-separated origins (e.g. a Netlify
// production URL plus a deploy-preview URL). Localhost is always allowed so
// local dev keeps working regardless of what's set in production.
const allowedOrigins = new Set(
  [...(process.env.CLIENT_URL || "").split(","), "http://localhost:5173"]
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      // no Origin header (curl, server-to-server, same-origin) - allow
      if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ""))) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/impact", impactRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Catches multer errors (bad file type, oversized upload) and any other thrown/async
// error that reaches Express, so clients always get JSON instead of a raw HTML stack trace.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "Only image uploads are allowed") {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
