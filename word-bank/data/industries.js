// Word bank: industries and topics.
// Professional services are split into sub-categories (parent: "professional-services").
// Single words live in adjectives, verbs, and nouns (safe for dictionary API lookups).
// Multi-word expressions live in phrases.
window.WORDS = window.WORDS || [];
window.WORDS.push(

// ---------- Professional services ----------
{ id: "legal", name: "Legal / Law firms", group: "industry", parent: "professional-services",
  aliases: ["law", "lawyer", "attorney", "solicitor", "legal services", "litigation", "counsel"],
  adjectives: ["principled", "rigorous", "discreet", "decisive", "tenacious", "experienced", "confidential", "strategic", "meticulous", "seasoned", "fair", "steadfast", "clear-headed", "compelling", "persuasive", "ethical", "responsive", "formidable", "measured", "vigilant"],
  verbs: ["defend", "protect", "advocate", "represent", "negotiate", "resolve", "counsel", "challenge", "secure", "settle", "draft", "uphold", "mediate", "arbitrate", "safeguard"],
  nouns: ["counsel", "advocacy", "rights", "outcome", "resolution", "precedent", "protection", "justice", "case", "confidence", "remedy", "standing", "settlement", "mandate"],
  phrases: ["on your side", "in your corner", "plain-English advice", "binding agreement"],
  avoid: [
    { word: "aggressive representation", reason: "cliché" },
    { word: "we fight for you", reason: "cliché" },
    { word: "legal solutions", reason: "vague" },
    { word: "guaranteed results", reason: "compliance risk" }
  ] },

{ id: "accounting", name: "Accounting / Bookkeeping / Tax", group: "industry", parent: "professional-services",
  aliases: ["accountant", "bookkeeping", "tax", "cpa", "payroll", "audit", "finance"],
  adjectives: ["accurate", "organized", "precise", "compliant", "up-to-date", "thorough", "timely", "transparent", "reliable", "detail-oriented", "proactive", "efficient", "clear", "stress-free", "orderly", "on-time", "audit-ready", "dependable", "methodical", "current"],
  verbs: ["balance", "reconcile", "file", "track", "forecast", "simplify", "organize", "maximize", "deduct", "prepare", "review", "untangle", "audit", "streamline", "categorize"],
  nouns: ["books", "deadlines", "returns", "deductions", "compliance", "records", "clarity", "numbers", "ledgers", "margins", "runway", "filings", "receipts"],
  phrases: ["cash flow", "peace of mind", "tax season", "year-end close", "clean books"],
  avoid: [
    { word: "number crunchers", reason: "cliché" },
    { word: "financial solutions", reason: "vague" },
    { word: "one-stop shop", reason: "cliché" },
    { word: "tax hacks", reason: "unprofessional / risky" }
  ] },

{ id: "financial-planning", name: "Financial planning / Wealth", group: "industry", parent: "professional-services",
  aliases: ["financial advisor", "wealth management", "investment", "retirement", "planner", "fiduciary", "fintech"],
  adjectives: ["prudent", "long-term", "personalized", "steady", "considered", "independent", "disciplined", "secure", "goal-based", "fiduciary", "measured", "balanced", "forward-looking", "patient", "objective", "confident", "resilient", "tailored", "diversified", "grounded"],
  verbs: ["plan", "grow", "protect", "preserve", "diversify", "build", "prepare", "guide", "navigate", "secure", "align", "compound", "allocate", "steward"],
  nouns: ["future", "goals", "legacy", "retirement", "wealth", "freedom", "security", "roadmap", "milestones", "horizon", "portfolio", "stewardship", "nest egg"],
  phrases: ["pass on", "next generation", "long haul", "compounding growth", "rainy day"],
  avoid: [
    { word: "guaranteed returns", reason: "compliance risk" },
    { word: "get rich", reason: "spammy" },
    { word: "financial freedom", reason: "overused" },
    { word: "beat the market", reason: "compliance risk" }
  ] },

{ id: "insurance", name: "Insurance", group: "industry", parent: "professional-services",
  aliases: ["insurer", "broker", "cover", "policy", "underwriting", "claims", "insurtech"],
  adjectives: ["covered", "protected", "secure", "comprehensive", "straightforward", "reliable", "fair", "responsive", "affordable", "flexible", "dependable", "tailored", "prompt", "clear", "steady", "reassuring", "around-the-clock", "jargon-free", "transparent", "backed"],
  verbs: ["protect", "cover", "insure", "shield", "safeguard", "restore", "replace", "settle", "respond", "prepare", "recover", "underwrite", "reimburse"],
  nouns: ["cover", "protection", "claims", "policy", "support", "security", "coverage", "backing", "shield", "reassurance"],
  phrases: ["pay out", "peace of mind", "safety net", "the unexpected", "rain or shine", "no hidden exclusions"],
  avoid: [
    { word: "in good hands", reason: "trademarked / cliché" },
    { word: "worry-free", reason: "overused" },
    { word: "complete protection", reason: "misleading" },
    { word: "fine print surprises", reason: "cliché" }
  ] },

{ id: "consulting", name: "Management consulting / Strategy", group: "industry", parent: "professional-services",
  aliases: ["consultant", "strategy", "advisory", "business consulting", "operations", "b2b", "transformation"],
  adjectives: ["strategic", "pragmatic", "insightful", "data-driven", "focused", "independent", "objective", "practical", "results-oriented", "clear-eyed", "collaborative", "candid", "structured", "experienced", "measurable", "scalable", "actionable", "sharp", "decisive", "rigorous"],
  verbs: ["diagnose", "untangle", "prioritize", "streamline", "restructure", "align", "scale", "unlock", "sharpen", "simplify", "transform", "deliver", "execute", "audit", "optimize"],
  nouns: ["strategy", "roadmap", "insight", "priorities", "growth", "clarity", "operations", "outcomes", "momentum", "playbook", "bottlenecks", "framework", "execution"],
  phrases: ["cut through", "root cause", "hard numbers", "next stage"],
  avoid: [
    { word: "synergy", reason: "jargon" },
    { word: "leverage", reason: "jargon" },
    { word: "move the needle", reason: "cliché" },
    { word: "best practices", reason: "vague" },
    { word: "holistic approach", reason: "overused" },
    { word: "value-add", reason: "jargon" }
  ] },

{ id: "agency", name: "Marketing / Creative agencies", group: "industry", parent: "professional-services",
  aliases: ["agency", "marketing", "branding", "design studio", "advertising", "pr", "creative", "content"],
  adjectives: ["creative", "strategic", "fresh", "memorable", "sharp", "imaginative", "bold", "audience-first", "story-led", "distinctive", "crafted", "insight-driven", "collaborative", "agile", "unexpected", "polished", "resonant", "effective", "original", "articulate"],
  verbs: ["craft", "launch", "position", "tell", "design", "amplify", "connect", "build", "shape", "grow", "spark", "reposition", "distill", "art-direct"],
  nouns: ["story", "brand", "audience", "campaign", "voice", "idea", "identity", "attention", "presence", "craft", "positioning", "angle", "hook"],
  phrases: ["stand out", "cut through the noise", "brand world", "creative direction"],
  avoid: [
    { word: "full-service", reason: "vague" },
    { word: "data-driven creative", reason: "cliché" },
    { word: "think outside the box", reason: "cliché" },
    { word: "storytelling", reason: "overused" },
    { word: "360 approach", reason: "jargon" }
  ] },

{ id: "hr-recruitment", name: "HR / Recruitment", group: "industry", parent: "professional-services",
  aliases: ["recruiter", "hiring", "staffing", "talent", "human resources", "people", "careers", "recruiting"],
  adjectives: ["people-first", "supportive", "fair", "inclusive", "proactive", "connected", "well-matched", "responsive", "confidential", "insightful", "practical", "experienced", "personable", "efficient", "thoughtful", "compliant", "transparent", "long-term", "vetted", "approachable"],
  verbs: ["hire", "match", "find", "connect", "develop", "retain", "support", "onboard", "grow", "place", "coach", "build", "vet", "recruit"],
  nouns: ["talent", "people", "culture", "team", "fit", "careers", "potential", "workplace", "candidates", "growth", "retention", "leadership", "bench"],
  phrases: ["right fit", "career move", "long-term match", "team culture"],
  avoid: [
    { word: "rockstar", reason: "cliché" },
    { word: "ninja", reason: "cliché" },
    { word: "work hard play hard", reason: "red flag / cliché" },
    { word: "family", reason: "boundary red flag for workplaces" },
    { word: "fast-paced environment", reason: "overused" }
  ] },

{ id: "it-services", name: "IT services / Cybersecurity", group: "industry", parent: "professional-services",
  aliases: ["it support", "managed services", "cyber", "security", "tech support", "msp", "infosec", "cloud"],
  adjectives: ["secure", "reliable", "proactive", "resilient", "always-on", "responsive", "robust", "monitored", "protected", "scalable", "compliant", "fast", "jargon-free", "dependable", "vigilant", "hardened", "up-to-date", "encrypted", "patched", "redundant"],
  verbs: ["protect", "monitor", "secure", "patch", "recover", "detect", "prevent", "support", "migrate", "maintain", "fix", "encrypt", "harden", "troubleshoot"],
  nouns: ["uptime", "security", "systems", "network", "data", "continuity", "threats", "helpdesk", "infrastructure", "backups", "endpoints", "firewalls"],
  phrases: ["back up", "peace of mind", "zero downtime", "round-the-clock monitoring"],
  avoid: [
    { word: "cutting-edge solutions", reason: "cliché" },
    { word: "bulletproof", reason: "overpromise" },
    { word: "hack-proof", reason: "false claim" },
    { word: "next-gen", reason: "buzzword" },
    { word: "seamless integration", reason: "overused" }
  ] },

{ id: "architecture", name: "Architecture / Engineering", group: "industry", parent: "professional-services",
  aliases: ["architect", "engineer", "construction", "building design", "surveyor", "civil", "structural"],
  adjectives: ["considered", "structural", "sustainable", "precise", "functional", "site-specific", "enduring", "light-filled", "inventive", "contextual", "efficient", "rigorous", "spatial", "durable", "elegant", "practical", "code-compliant", "human-scale", "load-bearing", "tectonic"],
  verbs: ["design", "build", "engineer", "shape", "frame", "plan", "survey", "renovate", "restore", "construct", "model", "deliver", "draft", "fabricate"],
  nouns: ["space", "structure", "light", "form", "materials", "plans", "foundations", "detail", "site", "blueprint", "elevation", "proportion", "footprint"],
  phrases: ["built to last", "natural light", "sense of place", "ground up"],
  avoid: [
    { word: "iconic", reason: "overused" },
    { word: "world-class", reason: "vague" },
    { word: "starchitect", reason: "cliché" },
    { word: "cutting-edge design", reason: "cliché" }
  ] },

{ id: "coaching", name: "Coaching / Training", group: "industry", parent: "professional-services",
  aliases: ["coach", "mentor", "trainer", "workshop", "life coach", "business coach", "executive coaching", "facilitation"],
  adjectives: ["supportive", "practical", "transformative", "personal", "focused", "honest", "encouraging", "structured", "insightful", "challenging", "empowering", "hands-on", "goal-oriented", "accountable", "confidential", "experienced", "clear", "tailored", "grounded", "actionable"],
  verbs: ["coach", "guide", "develop", "unlock", "build", "learn", "grow", "clarify", "challenge", "practice", "master", "lead", "reframe", "sharpen"],
  nouns: ["growth", "confidence", "clarity", "skills", "goals", "breakthroughs", "habits", "accountability", "potential", "momentum", "blind spots", "direction"],
  phrases: ["next step", "soundboard", "honest feedback", "real progress"],
  avoid: [
    { word: "level up", reason: "cliché" },
    { word: "crush your goals", reason: "bro-marketing cliché" },
    { word: "unlock your potential", reason: "overused" },
    { word: "6-figure", reason: "spammy" },
    { word: "mindset shift", reason: "overused" }
  ] },

// ---------- Other industries ----------
{ id: "tech-saas", name: "Tech / SaaS", group: "industry",
  aliases: ["software", "app", "startup", "platform", "saas", "b2b", "developer", "ai", "automation"],
  adjectives: ["fast", "intuitive", "smart", "simple", "powerful", "reliable", "secure", "flexible", "automated", "integrated", "scalable", "lightweight", "real-time", "customizable", "effortless", "cloud-based", "accessible", "open", "modular", "responsive"],
  verbs: ["automate", "sync", "track", "build", "connect", "integrate", "scale", "ship", "streamline", "launch", "simplify", "deploy", "collaborate", "configure"],
  nouns: ["workflow", "dashboard", "platform", "integrations", "insights", "speed", "team", "features", "setup", "pipeline", "visibility", "workspace"],
  phrases: ["save time", "time back", "out of the box", "single source of truth", "in real time"],
  avoid: [
    { word: "seamless", reason: "overused" },
    { word: "robust", reason: "vague" },
    { word: "cutting-edge", reason: "cliché" },
    { word: "game-changer", reason: "cliché" },
    { word: "AI-powered", reason: "overused unless central to value" },
    { word: "revolutionize", reason: "hyperbole" }
  ] },

{ id: "ecommerce-retail", name: "E-commerce / Retail", group: "industry",
  aliases: ["ecommerce", "d2c", "dtc", "shop", "store", "retail", "online store", "merch", "b2c"],
  adjectives: ["curated", "best-selling", "everyday", "versatile", "stocked", "shipped", "limited-run", "handpicked", "durable", "essential", "giftable", "custom", "ergonomic", "dependable", "modular", "compact", "refillable", "unboxed"],
  verbs: ["shop", "browse", "bundle", "restock", "unbox", "gift", "order", "subscribe", "customize", "compare", "ship", "return", "collect"],
  nouns: ["cart", "bundle", "drop", "bestseller", "restock", "unboxing", "lineup", "shelf", "delivery", "guarantee", "warranty", "staple"],
  phrases: ["free shipping", "back in stock", "built for everyday", "no-hassle returns", "ships fast"],
  avoid: [
    { word: "must-have", reason: "overused" },
    { word: "add to cart now", reason: "pushy" },
    { word: "while supplies last", reason: "cliché" },
    { word: "curated collection", reason: "overused" }
  ] },

{ id: "health-wellness", name: "Health / Wellness", group: "industry",
  aliases: ["wellness", "health", "wellbeing", "clinic", "therapy", "supplements", "mental health", "nutrition"],
  adjectives: ["nourishing", "restorative", "balanced", "gentle", "natural", "evidence-based", "clean", "vital", "energizing", "soothing", "healthy", "whole", "replenishing", "therapeutic", "mindful", "sustained", "radiant", "preventive", "grounded", "clinically backed"],
  verbs: ["nourish", "restore", "heal", "recover", "energize", "support", "balance", "strengthen", "soothe", "replenish", "rest", "thrive", "regulate", "unwind"],
  nouns: ["vitality", "energy", "balance", "wellbeing", "recovery", "routine", "rest", "habits", "strength", "body", "nervous system", "longevity", "resilience"],
  phrases: ["feel like yourself", "daily ritual", "from the inside out", "backed by science"],
  avoid: [
    { word: "detox", reason: "pseudoscientific" },
    { word: "miracle", reason: "compliance risk" },
    { word: "cure", reason: "medical claim risk" },
    { word: "clean eating", reason: "loaded / vague" },
    { word: "toxins", reason: "pseudoscientific" },
    { word: "wellness journey", reason: "cliché" }
  ] },

{ id: "beauty-skincare", name: "Beauty / Skincare", group: "industry",
  aliases: ["beauty", "skincare", "cosmetics", "makeup", "spa", "salon", "haircare", "fragrance", "d2c"],
  adjectives: ["luminous", "dewy", "radiant", "silky", "velvety", "glowing", "plump", "fresh", "weightless", "nourishing", "hydrating", "smoothing", "gentle", "lush", "satin", "matte", "buildable", "fragrant", "sheer", "barrier-safe"],
  verbs: ["glow", "hydrate", "smooth", "soften", "brighten", "nourish", "plump", "refresh", "renew", "blend", "pamper", "reveal", "soothe", "melt"],
  nouns: ["glow", "radiance", "complexion", "ritual", "texture", "finish", "shade", "self-care", "moisture", "formula", "drop", "lather"],
  phrases: ["skin barrier", "second skin", "no-makeup makeup", "lit from within"],
  avoid: [
    { word: "anti-aging", reason: "dated" },
    { word: "flawless", reason: "unrealistic / cliché" },
    { word: "miracle", reason: "overpromise" },
    { word: "chemical-free", reason: "scientifically inaccurate" },
    { word: "clinically proven", reason: "only use with actual clinical trials" }
  ] },

{ id: "food", name: "Food / Restaurants / Beverage", group: "industry",
  aliases: ["restaurant", "cafe", "bakery", "food", "dining", "catering", "recipe", "coffee", "bar", "beverage", "cpg"],
  adjectives: ["fresh", "seasonal", "hearty", "crispy", "zesty", "tender", "smoky", "golden", "flaky", "rich", "velvety", "bright", "homemade", "slow-cooked", "wood-fired", "locally sourced", "generous", "moreish", "charred", "tangy", "crisp"],
  verbs: ["savor", "taste", "share", "simmer", "roast", "bake", "grill", "drizzle", "pair", "gather", "serve", "pour", "ferment", "braise"],
  nouns: ["flavor", "table", "feast", "harvest", "kitchen", "plate", "spread", "aroma", "bite", "crust", "pour", "craving", "pantry"],
  phrases: ["dig in", "comfort food", "from scratch", "straight from the oven", "pull up a chair"],
  avoid: [
    { word: "delicious", reason: "generic" },
    { word: "mouth-watering", reason: "cliché" },
    { word: "yummy", reason: "juvenile unless for kids" },
    { word: "to die for", reason: "cliché" },
    { word: "foodie", reason: "dated" }
  ] },

{ id: "fashion", name: "Fashion / Apparel", group: "industry",
  aliases: ["clothing", "apparel", "style", "boutique", "streetwear", "accessories", "footwear", "menswear", "womenswear"],
  adjectives: ["tailored", "relaxed", "cropped", "oversized", "structured", "flowing", "sharp", "effortless", "statement", "timeless", "seasonless", "breathable", "soft-touch", "versatile", "considered", "luxe", "textured", "fitted", "draped", " heavyweight"],
  verbs: ["style", "layer", "drape", "pair", "wear", "mix", "tailor", "wrap", "transition", "button", "tuck", "hem"],
  nouns: ["silhouette", "wardrobe", "staple", "fit", "fabric", "drop", "edit", "look", "capsule", "season", "weave", "cut", "seam"],
  phrases: ["dress up", "dress down", "stand out", "day to night", "lived-in feel"],
  avoid: [
    { word: "must-have", reason: "overused" },
    { word: "on trend", reason: "fast-fashion cliché" },
    { word: "wardrobe essential", reason: "overused" },
    { word: "it-piece", reason: "dated" }
  ] },

{ id: "home-interiors", name: "Home / Interiors", group: "industry",
  aliases: ["interior design", "furniture", "decor", "home", "homeware", "architecture", "renovation"],
  adjectives: ["inviting", "airy", "layered", "textured", "light-filled", "tactile", "handmade", "warm", "natural", "earthy", "restful", "considered", "characterful", "spacious", "timeless", "sculptural", "lived-in", "calm", "weathered", "sunlit"],
  verbs: ["refresh", "transform", "style", "layer", "furnish", "brighten", "arrange", "curate", "soften", "anchor", "renovate", "ground"],
  nouns: ["home", "sanctuary", "space", "texture", "corner", "nook", "palette", "materials", "piece", "grain", "patina", "atmosphere"],
  phrases: ["settle in", "living room", "lived-in warmth", "morning light"],
  avoid: [
    { word: "dream home", reason: "cliché" },
    { word: "statement piece", reason: "overused" },
    { word: "elevate your space", reason: "overused" }
  ] },

{ id: "travel", name: "Travel / Hospitality", group: "industry",
  aliases: ["hotel", "travel", "tourism", "resort", "airbnb", "getaway", "vacation", "airline", "stay"],
  adjectives: ["sun-drenched", "secluded", "breathtaking", "charming", "boutique", "laid-back", "coastal", "historic", "vibrant", "tucked-away", "panoramic", "unspoiled", "lively", "relaxed", "authentic", "unforgettable", "walkable", "sweeping", "breezy", "storied"],
  verbs: ["escape", "explore", "unwind", "discover", "wander", "stay", "savor", "retreat", "linger", "roam", "arrive", "drift"],
  nouns: ["escape", "getaway", "retreat", "views", "coastline", "hideaway", "itinerary", "stay", "welcome", "horizon", "harbor", "courtyard"],
  phrases: ["wake up to", "soak up", "check in", "local flavor", "slow mornings"],
  avoid: [
    { word: "hidden gem", reason: "cliché" },
    { word: "paradise", reason: "cliché" },
    { word: "nestled", reason: "overused" },
    { word: "off the beaten path", reason: "cliché" },
    { word: "bucket list", reason: "cliché" }
  ] },

{ id: "sustainability", name: "Environment / Sustainability", group: "industry",
  aliases: ["eco", "green", "environmental", "sustainable", "climate", "ethical", "circular", "esg", "conservation"],
  adjectives: ["renewable", "regenerative", "circular", "low-impact", "recycled", "compostable", "plastic-free", "responsible", "traceable", "ethical", "natural", "repairable", "local", "seasonal", "biodegradable", "reusable", "conscious", "closed-loop", "biobased", "durable"],
  verbs: ["protect", "restore", "rewild", "reduce", "reuse", "recycle", "repair", "conserve", "offset", "regenerate", "replant", "sustain", "compost", "repurpose"],
  nouns: ["planet", "footprint", "stewardship", "ecosystem", "biodiversity", "habitat", "future", "soil", "climate", "watershed", "lifecycle", "harvest"],
  phrases: ["supply chain", "closed loop", "built to be repaired", "zero waste"],
  avoid: [
    { word: "eco-friendly", reason: "vague / greenwashing risk" },
    { word: "green", reason: "vague" },
    { word: "all-natural", reason: "unregulated / vague" },
    { word: "save the planet", reason: "cliché" },
    { word: "carbon-neutral", reason: "requires verified certification" }
  ] },

{ id: "education", name: "Education / Courses", group: "industry",
  aliases: ["school", "course", "learning", "tutoring", "university", "online course", "edtech", "cohort", "academy"],
  adjectives: ["engaging", "hands-on", "supportive", "practical", "accessible", "structured", "inspiring", "curious", "interactive", "self-paced", "expert-led", "rigorous", "inclusive", "clear", "step-by-step", "lifelong", "collaborative", "real-world", "foundational", "applied"],
  verbs: ["learn", "discover", "master", "practice", "explore", "build", "understand", "study", "grow", "apply", "question", "graduate", "decode", "experiment"],
  nouns: ["skills", "knowledge", "curiosity", "confidence", "lessons", "growth", "foundation", "mentors", "classroom", "pathway", "curriculum", "cohort", "breakthrough"],
  phrases: ["learn by doing", "at your own pace", "real-world projects", "from scratch"],
  avoid: [
    { word: "world-class education", reason: "cliché" },
    { word: "unlock your potential", reason: "overused" },
    { word: "21st-century skills", reason: "dated buzzword" },
    { word: "edutainment", reason: "cringe" }
  ] },

{ id: "nonprofit", name: "Nonprofit / Causes", group: "industry",
  aliases: ["charity", "ngo", "cause", "donation", "fundraising", "foundation", "advocacy", "social impact", "community"],
  adjectives: ["life-changing", "urgent", "grassroots", "dignified", "compassionate", "lasting", "local", "hopeful", "transparent", "accountable", "community-led", "brave", "frontline", "essential", "resilient", "shared", "practical", "equitable", "sustained", "direct"],
  verbs: ["give", "donate", "support", "fund", "empower", "protect", "provide", "rebuild", "volunteer", "change", "rally", "advocate", "partner", "sustain"],
  nouns: ["impact", "community", "hope", "dignity", "change", "families", "future", "mission", "lives", "action", "solidarity", "access", "relief"],
  phrases: ["stand with", "on the ground", "every dollar", "lasting change"],
  avoid: [
    { word: "the less fortunate", reason: "patronizing" },
    { word: "make a difference", reason: "vague" },
    { word: "voiceless", reason: "disempowering framing" },
    { word: "pity-driven language", reason: "ethical copywriting guideline" }
  ] },

{ id: "real-estate", name: "Real estate", group: "industry",
  aliases: ["property", "realtor", "estate agent", "listing", "homes for sale", "rental", "housing", "commercial property"],
  adjectives: ["light-filled", "spacious", "move-in ready", "renovated", "sought-after", "family-friendly", "walkable", "private", "open-plan", "leafy", "characterful", "turnkey", "versatile", "well-appointed", "peaceful", "convenient", "generous", "low-maintenance", "sunlit", "south-facing"],
  verbs: ["live", "entertain", "unwind", "settle", "invest", "own", "host", "renovate", "view", "secure", "walk", "commute"],
  nouns: ["home", "neighborhood", "garden", "views", "space", "location", "potential", "lifestyle", "investment", "community", "frontage", "courtyard", "floorplan"],
  phrases: ["move in", "grow into", "steps from", "quiet street", "natural light"],
  avoid: [
    { word: "nestled", reason: "realtor cliché" },
    { word: "boasts", reason: "realtor cliché" },
    { word: "cozy", reason: "euphemism for cramped" },
    { word: "won't last long", reason: "pushy cliché" },
    { word: "must see", reason: "empty hype" }
  ] },

{ id: "fitness", name: "Fitness / Sport", group: "industry",
  aliases: ["gym", "workout", "training", "sport", "athletic", "yoga", "pilates", "running", "strength"],
  adjectives: ["strong", "powerful", "explosive", "agile", "focused", "sweaty", "relentless", "functional", "energized", "athletic", "lean", "steady", "competitive", "disciplined", "tough", "fluid", "resilient", "high-intensity", "mobile", "conditioned"],
  verbs: ["train", "move", "lift", "push", "sweat", "sprint", "stretch", "recover", "build", "compete", "conquer", "pace", "condition"],
  nouns: ["strength", "stamina", "progress", "reps", "form", "goals", "momentum", "routine", "grit", "endurance", "mobility", "session"],
  phrases: ["show up", "personal best", "one more rep", "active recovery"],
  avoid: [
    { word: "beach body", reason: "dated / body-shaming" },
    { word: "no excuses", reason: "toxic fitness cliché" },
    { word: "burn fat fast", reason: "spammy" },
    { word: "get shredded", reason: "bro-cliché" }
  ] },

{ id: "kids-family", name: "Kids / Family", group: "industry",
  aliases: ["children", "baby", "parenting", "family", "toys", "kids", "toddler", "nursery"],
  adjectives: ["safe", "gentle", "fun", "colorful", "curious", "imaginative", "playful", "durable", "wholesome", "cuddly", "messy", "soft", "bright", "easy-clean", "growing", "giggly", "washable", "non-toxic", "sturdy", "screen-free"],
  verbs: ["play", "learn", "grow", "explore", "imagine", "share", "cuddle", "build", "discover", "make", "laugh", "nap", "stack", "splash"],
  nouns: ["playtime", "family", "milestones", "memories", "bedtime", "adventure", "imagination", "giggles", "naps", "wonder", "mess", "storytime"],
  phrases: ["little ones", "hands-on play", "built for rough-and-tumble", "wipe clean"],
  avoid: [
    { word: "mompreneur", reason: "cringe" },
    { word: "super mom", reason: "pressuring cliché" },
    { word: "kid-approved", reason: "cliché unless backed by testing" },
    { word: "educational", reason: "vague—specify the skill" }
  ] },

{ id: "pets", name: "Pets", group: "industry",
  aliases: ["dog", "cat", "pet care", "vet", "pet food", "grooming", "puppy", "kitten"],
  adjectives: ["happy", "healthy", "loyal", "playful", "cuddly", "wholesome", "tail-wagging", "gentle", "vet-approved", "natural", "durable", "chew-proof", "fluffy", "curious", "energetic", "calming", "nutritious", "cozy", "grain-free", "washable"],
  verbs: ["play", "fetch", "cuddle", "groom", "nourish", "walk", "train", "treat", "protect", "pamper", "snuggle", "explore", "chew", "romp"],
  nouns: ["companion", "walks", "treats", "playtime", "family", "paws", "routine", "health", "leash", "bowl", "coat", "nap"],
  phrases: ["best friend", "belly rubs", "wet noses", "long walks"],
  avoid: [
    { word: "fur baby", reason: "polarizing / cliché" },
    { word: "pawsome", reason: "pun overload" },
    { word: "pawfect", reason: "pun overload" }
  ] },

{ id: "handmade", name: "Craft / Handmade", group: "industry",
  aliases: ["artisan", "handmade", "maker", "etsy", "crafts", "small batch", "ceramics", "woodworking", "bespoke"],
  adjectives: ["handmade", "handcrafted", "one-of-a-kind", "small-batch", "imperfect", "made-to-order", "hand-stitched", "hand-thrown", "natural", "personal", "thoughtful", "slow-made", "unique", "heirloom", "tactile", "local", "honest", "raw", "kiln-fired", "bespoke"],
  verbs: ["make", "craft", "shape", "stitch", "weave", "carve", "throw", "dye", "finish", "gift", "personalize", "cherish", "forge", "glaze"],
  nouns: ["maker", "studio", "workshop", "craft", "materials", "hands", "process", "story", "keepsake", "detail", "grain", "batch", "loom"],
  phrases: ["by hand", "small batch", "no two alike", "from the studio"],
  avoid: [
    { word: "made with love", reason: "cliché" },
    { word: "artisanal", reason: "overused" },
    { word: "curated", reason: "overused" }
  ] },

{ id: "automotive", name: "Automotive", group: "industry",
  aliases: ["car", "vehicle", "dealership", "auto", "motor", "mechanic", "ev", "electric vehicle", "mobility"],
  adjectives: ["powerful", "responsive", "smooth", "agile", "rugged", "sleek", "efficient", "quiet", "comfortable", "spacious", "reliable", "sporty", "precise", "commanding", "electric", "capable", "refined", "road-ready", "all-wheel", "aerodynamic"],
  verbs: ["drive", "accelerate", "cruise", "handle", "power", "charge", "tow", "corner", "navigate", "service", "upgrade", "brake", "grip"],
  nouns: ["performance", "torque", "range", "handling", "comfort", "road", "journey", "cabin", "drive", "freedom", "chassis", "mileage", "wheelbase"],
  phrases: ["road-trip", "open road", "zero emissions", "behind the wheel"],
  avoid: [
    { word: "unbeatable deals", reason: "used-car cliché" },
    { word: "best prices in town", reason: "cliché" },
    { word: "beast", reason: "bro-cliché" }
  ] },

{ id: "events-weddings", name: "Events / Weddings", group: "industry",
  aliases: ["wedding", "event planner", "party", "venue", "celebration", "conference", "hospitality", "catering"],
  adjectives: ["unforgettable", "joyful", "intimate", "elegant", "seamless", "personal", "festive", "candlelit", "romantic", "lively", "bespoke", "stress-free", "magical", "relaxed", "grand", "heartfelt", "picture-perfect", "effortless", "spirited", "curated"],
  verbs: ["celebrate", "plan", "host", "gather", "toast", "dance", "remember", "coordinate", "decorate", "welcome", "share", "mingle"],
  nouns: ["celebration", "day", "guests", "venue", "memories", "moment", "details", "toast", "vows", "reception", "gathering", "itinerary"],
  phrases: ["say I do", "dance floor", "raise a glass", "under one roof"],
  avoid: [
    { word: "dream wedding", reason: "cliché" },
    { word: "your special day", reason: "cliché" },
    { word: "fairytale", reason: "cliché" },
    { word: "once-in-a-lifetime", reason: "overused" }
  ] },

{ id: "arts-culture", name: "Arts / Culture", group: "industry",
  aliases: ["art", "museum", "gallery", "theater", "music", "festival", "culture", "publishing", "film", "editorial"],
  adjectives: ["provocative", "moving", "immersive", "visceral", "acclaimed", "contemporary", "experimental", "intimate", "striking", "evocative", "haunting", "vibrant", "raw", "thought-provoking", "luminous", "daring", "lyrical", "unexpected", "nuanced", "urgent"],
  verbs: ["experience", "explore", "create", "perform", "exhibit", "reimagine", "provoke", "move", "curate", "discover", "witness", "express", "stage", "premiere"],
  nouns: ["work", "exhibition", "performance", "voice", "vision", "collection", "stage", "audience", "conversation", "craft", "archive", "program", "medium"],
  phrases: ["opening night", "new commission", "in conversation", "behind the work"],
  avoid: [
    { word: "must-see", reason: "cliché" },
    { word: "a feast for the senses", reason: "cliché" },
    { word: "groundbreaking", reason: "overused" },
    { word: "unmissable", reason: "hype cliché" }
  ] },

{ id: "outdoors", name: "Outdoors", group: "industry",
  aliases: ["outdoor gear", "camping", "hiking", "nature", "adventure", "national park", "trail", "climbing"],
  adjectives: ["rugged", "weatherproof", "lightweight", "packable", "wild", "remote", "windswept", "alpine", "crisp", "muddy", "sun-soaked", "durable", "trail-ready", "breathable", "rocky", "rolling", "pristine", "starlit", "waterproof", "all-weather"],
  verbs: ["hike", "camp", "climb", "paddle", "pitch", "explore", "roam", "summit", "trek", "breathe", "unplug", "brave", "forage", "navigate"],
  nouns: ["trail", "summit", "campfire", "wilderness", "basecamp", "ridge", "backcountry", "gear", "elements", "switchback", "pack", "horizon"],
  phrases: ["fresh air", "off the grid", "dawn patrol", "leave no trace"],
  avoid: [
    { word: "epic", reason: "overused" },
    { word: "adrenaline junkie", reason: "cliché" },
    { word: "conquer nature", reason: "dated framing" }
  ] }

);