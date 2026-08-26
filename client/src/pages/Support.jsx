const FAQS = [
  {
    q: "A donation isn't getting matched to any NGO — why?",
    a: "Matching only looks at NGOs within a 25 km radius of the pickup location. If no NGO is registered nearby, the donation stays pending until one is. Double-check the pickup lat/lng you entered.",
  },
  {
    q: "The AI-parsed fields are empty on my donation.",
    a: "Free-text parsing and matching reasoning both depend on a working OpenAI API key on the server. If the key isn't configured, the platform falls back gracefully — donations and matching still work by distance, just without AI-generated reasoning.",
  },
  {
    q: "I registered as the wrong role by mistake.",
    a: "Roles can't be changed from an existing account. Register a second account with the correct role, and ask an admin to remove the old one if needed.",
  },
  {
    q: "How is a match's score calculated?",
    a: "Each nearby NGO is scored 0–100 by AI based on food type fit, stated needs and capacity, urgency, and distance. The top 3 are shown to donors and NGOs with a one-line reasoning for the score.",
  },
];

export default function Support() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 md:hidden">Support</h1>
        <p className="text-gray-500 text-sm mt-1">
          Answers to common questions, and how to reach us if you're still stuck.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm">
        {FAQS.map((item) => (
          <details key={item.q} className="group p-4">
            <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium text-gray-800">
              {item.q}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-400 transition-transform group-open:rotate-180 shrink-0 ml-3"
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-brand-900">Still need help?</h2>
        <p className="text-sm text-brand-800 mt-1">
          Reach the FoodBridge AI team at{" "}
          <a href="mailto:support@foodbridge.demo" className="font-medium underline">
            support@foodbridge.demo
          </a>{" "}
          and we'll get back to you as soon as we can.
        </p>
      </div>
    </div>
  );
}
