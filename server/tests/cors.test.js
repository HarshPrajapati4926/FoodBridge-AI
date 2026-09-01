const request = require("supertest");
const app = require("../app");

describe("CORS", () => {
  const originalClientUrl = process.env.CLIENT_URL;

  afterEach(() => {
    process.env.CLIENT_URL = originalClientUrl;
  });

  test("allows a request with no Origin header (curl, server-to-server)", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });

  test("reflects an allowed origin in Access-Control-Allow-Origin", async () => {
    process.env.CLIENT_URL = "https://foodbridgeai-website.netlify.app";
    // app.js reads CLIENT_URL once at module load, so re-require with a fresh
    // module registry to pick up the env change for this test.
    jest.resetModules();
    const freshApp = require("../app");

    const res = await request(freshApp)
      .get("/api/health")
      .set("Origin", "https://foodbridgeai-website.netlify.app");
    expect(res.headers["access-control-allow-origin"]).toBe("https://foodbridgeai-website.netlify.app");
  });

  test("trailing slash on CLIENT_URL still matches the Origin header (which never has one)", async () => {
    process.env.CLIENT_URL = "https://foodbridgeai-website.netlify.app/";
    jest.resetModules();
    const freshApp = require("../app");

    const res = await request(freshApp)
      .get("/api/health")
      .set("Origin", "https://foodbridgeai-website.netlify.app");
    expect(res.headers["access-control-allow-origin"]).toBe("https://foodbridgeai-website.netlify.app");
  });

  test("supports a comma-separated list of allowed origins", async () => {
    process.env.CLIENT_URL = "https://prod.netlify.app,https://deploy-preview-1.netlify.app";
    jest.resetModules();
    const freshApp = require("../app");

    const res = await request(freshApp)
      .get("/api/health")
      .set("Origin", "https://deploy-preview-1.netlify.app");
    expect(res.headers["access-control-allow-origin"]).toBe("https://deploy-preview-1.netlify.app");
  });

  test("does not reflect a disallowed origin", async () => {
    process.env.CLIENT_URL = "https://foodbridgeai-website.netlify.app";
    jest.resetModules();
    const freshApp = require("../app");

    const res = await request(freshApp).get("/api/health").set("Origin", "https://evil.example.com");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("localhost:5173 is always allowed regardless of CLIENT_URL, for local dev", async () => {
    process.env.CLIENT_URL = "https://foodbridgeai-website.netlify.app";
    jest.resetModules();
    const freshApp = require("../app");

    const res = await request(freshApp).get("/api/health").set("Origin", "http://localhost:5173");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });
});
