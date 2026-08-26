const FEATURES = [
  {
    title: "AI-parsed donations",
    body: "Free-text descriptions become structured, actionable listings in seconds.",
    icon: (
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-9 9-2 2m0-13 2 2m9 9 2 2" strokeLinecap="round" />
    ),
  },
  {
    title: "Urgency-aware matching",
    body: "Every donation is ranked against nearby NGOs by distance, need, and time left.",
    icon: <path d="M12 7v5l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Live pickup tracking",
    body: "Follow every donation from pending to delivered on one shared timeline.",
    icon: <path d="M9 11.5 11 13.5 15.5 9M12 3l8 4v5c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V7l8-4Z" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden md:flex md:w-[46%] lg:w-[42%] relative flex-col justify-between overflow-hidden bg-brand-900 px-12 py-14">
      {/* Ambient brand glow, derived from the logo's green-to-orange arc */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-96 w-96 rounded-full bg-accent-500/25 blur-3xl" />

      <div className="relative">
        <div className="inline-block rounded-2xl bg-white/95 px-5 py-4 shadow-lg shadow-black/20">
          <img src="/FoodBridgeAILogo.png" alt="FoodBridge AI" className="h-14 w-auto" />
        </div>

        <h2 className="font-display text-3xl font-bold text-white mt-10 leading-tight text-balance">
          Surplus food, delivered to those who need it&nbsp;first.
        </h2>
        <p className="text-brand-100 text-sm mt-3 max-w-sm">
          FoodBridge AI connects donors and NGOs the moment food is logged &mdash; matched, ranked, and ready for pickup.
        </p>
      </div>

      <div className="relative space-y-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex gap-4">
            <div className="shrink-0 h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-accent-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {f.icon}
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{f.title}</p>
              <p className="text-brand-200 text-xs mt-0.5 leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="relative text-brand-300 text-xs">Bridging surplus food to feed hope.</p>
    </div>
  );
}
