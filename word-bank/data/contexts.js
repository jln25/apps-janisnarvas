// Word bank: copywriting contexts, page sections, and user intents.
// Single words live in adjectives, verbs, and nouns (safe for dictionary API lookups).
// Multi-word expressions live in phrases.
window.WORDS = window.WORDS || [];
window.WORDS.push(

// ---------- Page Sections ----------
{ id: "hero-headline", name: "Hero / Above the fold", group: "context",
  aliases: ["hero", "headline", "hook", "landing page", "banner", "h1", "value prop", "opening"],
  adjectives: ["clear", "immediate", "specific", "built", "made", "fast", "simple", "direct", "essential", "proven", "everyday", "tailored", "effortless", "reliable", "unmistakable", "sharp"],
  verbs: ["build", "get", "start", "save", "turn", "keep", "run", "find", "book", "grow", "simplify", "ship", "protect"],
  nouns: ["way", "place", "team", "work", "time", "results", "system", "home", "craft", "standard", "difference"],
  phrases: ["built for", "made for", "without the", "in minutes", "from day one", "on your terms", "all in one place"],
  avoid: [
    { word: "welcome to our website", reason: "wasted prime real estate" },
    { word: "we are a leading provider", reason: "self-centered / vague" },
    { word: "elevate your", reason: "overused AI/agency filler" },
    { word: "unlock the power of", reason: "cliché" },
    { word: "where X meets Y", reason: "formulaic cliché" }
  ] },

{ id: "about-story", name: "About page / Origin story", group: "context",
  aliases: ["about", "about us", "story", "founder", "mission", "team", "who we are", "bio"],
  adjectives: ["independent", "obsessed", "hands-on", "founded", "rooted", "local", "self-funded", "dedicated", "curious", "stubborn", "small", "seasoned", "honest", "practical", "committed"],
  verbs: ["started", "noticed", "built", "spent", "learned", "set out", "grew", "decided", "kept", "refused", "tested", "crafted"],
  nouns: ["team", "studio", "workshop", "kitchen", "problem", "standard", "craft", "customers", "neighbors", "chapter", "principles"],
  phrases: ["started with a simple question", "tired of", "behind the scenes", "how we work", "what we believe"],
  avoid: [
    { word: "passionate team of experts", reason: "generic / unproven" },
    { word: "strive for excellence", reason: "empty corporate filler" },
    { word: "dedicated to customer satisfaction", reason: "robotic" },
    { word: "humble beginnings", reason: "cliché" }
  ] },

{ id: "features-benefits", name: "Features & Benefits", group: "context",
  aliases: ["features", "benefits", "product", "specs", "how it works", "capabilities", "details"],
  adjectives: ["built-in", "automatic", "customizable", "lightweight", "durable", "waterproof", "intuitive", "instant", "modular", "quiet", "portable", "reusable", "searchable", "compatible", "transparent"],
  verbs: ["automate", "track", "organize", "prevent", "replace", "connect", "filter", "sync", "protect", "customize", "measure", "simplify"],
  nouns: ["control", "visibility", "speed", "accuracy", "battery", "finish", "warranty", "workflow", "clarity", "capacity", "precision"],
  phrases: ["so you can", "which means", "no more", "built right in", "works with", "at a glance"],
  avoid: [
    { word: "robust features", reason: "vague" },
    { word: "user-friendly", reason: "dated / tell-don't-show" },
    { word: "state-of-the-art", reason: "cliché" },
    { word: "boasts", reason: "stiff" }
  ] },

// ---------- Persuasion & Conversion ----------
{ id: "social-proof", name: "Social Proof / Case Studies", group: "context",
  aliases: ["testimonials", "reviews", "case study", "proof", "results", "clients", "trust", "ratings"],
  adjectives: ["verified", "proven", "measurable", "real", "documented", "consistent", "trusted", "repeat", "featured", "peer-reviewed", "independent", "rated", "long-standing"],
  verbs: ["switched", "saved", "increased", "reduced", "cut", "grew", "completed", "recommended", "reviewed", "reported", "backed", "trusted"],
  nouns: ["results", "reviews", "track record", "benchmark", "outcome", "rating", "customers", "turnaround", "retention", "proof", "feedback"],
  phrases: ["in their words", "before and after", "by the numbers", "why they switched", "real stories"],
  avoid: [
    { word: "don't just take our word for it", reason: "overused transition cliché" },
    { word: "happy customers", reason: "vague—use specifics" },
    { word: "industry-leading", reason: "unsubstantiated" }
  ] },

{ id: "objection-handling", name: "Objection Handling / FAQ", group: "context",
  aliases: ["faq", "objections", "hesitation", "skepticism", "guarantee", "risk", "reassurance", "questions"],
  adjectives: ["flexible", "optional", "cancelable", "transparent", "upfront", "refundable", "guided", "compatible", "straightforward", "realistic", "honest", "reversible", "supported"],
  verbs: ["cancel", "pause", "switch", "try", "export", "refund", "ask", "keep", "test", "migrate", "adjust", "clarify"],
  nouns: ["contract", "lock-in", "fine print", "refund", "trial", "support", "migration", "commitment", "terms", "answer", "guarantee"],
  phrases: ["no long-term contracts", "cancel anytime", "no hidden fees", "what if", "you keep your data", "no pressure", "plain English"],
  avoid: [
    { word: "100% risk-free", reason: "sounds like an infomercial" },
    { word: "no-brainer", reason: "condescending" },
    { word: "rest assured", reason: "stiff / defensive" }
  ] },

{ id: "pricing-packaging", name: "Pricing & Packaging", group: "context",
  aliases: ["pricing", "plans", "tiers", "cost", "subscription", "packages", "rates", "fees", "billing"],
  adjectives: ["flat", "transparent", "predictable", "modular", "annual", "monthly", "pro-rated", "tiered", "all-inclusive", "capped", "custom", "scalable", "straightforward"],
  verbs: ["include", "upgrade", "downgrade", "pause", "scale", "save", "compare", "unlock", "bundle", "bill", "cap"],
  nouns: ["plan", "tier", "seat", "usage", "invoice", "billing", "trial", "credit", "bundle", "breakdown", "rate"],
  phrases: ["pay as you go", "everything in", "most popular", "billed annually", "no surprise overages", "free forever"],
  avoid: [
    { word: "contact us for pricing", reason: "friction-heavy unless true enterprise" },
    { word: "pennies a day", reason: "dated sales cliché" },
    { word: "investment", reason: "euphemism for high price" }
  ] },

{ id: "cta-microcopy", name: "Calls to Action / Buttons", group: "context",
  aliases: ["cta", "button", "link", "signup", "checkout", "conversion", "action", "microcopy"],
  adjectives: ["free", "instant", "quick", "custom", "live", "sample", "guided", "personal"],
  verbs: ["get", "start", "try", "book", "see", "explore", "claim", "download", "build", "check", "compare", "request", "join", "reserve", "preview"],
  nouns: ["demo", "quote", "sample", "guide", "preview", "trial", "spot", "access", "pricing", "checklist", "consultation"],
  phrases: ["see how it works", "get started", "check availability", "build yours", "take a look", "send me the", "no credit card required"],
  avoid: [
    { word: "submit", reason: "mechanical / high-friction" },
    { word: "click here", reason: "bad for accessibility and SEO" },
    { word: "learn more", reason: "vague—specify what they'll see" },
    { word: "buy now", reason: "abrupt before value is established" }
  ] },

// ---------- Lifecycle & UX Copy ----------
{ id: "onboarding-empty", name: "Onboarding / Empty States", group: "context",
  aliases: ["onboarding", "welcome", "empty state", "setup", "first time", "tutorial", "getting started", "ux"],
  adjectives: ["ready", "first", "quick", "optional", "guided", "clean", "blank", "simple", "next", "saved"],
  verbs: ["create", "add", "import", "connect", "invite", "customize", "pick", "skip", "drag", "drop", "name", "launch"],
  nouns: ["workspace", "project", "step", "template", "checklist", "canvas", "shortcut", "draft", "setup", "tour"],
  phrases: ["start from a template", "nothing here yet", "takes two minutes", "you can always change this later", "first things first"],
  avoid: [
    { word: "oops! looks like you haven't", reason: "patronizing UX cliché" },
    { word: "empower your workflow", reason: "jargon in UI" },
    { word: "sit back and relax", reason: "filler" }
  ] },

{ id: "retention-winback", name: "Retention / Win-back / Renewal", group: "context",
  aliases: ["retention", "winback", "churn", "renewal", "re-engagement", "newsletter", "loyalty", "inactive"],
  adjectives: ["new", "improved", "quiet", "missed", "updated", "faster", "simpler", "fresh", "saved", "waiting"],
  verbs: ["revisit", "pick up", "check in", "update", "pause", "adjust", "return", "keep", "explore", "switch"],
  nouns: ["progress", "updates", "changes", "archive", "preferences", "digest", "recap", "cadence", "feedback"],
  phrases: ["since you were last here", "what's new", "pick up where you left off", "too many emails?", "fewer updates"],
  avoid: [
    { word: "we miss you!", reason: "needy / generic" },
    { word: "are you sure you want to leave?", reason: "confirmshaming" },
    { word: "don't miss out", reason: "generic FOMO" }
  ] },

{ id: "apology-recovery", name: "Apologies / Errors / Service Recovery", group: "context",
  aliases: ["apology", "error", "outage", "delay", "support", "404", "mistake", "maintenance", "refund"],
  adjectives: ["honest", "direct", "fixed", "resolved", "temporary", "clear", "credited", "updated", "transparent", "specific"],
  verbs: ["missed", "delayed", "broke", "fixed", "restored", "credited", "investigating", "prevent", "explain", "reimburse", "update"],
  nouns: ["delay", "issue", "outage", "mistake", "fix", "credit", "status", "update", "cause", "timeline", "team"],
  phrases: ["that's on us", "we're fixing it", "here's what happened", "make it right", "back up and running", "no action needed on your end"],
  avoid: [
    { word: "we apologize for any inconvenience", reason: "cold / corporate non-apology" },
    { word: "oopsie / whoops!", reason: "flippant when user lost data or money" },
    { word: "unforeseen circumstances", reason: "evasive" },
    { word: "your call is very important to us", reason: "insincere cliché" }
  ] },

{ id: "launch-announcement", name: "Product Launch / Changelog", group: "context",
  aliases: ["launch", "new", "release", "changelog", "update", "announcement", "beta", "waitlist"],
  adjectives: ["new", "live", "available", "faster", "redesigned", "requested", "early", "improved", "built-in", "simpler"],
  verbs: ["introducing", "meet", "shipped", "built", "added", "rebuilt", "redesigned", "released", "expanded", "upgraded"],
  nouns: ["release", "update", "version", "feature", "waitlist", "beta", "feedback", "request", "rollout"],
  phrases: ["now live", "you asked, we built", "available today", "under the hood", "early access", "rolling out"],
  avoid: [
    { word: "we are thrilled to announce", reason: "press-release cliché" },
    { word: "excited to share", reason: "LinkedIn cliché" },
    { word: "groundbreaking new", reason: "hype" }
  ] },

{ id: "comparison-switching", name: "Comparison / vs. Alternatives", group: "context",
  aliases: ["comparison", "vs", "alternative", "switch", "migrate", "competitor", "why us", "differentiation"],
  adjectives: ["simpler", "lighter", "faster", "transparent", "independent", "focused", "modern", "honest", "fair", "purpose-built"],
  verbs: ["switch", "replace", "compare", "migrate", "outgrow", "simplify", "consolidate", "import", "choose"],
  nouns: ["bloat", "alternative", "switch", "migration", "trade-off", "difference", "fit", "overhead", "setup"],
  phrases: ["built specifically for", "without the bloat", "side by side", "when to choose", "when we're not the right fit"],
  avoid: [
    { word: "the #1 alternative", reason: "unsubstantiated" },
    { word: "unlike our competitors", reason: "petty / vague" },
    { word: "all-in-one killer", reason: "aggressive jargon" }
  ] }

);