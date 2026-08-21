# FoodBridge AI

AI-powered platform connecting surplus food donors (restaurants, event organizers, households, farms) with NGOs, using AI-based parsing and urgency-aware smart matching.

Built for the Omni_AgriTech_14 hackathon problem statement: "Connecting Surplus Food to Those in Need."

## Status

All 7 core MVP features are implemented: Auth & roles, Donation intake, AI matching engine, NGO dashboard, Map view, Impact dashboard, and the demo seed script.

## Tech stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (Mongoose), MongoDB Atlas
- Auth: JWT, 3 roles (donor, ngo, admin)
- AI: OpenAI API (donation parsing + matching)
- Maps: Leaflet.js + OpenStreetMap

## Setup

### 1. Backend

```
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your own values:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `OPENAI_API_KEY` — your OpenAI API key

```
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend

```
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`.

## Testing Feature 1: Auth & roles

1. Start both servers as above.
2. Go to `http://localhost:5173/register`.
3. Register a **donor** account (name/email/password, role = donor) — you'll be redirected to the Donor Dashboard.
4. Log out, then register an **ngo** account — fill in organization name and lat/lng (use "Use my current location" or type coordinates) — you'll be redirected to the NGO Dashboard.
5. Log out, then register an **admin** account — redirected to the Admin Dashboard.
6. Try visiting `/ngo` while logged in as a donor — you should be redirected away (role-protected route).
7. Refresh the page while logged in — you should stay logged in (JWT persisted in localStorage, validated via `/api/auth/me`).

## Testing Feature 2: Donation intake (Donor role)

1. Log in as a donor (or register a new one).
2. On the Donor Dashboard, allow location access when prompted — latitude/longitude auto-fill (still editable), or click "Use my current location" manually.
3. Fill in food type, quantity, unit, and pick an urgency window.
4. Optionally add a free-text description (e.g. "Leftover catering from a wedding, about 30 plates of rice and curry, still warm") — this gets sent to OpenAI to extract `food_type`, `estimated_quantity`, and `perishability`, shown as an "AI parsed" line on the donation card once submitted. If `OPENAI_API_KEY` isn't set to a real key, this just comes back empty — the donation still saves fine (AI parsing failure never blocks the submission).
5. Optionally attach a photo.
6. Submit — you should see a success message, the form resets (keeping your location), and the new donation appears under "Your donations" below with status `pending`.

## Testing Feature 3: AI matching engine

1. Register at least one NGO account near your donor's pickup location (within ~25 km) — e.g. same city, or coordinates a few km apart. Register a second NGO further away (>25 km) to see it correctly excluded.
2. As the donor, log a donation with an urgent window (e.g. `<1hr`) at a location near the NGO(s) you registered.
3. On submit, the donation's status should immediately become `matched` (instead of staying `pending`) if any NGO was found within the 25 km radius.
4. On the "Your donations" list, a matched donation shows a "View matched NGOs" link — click it to see the ranked NGOs with a 0–100 score, a one-line AI reasoning string, and distance in km.
5. If `OPENAI_API_KEY` isn't a real key, you'll see reasoning like "Fallback ranking by proximity (X km) - AI matching unavailable" — the engine falls back to distance-based scoring rather than failing, so the feature is still fully demoable without a working key. With a real key, the reasoning reflects actual AI judgment on food type vs. NGO stated needs/capacity.
6. Try a donation far from every registered NGO — it should stay `pending` with no matches.

The matching logic lives in `server/utils/matchingEngine.js` (haversine radius search + OpenAI ranking) — it's a standalone reusable function, called automatically whenever a donation is created.

## Seeding demo data

Before a live demo, run the seed script to populate realistic historical activity:

```
cd server
npm run seed
```

This creates 3 demo donors, 2 demo NGOs (password `password123` for all seed accounts), and 20 backdated donations spanning the last month with varied statuses (pending, matched, accepted, picked_up, delivered) and matches — so the map, NGO dashboard, and impact charts all have data to show immediately. It's idempotent: re-running it skips donation seeding if seed data already exists, so it's safe to run multiple times. Seeded donations are flagged with `isSeedData: true` in the database, and this is called out in code comments in `server/seed.js` — the impact dashboard mixes this seed data with real activity and says so on-screen.

## Testing Feature 4: NGO dashboard

1. Run the seed script (above), then log in as `seed.ngo1@foodbridge.demo` / `password123` (or your own NGO account with at least one matched donation nearby).
2. "Incoming matched donations" shows each matched donation with its AI match score, one-line reasoning, and distance, plus Accept/Reject buttons.
3. Click **Accept** on one — it should disappear from the incoming list and appear under "Your accepted donations" with status `accepted`. Any other NGO's pending match on that same donation is automatically rejected (log in as `seed.ngo2@foodbridge.demo` to confirm it no longer sees that donation).
4. Click **Reject** on a different one — it should disappear from your incoming list (and remain available for other NGOs).
5. On an accepted donation, click "Mark picked up", then "Mark delivered" — status updates step by step; the button disappears once `delivered` is reached (a terminal state).

## Testing Feature 5: Map view

1. Log in as any role and go to `/map` (via the navbar).
2. You should see a Leaflet map centered on Mumbai (adjust `DEFAULT_CENTER` in `MapView.jsx` if your data is elsewhere) with orange pins for donations and green pins for NGOs, matching the legend in the top right.
3. Click any pin — a popup shows the food type/quantity/urgency/status for donations, or organization name/capacity/needs for NGOs.

## Testing Feature 6: Impact dashboard

1. Go to `/impact` (via the navbar) as any role.
2. You should see 4 stat cards (total donations, active donors, active NGOs, delivered) and a bar chart of donations per day, reflecting both real and seeded data — a note on-screen discloses that seed data is included.

## AI Usage Disclosure

- OpenAI API is used as a live product feature for (1) parsing donor free-text descriptions into structured data, and (2) generating matching scores + reasoning between donations and NGOs.
- Claude (via Claude Code) was used to scaffold, generate, and assist in writing this codebase during development.
