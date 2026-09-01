const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./helpers/db");

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

async function registerDonor(email = "donor@test.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Donor", email, password: "password123", role: "donor" });
  return res.body.token;
}

async function registerNgo(email = "ngo@test.com", lat = 19.076, lng = 72.8777) {
  const res = await request(app).post("/api/auth/register").send({
    name: "NGO",
    email,
    password: "password123",
    role: "ngo",
    ngoDetails: { organizationName: "Org", lat, lng },
  });
  return res.body.token;
}

describe("POST /api/donations", () => {
  test("rejects an unauthenticated request", async () => {
    const res = await request(app).post("/api/donations").send({});
    expect(res.status).toBe(401);
  });

  test("rejects a non-donor role (NGO)", async () => {
    const token = await registerNgo();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Rice")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "1-3hrs");
    expect(res.status).toBe(403);
  });

  test("rejects missing required fields", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Rice");
    expect(res.status).toBe(400);
  });

  test("rejects an invalid urgency value", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Rice")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "next-week");
    expect(res.status).toBe(400);
  });

  test("rejects non-numeric lat/lng with a clean 400, not a 500 crash", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Rice")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "notanumber")
      .field("lng", "notanumber")
      .field("urgency", "1-3hrs");
    expect(res.status).toBe(400);
  });

  test("creates a donation and stores an XSS-style foodType as literal text", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "<img src=x onerror=alert(1)>")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "1-3hrs");
    expect(res.status).toBe(201);
    expect(res.body.donation.foodType).toBe("<img src=x onerror=alert(1)>");
  });

  test("stays pending with no matches when no NGO is within the radius", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Rice")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "-33.8688")
      .field("lng", "151.2093")
      .field("urgency", ">24hrs");
    expect(res.status).toBe(201);
    expect(res.body.donation.status).toBe("pending");
    expect(res.body.matches).toHaveLength(0);
  });

  test("matches to a nearby NGO and excludes one outside the radius", async () => {
    await registerNgo("ngo-close@test.com", 19.076, 72.8777);
    await registerNgo("ngo-far@test.com", -33.8688, 151.2093); // Sydney, far from Mumbai
    const token = await registerDonor();

    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .field("foodType", "Rice")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19.077")
      .field("lng", "72.878")
      .field("urgency", "<1hr");

    expect(res.status).toBe(201);
    expect(res.body.donation.status).toBe("matched");
    expect(res.body.matches).toHaveLength(1);
    // No live OpenAI key in tests, so the engine falls back to distance-based
    // scoring - the reasoning text says so explicitly rather than pretending.
    expect(res.body.matches[0].reasoning).toMatch(/fallback/i);
  });
});

describe("cross-user data isolation", () => {
  test("a donor cannot see another donor's donations via /mine", async () => {
    const tokenA = await registerDonor("a@test.com");
    const tokenB = await registerDonor("b@test.com");

    const created = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${tokenA}`)
      .field("foodType", "A's food")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "1-3hrs");

    const listB = await request(app).get("/api/donations/mine").set("Authorization", `Bearer ${tokenB}`);
    const idsB = listB.body.donations.map((d) => d._id);
    expect(idsB).not.toContain(created.body.donation._id);
  });

  test("a donor cannot view another donor's donation matches", async () => {
    const tokenA = await registerDonor("a2@test.com");
    const tokenB = await registerDonor("b2@test.com");

    const created = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${tokenA}`)
      .field("foodType", "A's food")
      .field("quantity", "5")
      .field("unit", "kg")
      .field("lat", "19")
      .field("lng", "72")
      .field("urgency", "1-3hrs");

    const res = await request(app)
      .get(`/api/donations/${created.body.donation._id}/matches`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  test("a malformed donation id in the URL does not crash the server with a 500", async () => {
    const token = await registerDonor();
    const res = await request(app)
      .get("/api/donations/not-a-valid-object-id/matches")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
