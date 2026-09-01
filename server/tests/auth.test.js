const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const { connect, closeDatabase, clearDatabase } = require("./helpers/db");

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe("POST /api/auth/register", () => {
  test("rejects missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "x@x.com" });
    expect(res.status).toBe(400);
  });

  test("rejects an invalid role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: "x@test.com", password: "password123", role: "superadmin" });
    expect(res.status).toBe(400);
  });

  test("rejects self-registration as admin - the platform has exactly one admin account, seeded separately", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: "wannabe-admin@test.com", password: "password123", role: "admin" });
    expect(res.status).toBe(400);
    const user = await User.findOne({ email: "wannabe-admin@test.com" });
    expect(user).toBeNull();
  });

  test("registers a donor and returns a JWT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Donor One", email: "donor1@test.com", password: "password123", role: "donor" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("donor");
  });

  test("registers an NGO with location and creates the linked NGO profile", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "NGO One",
        email: "ngo1@test.com",
        password: "password123",
        role: "ngo",
        ngoDetails: { organizationName: "Helping Hands", lat: 19.076, lng: 72.8777 },
      });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("ngo");
  });

  test("rejects a duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "dup@test.com", password: "password123", role: "donor" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "B", email: "dup@test.com", password: "password123", role: "donor" });
    expect(res.status).toBe(409);
  });

  test("stores an XSS-style name as literal text without crashing (frontend is responsible for escaping on render)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "<script>alert(1)</script>",
      email: "xss@test.com",
      password: "password123",
      role: "donor",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe("<script>alert(1)</script>");
  });

  test("rejects NoSQL injection attempts in place of a plain string email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Hacker", email: { $ne: null }, password: "x", role: "donor" });
    expect(res.status).not.toBe(201);
  });

  // Regression test: registration used to create the User row before validating
  // ngoDetails, so a failed NGO signup left a permanently orphaned account that
  // blocked that email from ever registering again. Fixed by validating first.
  test("a failed NGO registration (missing lat/lng) does not orphan a User row", async () => {
    const email = "almost-ngo@test.com";
    const failed = await request(app).post("/api/auth/register").send({
      name: "Almost NGO",
      email,
      password: "password123",
      role: "ngo",
      ngoDetails: { organizationName: "No Location" },
    });
    expect(failed.status).toBe(400);

    const orphan = await User.findOne({ email });
    expect(orphan).toBeNull();

    const retry = await request(app).post("/api/auth/register").send({
      name: "Almost NGO",
      email,
      password: "password123",
      role: "ngo",
      ngoDetails: { organizationName: "With Location", lat: 19.076, lng: 72.8777 },
    });
    expect(retry.status).toBe(201);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Case Test", email: "CaseTest@Test.com", password: "password123", role: "donor" });
  });

  test("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "CaseTest@Test.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test("email matching is case-insensitive", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "casetest@test.com", password: "password123" });
    expect(res.status).toBe(200);
  });

  test("rejects a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "CaseTest@Test.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  test("rejects a NoSQL injection payload instead of a password string", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "CaseTest@Test.com", password: { $gt: "" } });
    expect(res.status).not.toBe(200);
  });
});

describe("GET /api/auth/me", () => {
  test("rejects a missing token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("rejects a token without the 'Bearer ' prefix", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "T", email: "t@test.com", password: "password123", role: "donor" });
    const res = await request(app).get("/api/auth/me").set("Authorization", reg.body.token);
    expect(res.status).toBe(401);
  });

  test("rejects a tampered token", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "T", email: "t2@test.com", password: "password123", role: "donor" });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${reg.body.token}tampered`);
    expect(res.status).toBe(401);
  });

  test("returns the user for a valid token", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "T", email: "t3@test.com", password: "password123", role: "donor" });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("t3@test.com");
  });
});
