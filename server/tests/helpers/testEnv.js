process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-not-for-production";
// A present-but-invalid key: the OpenAI SDK throws at construction time if
// the key is missing entirely, but a fake key lets the app boot normally and
// exercises the real graceful-fallback path (openaiParse.js / matchingEngine.js
// both catch the resulting API error and fall back) instead of mocking it away.
process.env.OPENAI_API_KEY = "sk-test-fake-key-not-real";
