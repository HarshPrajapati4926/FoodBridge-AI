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

async function registerNgo(email, lat, lng) {
  const res = await request(app).post("/api/auth/register").send({
    name: "NGO",
    email,
    password: "password123",
    role: "ngo",
    ngoDetails: { organizationName: `Org ${email}`, lat, lng },
  });
  return res.body.token;
}

async function createMatchedDonation(donorToken, lat, lng) {
  const res = await request(app)
    .post("/api/donations")
    .set("Authorization", `Bearer ${donorToken}`)
    .field("foodType", "Race test food")
    .field("quantity", "5")
    .field("unit", "kg")
    .field("lat", String(lat))
    .field("lng", String(lng))
    .field("urgency", "<1hr");
  return res.body;
}

describe("NGO accept/reject workflow", () => {
  test("two NGOs racing to accept the same donation - one wins, one gets a clean 400", async () => {
    const ngoAToken = await registerNgo("race-a@test.com", 19.076, 72.8777);
    const ngoBToken = await registerNgo("race-b@test.com", 19.077, 72.8787);
    const donorToken = await registerDonor("race-donor@test.com");

    const { donation } = await createMatchedDonation(donorToken, 19.0765, 72.8782);
    expect(donation.status).toBe("matched");

    const matchesA = await request(app)
      .get("/api/ngo/matches")
      .set("Authorization", `Bearer ${ngoAToken}`);
    const matchesB = await request(app)
      .get("/api/ngo/matches")
      .set("Authorization", `Bearer ${ngoBToken}`);
    const matchA = matchesA.body.matches.find((m) => m.donation._id === donation._id);
    const matchB = matchesB.body.matches.find((m) => m.donation._id === donation._id);
    expect(matchA).toBeTruthy();
    expect(matchB).toBeTruthy();

    const acceptA = await request(app)
      .patch(`/api/ngo/matches/${matchA._id}/accept`)
      .set("Authorization", `Bearer ${ngoAToken}`);
    expect(acceptA.status).toBe(200);
    expect(acceptA.body.donation.status).toBe("accepted");

    // NGO B tries to accept the same donation after A already took it
    const acceptB = await request(app)
      .patch(`/api/ngo/matches/${matchB._id}/accept`)
      .set("Authorization", `Bearer ${ngoBToken}`);
    expect(acceptB.status).toBe(400);

    // NGO B cannot act on NGO A's match object at all (ownership check)
    const crossAccept = await request(app)
      .patch(`/api/ngo/matches/${matchA._id}/accept`)
      .set("Authorization", `Bearer ${ngoBToken}`);
    expect(crossAccept.status).toBe(404);
  });

  test("a donor cannot act on NGO-only endpoints", async () => {
    const donorToken = await registerDonor("role-check-donor@test.com");
    const res = await request(app).get("/api/ngo/matches").set("Authorization", `Bearer ${donorToken}`);
    expect(res.status).toBe(403);
  });

  test("donation status progresses accepted -> picked_up -> delivered, then stops", async () => {
    const ngoToken = await registerNgo("progress-ngo@test.com", 19.076, 72.8777);
    const donorToken = await registerDonor("progress-donor@test.com");
    const { donation } = await createMatchedDonation(donorToken, 19.0765, 72.8782);

    const matches = await request(app)
      .get("/api/ngo/matches")
      .set("Authorization", `Bearer ${ngoToken}`);
    const match = matches.body.matches.find((m) => m.donation._id === donation._id);

    await request(app)
      .patch(`/api/ngo/matches/${match._id}/accept`)
      .set("Authorization", `Bearer ${ngoToken}`);

    const pickedUp = await request(app)
      .patch(`/api/donations/${donation._id}/status`)
      .set("Authorization", `Bearer ${ngoToken}`);
    expect(pickedUp.body.donation.status).toBe("picked_up");

    const delivered = await request(app)
      .patch(`/api/donations/${donation._id}/status`)
      .set("Authorization", `Bearer ${ngoToken}`);
    expect(delivered.body.donation.status).toBe("delivered");

    const beyond = await request(app)
      .patch(`/api/donations/${donation._id}/status`)
      .set("Authorization", `Bearer ${ngoToken}`);
    expect(beyond.status).toBe(400);
  });

  test("a different NGO cannot advance a donation it doesn't own", async () => {
    const ngoAToken = await registerNgo("owner-ngo@test.com", 19.076, 72.8777);
    const ngoBToken = await registerNgo("intruder-ngo@test.com", 19.077, 72.8787);
    const donorToken = await registerDonor("owner-donor@test.com");
    const { donation } = await createMatchedDonation(donorToken, 19.0765, 72.8782);

    const matches = await request(app)
      .get("/api/ngo/matches")
      .set("Authorization", `Bearer ${ngoAToken}`);
    const match = matches.body.matches.find((m) => m.donation._id === donation._id);
    await request(app)
      .patch(`/api/ngo/matches/${match._id}/accept`)
      .set("Authorization", `Bearer ${ngoAToken}`);

    const res = await request(app)
      .patch(`/api/donations/${donation._id}/status`)
      .set("Authorization", `Bearer ${ngoBToken}`);
    expect(res.status).toBe(403);
  });
});
