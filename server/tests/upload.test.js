const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./helpers/db");

// Multer writes real files to disk (server/uploads/); track and remove
// anything a test actually creates there so test runs don't leave litter.
const createdUploads = [];

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => {
  await closeDatabase();
  for (const url of createdUploads) {
    const filePath = path.join(__dirname, "..", url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

async function registerDonor() {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Donor", email: "upload-donor@test.com", password: "password123", role: "donor" });
  return res.body.token;
}

const validPngBuffer = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c6360000002000100ffff03000006000557bfabd40000000049454e44ae426082",
  "hex"
);

describe("donation photo upload", () => {
  // Regression test: multer/fileFilter errors used to bypass Express's JSON
  // error handling entirely, returning a raw HTML stack trace with a 500 -
  // leaking a server file path and breaking the frontend's error parsing.
  test("a non-image file is rejected with a clean JSON 400, not an HTML 500", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Test")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "1-3hrs")
      .attach("photo", Buffer.from("not an image, just text"), {
        filename: "fake.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.type).toBe("application/json");
  });

  test("an oversized file is rejected with a clean JSON 400, not an HTML 500", async () => {
    const token = await registerDonor();
    const oversized = Buffer.alloc(6 * 1024 * 1024, "A"); // over the 5MB limit
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Test")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "1-3hrs")
      .attach("photo", oversized, { filename: "big.png", contentType: "image/png" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("a valid image upload succeeds and the donation stores a photoUrl", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Test")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "1-3hrs")
      .attach("photo", validPngBuffer, { filename: "valid.png", contentType: "image/png" });

    expect(res.status).toBe(201);
    expect(res.body.donation.photoUrl).toMatch(/^\/uploads\//);
    createdUploads.push(res.body.donation.photoUrl);
  });

  test("an unknown route returns a clean JSON 404, not an HTML default", async () => {
    const res = await request(app).get("/api/totally-unknown-route");
    expect(res.status).toBe(404);
    expect(res.type).toBe("application/json");
  });
});
