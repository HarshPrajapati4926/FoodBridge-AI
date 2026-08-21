const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMPTY_RESULT = { food_type: "", estimated_quantity: "", perishability: "" };

// Parses a donor's free-text description into structured data using OpenAI structured JSON output.
// Falls back to empty fields (rather than throwing) so a donation can still be submitted
// if the AI call fails or no key is configured - the free-text description is optional.
async function parseDonationDescription(description) {
  if (!description || !description.trim()) {
    return { ...EMPTY_RESULT };
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You extract structured data from a food donor's free-text description of surplus food. Be concise and factual; do not invent details not implied by the text.",
        },
        { role: "user", content: description },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "donation_parse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              food_type: {
                type: "string",
                description: "Concise food type/category, e.g. 'cooked rice and curry', 'packaged bread'",
              },
              estimated_quantity: {
                type: "string",
                description: "Best estimate of quantity implied by the text, e.g. '20 plates', 'unspecified'",
              },
              perishability: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "How quickly the food will spoil",
              },
            },
            required: ["food_type", "estimated_quantity", "perishability"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI donation parsing failed:", err.message);
    return { ...EMPTY_RESULT };
  }
}

module.exports = { parseDonationDescription };
