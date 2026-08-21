const OpenAI = require("openai");
const NGO = require("../models/NGO");
const Match = require("../models/Match");
const Donation = require("../models/Donation");
const { haversineDistanceKm } = require("./haversine");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SEARCH_RADIUS_KM = 25;
const TOP_N_MATCHES = 3;

// Finds NGOs near a donation, ranks them with AI (score + one-line reasoning),
// and stores the top matches. Reusable so it's easy to demo/explain standalone.
async function matchDonationToNGOs(donation) {
  const activeNGOs = await NGO.find({ isActive: true });

  const candidates = activeNGOs
    .map((ngo) => ({ ngo, distanceKm: haversineDistanceKm(donation.location, ngo.location) }))
    .filter((c) => c.distanceKm <= SEARCH_RADIUS_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (candidates.length === 0) {
    return [];
  }

  const ranked = await rankCandidatesWithAI(donation, candidates);

  await Match.deleteMany({ donation: donation._id, status: "suggested" });

  const matches = await Match.insertMany(
    ranked.slice(0, TOP_N_MATCHES).map((r, idx) => ({
      donation: donation._id,
      ngo: r.ngoId,
      score: r.score,
      reasoning: r.reasoning,
      distanceKm: r.distanceKm,
      rank: idx + 1,
      status: "suggested",
    }))
  );

  if (matches.length > 0) {
    await Donation.findByIdAndUpdate(donation._id, { status: "matched" });
  }

  return matches;
}

async function rankCandidatesWithAI(donation, candidates) {
  const candidateList = candidates.map((c) => ({
    ngoId: c.ngo._id.toString(),
    organizationName: c.ngo.organizationName,
    distanceKm: Math.round(c.distanceKm * 10) / 10,
    capacity: c.ngo.capacity || "unspecified",
    needs: c.ngo.needs || "unspecified",
  }));

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a logistics matching assistant for a food rescue platform. Given a food donation and a list of candidate NGOs (with distance, capacity, and stated needs), rank the NGOs best suited to receive this donation. Favor NGOs whose stated needs match the food type, weigh urgency against distance (closer matters more for high-urgency donations), and consider capacity. Return every candidate, ranked best first.",
        },
        {
          role: "user",
          content: JSON.stringify({
            donation: {
              foodType: donation.foodType,
              quantity: donation.quantity,
              unit: donation.unit,
              urgency: donation.urgency,
              aiParsed: donation.aiParsed,
            },
            candidates: candidateList,
          }),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "match_ranking",
          strict: true,
          schema: {
            type: "object",
            properties: {
              rankings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    ngoId: { type: "string" },
                    score: { type: "number", description: "0-100 match score" },
                    reasoning: { type: "string", description: "One-line reasoning for this score" },
                  },
                  required: ["ngoId", "score", "reasoning"],
                  additionalProperties: false,
                },
              },
            },
            required: ["rankings"],
            additionalProperties: false,
          },
        },
      },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const byId = new Map(candidates.map((c) => [c.ngo._id.toString(), c]));

    const ranked = parsed.rankings
      .filter((r) => byId.has(r.ngoId))
      .map((r) => ({
        ngoId: r.ngoId,
        score: Math.max(0, Math.min(100, Math.round(r.score))),
        reasoning: r.reasoning,
        distanceKm: Math.round(byId.get(r.ngoId).distanceKm * 10) / 10,
      }));

    return ranked.length > 0 ? ranked : fallbackRanking(candidates);
  } catch (err) {
    console.error("OpenAI matching failed, falling back to distance-based ranking:", err.message);
    return fallbackRanking(candidates);
  }
}

function fallbackRanking(candidates) {
  return candidates.map((c) => ({
    ngoId: c.ngo._id.toString(),
    score: Math.max(0, Math.round(100 - c.distanceKm * 2)),
    reasoning: `Fallback ranking by proximity (${Math.round(c.distanceKm * 10) / 10} km) - AI matching unavailable`,
    distanceKm: Math.round(c.distanceKm * 10) / 10,
  }));
}

module.exports = { matchDonationToNGOs };
