// Word bank: moods and brand voices.
// Single words live in adjectives, verbs, and nouns (safe for dictionary API lookups).
// Multi-word expressions live in phrases.
window.WORDS = window.WORDS || [];
window.WORDS.push(

// ---------- Upscale ----------
{ id: "luxury", name: "Luxury", group: "mood",
  aliases: ["premium", "high-end", "upscale", "lavish", "opulent", "prestige"],
  adjectives: ["opulent", "sumptuous", "lavish", "exquisite", "refined", "impeccable", "indulgent", "bespoke", "handcrafted", "rarefied", "lustrous", "velvety", "gilded", "plush", "decadent", "consummate", "distinguished", "elevated", "coveted", "unhurried"],
  verbs: ["indulge", "savor", "adorn", "pamper", "elevate", "unveil", "envelop", "curate", "treasure", "revel", "lavish", "bestow", "commission"],
  nouns: ["craftsmanship", "provenance", "finesse", "splendor", "indulgence", "allure", "artistry", "opulence", "atelier", "sanctuary", "pedigree", "caliber"],
  phrases: ["made to order", "by appointment", "quiet luxury", "old-world craft"],
  avoid: [
    { word: "world-class", reason: "cliché" },
    { word: "best-in-class", reason: "corporate cliché" },
    { word: "premium quality", reason: "vague" },
    { word: "high-end", reason: "tell, don't show" },
    { word: "luxurious", reason: "tell, don't show" }
  ] },

{ id: "elegant", name: "Elegant", group: "mood",
  aliases: ["classy", "sophisticated", "graceful", "chic", "poised"],
  adjectives: ["graceful", "poised", "polished", "understated", "refined", "timeless", "sleek", "tailored", "fluid", "delicate", "classic", "composed", "sophisticated", "chic", "svelte", "harmonious", "discreet", "effortless", "measured", "sculpted"],
  verbs: ["grace", "drape", "accent", "refine", "complement", "flatter", "frame", "polish", "distill", "soften", "enhance", "finish", "streamline"],
  nouns: ["poise", "grace", "balance", "silhouette", "line", "finesse", "restraint", "proportion", "polish", "harmony", "cadence"],
  phrases: ["effortless grace", "clean lines", "quiet confidence", "understated detail"],
  avoid: [
    { word: "classy", reason: "tacky in copy" },
    { word: "fancy", reason: "juvenile" },
    { word: "sophisticated elegance", reason: "redundant" },
    { word: "stylish and elegant", reason: "filler" }
  ] },

{ id: "exclusive", name: "Exclusive", group: "mood",
  aliases: ["vip", "members", "private", "limited edition", "invite-only", "scarcity"],
  adjectives: ["private", "invitation-only", "limited", "rare", "select", "members-only", "coveted", "hidden", "insider", "singular", "one-of-a-kind", "unlisted", "hand-picked", "numbered", "by-appointment", "discreet", "reserved", "sought-after", "scarce", "intimate"],
  verbs: ["reserve", "invite", "admit", "unlock", "secure", "claim", "access", "preview", "gather", "join", "belong", "acquire", "allocate"],
  nouns: ["access", "privilege", "circle", "allocation", "waitlist", "debut", "preview", "membership", "allotment", "edition", "patron"],
  phrases: ["inner sanctum", "first look", "small batch", "closed doors", "limited run"],
  avoid: [
    { word: "VIP", reason: "cliché" },
    { word: "elite", reason: "alienating" },
    { word: "exclusive offer", reason: "spammy in mass emails" },
    { word: "act now", reason: "infomercial cliché" }
  ] },

{ id: "heritage", name: "Heritage / Timeless", group: "mood",
  aliases: ["timeless", "traditional", "classic", "established", "legacy", "family business", "historic"],
  adjectives: ["time-honored", "enduring", "storied", "generational", "venerable", "original", "authentic", "rooted", "classic", "traditional", "handed-down", "established", "faithful", "legendary", "archival", "steadfast", "perennial", "vintage", "founding", "heirloom"],
  verbs: ["preserve", "honor", "inherit", "endure", "restore", "revive", "safeguard", "uphold", "trace", "celebrate", "steward", "chronicle"],
  nouns: ["legacy", "lineage", "tradition", "roots", "origins", "craft", "archive", "hallmark", "provenance", "heritage", "chapter", "foundation"],
  phrases: ["carry on", "pass down", "family recipe", "stood the test of time", "since day one"],
  avoid: [
    { word: "iconic", reason: "overused" },
    { word: "old-fashioned", reason: "sounds dated" },
    { word: "since forever", reason: "vague" }
  ] },

// ---------- Value ----------
{ id: "budget", name: "Budget", group: "mood",
  aliases: ["cheap", "affordable", "value", "discount", "low cost", "thrifty", "bargain", "economical"],
  adjectives: ["affordable", "thrifty", "savvy", "smart", "wallet-friendly", "low-cost", "economical", "everyday", "sensible", "honest", "unfussy", "frugal", "accessible", "generous", "bargain", "cheerful", "reasonable", "fair-priced", "stripped-back", "practical"],
  verbs: ["save", "stretch", "score", "snag", "pocket", "trim", "slash", "cut", "compare", "bundle", "keep", "bank", "split"],
  nouns: ["deal", "bargain", "value", "steal", "savings", "freebie", "markdown", "sale", "perks", "rebate", "budget"],
  phrases: ["spend less", "price drop", "change in your pocket", "bang for your buck", "no markup"],
  avoid: [
    { word: "cheap", reason: "implies low quality" },
    { word: "lowest prices guaranteed", reason: "cliché / hard to prove" },
    { word: "unbeatable", reason: "empty hype" },
    { word: "too good to be true", reason: "triggers skepticism" }
  ] },

{ id: "practical", name: "Practical", group: "mood",
  aliases: ["useful", "functional", "sensible", "everyday", "utilitarian", "pragmatic"],
  adjectives: ["useful", "sensible", "sturdy", "reliable", "versatile", "handy", "functional", "hard-wearing", "straightforward", "efficient", "low-maintenance", "durable", "compact", "multi-purpose", "intuitive", "no-fuss", "dependable", "workable", "ergonomic", "everyday"],
  verbs: ["fix", "solve", "handle", "sort", "simplify", "organize", "last", "fit", "adapt", "streamline", "tackle", "cover", "store", "pack"],
  nouns: ["workhorse", "toolkit", "essentials", "staples", "know-how", "routine", "fix", "shortcut", "system", "utility", "gear"],
  phrases: ["does the job", "built to work", "day in, day out", "zero fuss"],
  avoid: [
    { word: "game-changer", reason: "cliché" },
    { word: "revolutionary", reason: "overused" },
    { word: "life hack", reason: "dated" },
    { word: "must-have", reason: "overused" }
  ] },

{ id: "no-nonsense", name: "No-nonsense", group: "mood",
  aliases: ["direct", "straightforward", "honest", "plain", "blunt", "frank", "transparent"],
  adjectives: ["straight", "plain", "honest", "direct", "upfront", "clear", "blunt", "frank", "simple", "transparent", "unvarnished", "sincere", "bare-bones", "matter-of-fact", "unpretentious", "real", "solid", "candid", "unfiltered", "terse"],
  verbs: ["deliver", "cut", "tell", "show", "promise", "keep", "skip", "ditch", "do", "prove", "clarify", "strip"],
  nouns: ["facts", "truth", "numbers", "results", "guarantee", "receipts", "proof", "substance", "clarity"],
  phrases: ["fine print", "bottom line", "plain English", "get on with", "spell out", "no fluff", "what you see is what you get"],
  avoid: [
    { word: "synergy", reason: "corporate jargon" },
    { word: "leverage", reason: "corporate jargon" },
    { word: "best-in-class", reason: "corporate cliché" },
    { word: "we're passionate about", reason: "empty filler" }
  ] },

// ---------- Warm ----------
{ id: "friendly", name: "Friendly", group: "mood",
  aliases: ["warm", "approachable", "casual", "welcoming", "fun", "conversational", "neighborly"],
  adjectives: ["warm", "welcoming", "approachable", "easygoing", "cheerful", "kind", "open", "helpful", "sunny", "good-natured", "down-to-earth", "chatty", "relaxed", "genuine", "neighborly", "upbeat", "patient", "inviting", "personable", "breezy"],
  verbs: ["welcome", "greet", "chat", "help", "share", "invite", "join", "cheer", "smile", "connect", "host", "introduce"],
  nouns: ["hello", "neighbor", "crew", "friend", "welcome", "chat", "table", "hospitality", "smile"],
  phrases: ["swing by", "pop in", "open door", "helping hand", "glad you're here", "say hello"],
  avoid: [
    { word: "dear valued customer", reason: "robotic" },
    { word: "we are pleased to inform you", reason: "stiff / bureaucratic" },
    { word: "per our policy", reason: "cold" }
  ] },

{ id: "conversational", name: "Conversational", group: "mood",
  aliases: ["casual", "human", "everyday", "spoken", "relatable", "gen z", "millennial", "natural"],
  adjectives: ["natural", "human", "relatable", "spoken", "unscripted", "candid", "offhand", "easy", "colloquial", "direct", "alive", "spontaneous", "unfussy", "familiar", "breezy", "real"],
  verbs: ["talk", "ask", "wonder", "admit", "share", "figure", "guess", "notice", "mean", "sound", "chat", "reckon"],
  nouns: ["take", "honesty", "thought", "hunch", "side", "vibe", "point", "story", "moment"],
  phrases: ["here's the thing", "truth is", "let's be real", "turns out", "long story short", "you know the feeling"],
  avoid: [
    { word: "hey guys", reason: "overused opener" },
    { word: "let's dive in", reason: "AI / blog cliché" },
    { word: "buckle up", reason: "cringe" },
    { word: "spoiler alert", reason: "dated" }
  ] },

{ id: "caring", name: "Caring / Nurturing", group: "mood",
  aliases: ["nurturing", "compassionate", "gentle", "supportive", "kind", "empathetic", "warm"],
  adjectives: ["gentle", "compassionate", "attentive", "nurturing", "tender", "thoughtful", "patient", "supportive", "reassuring", "soothing", "considerate", "protective", "kind-hearted", "devoted", "comforting", "safe", "unhurried", "warm", "empathetic", "steadying"],
  verbs: ["nurture", "comfort", "support", "listen", "protect", "soothe", "tend", "guide", "hold", "reassure", "ease", "cushion", "look after"],
  nouns: ["care", "comfort", "compassion", "haven", "support", "kindness", "warmth", "shelter", "empathy", "steadiness"],
  phrases: ["care for", "peace of mind", "safe hands", "at your own pace", "here when you need us"],
  avoid: [
    { word: "we care about you", reason: "empty without proof" },
    { word: "customer-centric", reason: "cold corporate jargon" },
    { word: "solutions", reason: "impersonal" }
  ] },

{ id: "cozy", name: "Cozy", group: "mood",
  aliases: ["hygge", "comfy", "homey", "snug", "warm", "autumnal", "comforting"],
  adjectives: ["snug", "warm", "homey", "toasty", "soft", "inviting", "intimate", "mellow", "comforting", "plush", "fireside", "crackling", "sheltered", "lived-in", "rustic", "sleepy", "cocooning", "slow", "woolly", "amber"],
  verbs: ["snuggle", "nestle", "linger", "wrap", "sip", "unwind", "light", "simmer", "gather", "tuck", "steep", "warm"],
  nouns: ["nook", "blanket", "hearth", "quilt", "fireside", "mug", "retreat", "candlelight", "slippers", "kettle", "ember", "flannel"],
  phrases: ["curl up", "settle in", "hunker down", "slow Sunday", "rainy afternoon"],
  avoid: [
    { word: "perfect for any occasion", reason: "generic filler" },
    { word: "must-have", reason: "overused" },
    { word: "hygge", reason: "overused trend word" }
  ] },

{ id: "community", name: "Community-minded", group: "mood",
  aliases: ["local", "together", "grassroots", "neighborhood", "inclusive", "collective", "civic"],
  adjectives: ["local", "neighborly", "shared", "grassroots", "inclusive", "collective", "homegrown", "open-door", "communal", "rooted", "welcoming", "mutual", "participatory", "civic", "intergenerational", "kindred", "united", "hands-on", "cooperative", "belonging"],
  verbs: ["gather", "join", "rally", "share", "build", "support", "volunteer", "host", "connect", "belong", "celebrate", "lift", "pool", "collaborate"],
  nouns: ["neighbors", "members", "circle", "potluck", "network", "movement", "hometown", "village", "commons", "table", "coalition"],
  phrases: ["block party", "common ground", "pitch in", "pull together", "built by neighbors"],
  avoid: [
    { word: "tribe", reason: "culturally appropriated / overused" },
    { word: "fam", reason: "forced slang" },
    { word: "synergy", reason: "corporate jargon" }
  ] },

// ---------- Energetic ----------
{ id: "playful", name: "Playful", group: "mood",
  aliases: ["fun", "quirky", "silly", "whimsical", "cheeky", "upbeat", "joyful"],
  adjectives: ["cheeky", "zany", "bubbly", "silly", "quirky", "giddy", "bouncy", "whimsical", "peppy", "mischievous", "goofy", "spirited", "lively", "colorful", "fizzy", "sprightly", "jaunty", "spunky", "bright", "irrepressible"],
  verbs: ["play", "bounce", "giggle", "tinker", "splash", "wiggle", "dare", "tickle", "romp", "doodle", "explore", "spark", "skip", "pop"],
  nouns: ["fun", "mischief", "sparkle", "surprise", "giggle", "adventure", "zest", "wink", "joy", "confetti", "twist"],
  phrases: ["high-five", "just for kicks", "good trouble", "no boring bits"],
  avoid: [
    { word: "epic", reason: "dated" },
    { word: "lit", reason: "dated slang" },
    { word: "random", reason: "dated" },
    { word: "a wall of emoji", reason: "formatting anti-pattern" }
  ] },

{ id: "witty", name: "Witty", group: "mood",
  aliases: ["clever", "humorous", "funny", "dry", "irreverent", "deadpan", "sardonic"],
  adjectives: ["clever", "sharp", "wry", "dry", "deadpan", "quick", "tongue-in-cheek", "sly", "knowing", "droll", "irreverent", "smart", "punchy", "arch", "ironic", "cheeky", "understated", "self-aware", "observant", "acidic"],
  verbs: ["quip", "tease", "wink", "nudge", "riff", "spin", "twist", "poke", "josh", "rib", "undercut", "subvert", "skew"],
  nouns: ["wit", "wordplay", "pun", "punchline", "aside", "one-liner", "twist", "banter", "irony", "subtext", "delivery"],
  phrases: ["play on", "read between the lines", "dry humor", "said no one ever"],
  avoid: [
    { word: "see what we did there", reason: "explaining the joke" },
    { word: "forced puns", reason: "anti-pattern" },
    { word: "dad jokes on repeat", reason: "anti-pattern" }
  ] },

{ id: "bold", name: "Bold", group: "mood",
  aliases: ["confident", "daring", "loud", "fearless", "strong", "assertive", "punchy"],
  adjectives: ["fearless", "daring", "striking", "audacious", "unapologetic", "loud", "vivid", "gutsy", "confident", "powerful", "commanding", "unmissable", "intense", "dynamic", "brazen", "assertive", "high-impact", "electric", "unflinching", "decisive"],
  verbs: ["dare", "defy", "claim", "own", "ignite", "break", "challenge", "command", "lead", "charge", "roar", "seize", "stand", "declare"],
  nouns: ["nerve", "statement", "edge", "impact", "spark", "punch", "conviction", "swagger", "guts", "stance", "backbone"],
  phrases: ["make no mistake", "front and center", "loud and clear", "no apologies"],
  avoid: [
    { word: "disruptive", reason: "tech cliché" },
    { word: "game-changing", reason: "cliché" },
    { word: "next-level", reason: "cliché" },
    { word: "unleash", reason: "overused" }
  ] },

{ id: "rebellious", name: "Rebellious", group: "mood",
  aliases: ["edgy", "punk", "irreverent", "renegade", "alternative", "challenger", "contrarian"],
  adjectives: ["renegade", "defiant", "rogue", "unruly", "raw", "gritty", "untamed", "irreverent", "subversive", "outlaw", "offbeat", "unconventional", "anti-establishment", "punk", "independent", "restless", "scrappy", "uncensored", "contrarian", "unfiltered"],
  verbs: ["rebel", "break", "rewrite", "challenge", "question", "smash", "ditch", "reject", "buck", "flip", "crash", "overturn", "refuse"],
  nouns: ["rule-breakers", "misfits", "underdogs", "revolt", "uprising", "outsiders", "manifesto", "noise", "edge", "friction", "heresy"],
  phrases: ["shake up", "rip up the rulebook", "against the grain", "question everything"],
  avoid: [
    { word: "disrupt", reason: "corporate cliché" },
    { word: "we're not like other brands", reason: "pick-me cliché" },
    { word: "rockstar", reason: "cliché" },
    { word: "ninja", reason: "cliché" }
  ] },

{ id: "adventurous", name: "Adventurous", group: "mood",
  aliases: ["exploring", "wild", "outdoorsy", "thrill", "daring", "nomadic", "expedition"],
  adjectives: ["daring", "intrepid", "wild", "untamed", "rugged", "far-flung", "uncharted", "spirited", "curious", "free-roaming", "off-grid", "boundless", "thrilling", "remote", "sweeping", "windswept", "restless", "sun-bleached", "unmapped", "fearless"],
  verbs: ["explore", "roam", "wander", "venture", "discover", "climb", "chase", "trek", "navigate", "embark", "scale", "brave", "cross", "chart"],
  nouns: ["journey", "expedition", "frontier", "trail", "horizon", "quest", "wilderness", "summit", "odyssey", "basecamp", "compass", "detour"],
  phrases: ["into the unknown", "uncharted territory", "pack light", "chase the horizon"],
  avoid: [
    { word: "bucket list", reason: "cliché" },
    { word: "off the beaten path", reason: "cliché" },
    { word: "hidden gem", reason: "cliché" },
    { word: "once-in-a-lifetime", reason: "overused" }
  ] },

// ---------- Calm ----------
{ id: "serene", name: "Serene / Calm", group: "mood",
  aliases: ["calm", "peaceful", "relaxing", "tranquil", "spa", "quiet", "restful"],
  adjectives: ["calm", "tranquil", "peaceful", "still", "quiet", "gentle", "hushed", "soft", "restful", "airy", "unhurried", "balanced", "soothing", "placid", "dreamy", "light", "weightless", "effortless", "serene", "limpid"],
  verbs: ["breathe", "rest", "unwind", "release", "float", "settle", "soothe", "restore", "drift", "quiet", "ease", "exhale", "soften"],
  nouns: ["calm", "stillness", "peace", "sanctuary", "haven", "retreat", "hush", "breath", "oasis", "pause", "quietude", "solace"],
  phrases: ["slow down", "catch your breath", "quiet hours", "room to breathe"],
  avoid: [
    { word: "zen", reason: "cultural cliché" },
    { word: "relax and rejuvenate", reason: "spa cliché" },
    { word: "pamper yourself", reason: "cliché" }
  ] },

{ id: "mindful", name: "Mindful", group: "mood",
  aliases: ["intentional", "conscious", "slow living", "wellbeing", "holistic", "present", "grounded"],
  adjectives: ["intentional", "conscious", "present", "aware", "grounded", "thoughtful", "considered", "deliberate", "balanced", "gentle", "purposeful", "reflective", "attentive", "centered", "slow", "honest", "whole", "unhurried", "steady", "lucid"],
  verbs: ["notice", "pause", "reflect", "breathe", "choose", "ground", "attune", "observe", "align", "nourish", "savor", "honor", "listen"],
  nouns: ["intention", "awareness", "presence", "practice", "ritual", "balance", "clarity", "moment", "rhythm", "cadence", "attention"],
  phrases: ["on purpose", "here and now", "take stock", "less rush"],
  avoid: [
    { word: "wellness journey", reason: "cliché" },
    { word: "self-care Sunday", reason: "social cliché" },
    { word: "best version of yourself", reason: "self-help cliché" },
    { word: "holistic", reason: "overused" }
  ] },

{ id: "minimalist", name: "Minimalist", group: "mood",
  aliases: ["clean", "simple", "scandi", "modern", "pared back", "sparse", "essential"],
  adjectives: ["clean", "simple", "pared-back", "spare", "uncluttered", "essential", "streamlined", "crisp", "quiet", "neutral", "modular", "considered", "honest", "functional", "sculptural", "airy", "monochrome", "precise", "stripped", "elementary"],
  verbs: ["simplify", "edit", "distill", "declutter", "reduce", "refine", "focus", "clear", "curate", "pare", "remove", "trim"],
  nouns: ["space", "form", "line", "essentials", "restraint", "clarity", "silence", "edit", "core", "economy", "proportion"],
  phrases: ["strip back", "white space", "nothing extra", "only what matters"],
  avoid: [
    { word: "sleek and modern", reason: "generic" },
    { word: "less is more", reason: "cliché" },
    { word: "minimalist aesthetic", reason: "tell, don't show" }
  ] },

// ---------- Editorial ----------
{ id: "editorial", name: "Editorial / Story-driven", group: "mood",
  aliases: ["editorial", "journalistic", "narrative", "literary", "documentary", "magazine", "observational"],
  adjectives: ["observant", "vivid", "textured", "nuanced", "reported", "unhurried", "literary", "evocative", "intimate", "layered", "curious", "reflective", "specific", "atmospheric", "grounded", "chronological"],
  verbs: ["chronicle", "observe", "trace", "unpack", "document", "sketch", "reveal", "profile", "recount", "examine", "linger", "frame"],
  nouns: ["dispatch", "portrait", "archive", "detail", "scene", "notebook", "fieldwork", "thread", "texture", "profile", "lens"],
  phrases: ["closer look", "behind the scenes", "in their own words", "step inside"],
  avoid: [
    { word: "storytelling", reason: "overused" },
    { word: "deep dive", reason: "overused" },
    { word: "unpacking", reason: "overused" }
  ] },

// ---------- Credible ----------
{ id: "professional", name: "Professional", group: "mood",
  aliases: ["corporate", "formal", "business", "b2b", "serious", "enterprise"],
  adjectives: ["reliable", "experienced", "qualified", "thorough", "dependable", "accurate", "rigorous", "accountable", "responsive", "diligent", "polished", "capable", "skilled", "efficient", "meticulous", "discreet", "consistent", "proven", "methodical", "compliant"],
  verbs: ["deliver", "advise", "manage", "ensure", "resolve", "guide", "assess", "implement", "support", "plan", "oversee", "safeguard", "execute", "coordinate"],
  nouns: ["expertise", "experience", "standards", "diligence", "process", "results", "service", "reliability", "governance", "execution", "rigor"],
  phrases: ["track record", "on schedule", "clear scope", "single point of contact"],
  avoid: [
    { word: "solutions", reason: "vague" },
    { word: "leverage", reason: "jargon" },
    { word: "synergy", reason: "jargon" },
    { word: "one-stop shop", reason: "cliché" },
    { word: "cutting-edge", reason: "cliché" },
    { word: "best-in-class", reason: "cliché" }
  ] },

{ id: "authoritative", name: "Authoritative / Expert", group: "mood",
  aliases: ["expert", "specialist", "leader", "credible", "thought leadership", "academic", "research"],
  adjectives: ["expert", "leading", "definitive", "seasoned", "respected", "recognized", "rigorous", "evidence-based", "trusted", "specialist", "credentialed", "insightful", "decisive", "informed", "analytical", "renowned", "pioneering", "well-versed", "empirical", "peer-reviewed"],
  verbs: ["lead", "define", "set", "advise", "establish", "prove", "research", "publish", "pioneer", "shape", "interpret", "guide", "benchmark", "verify"],
  nouns: ["insight", "research", "authority", "expertise", "benchmark", "standard", "evidence", "perspective", "field", "methodology", "consensus", "data"],
  phrases: ["backed by data", "gold standard", "first principles", "proven track record"],
  avoid: [
    { word: "thought leader", reason: "cringe buzzword" },
    { word: "guru", reason: "unprofessional" },
    { word: "world-renowned", reason: "unsubstantiated hype" },
    { word: "rockstar", reason: "cliché" }
  ] },

{ id: "trustworthy", name: "Trustworthy", group: "mood",
  aliases: ["reliable", "safe", "honest", "secure", "dependable", "transparent", "ethical"],
  adjectives: ["honest", "reliable", "transparent", "dependable", "steady", "secure", "safe", "consistent", "genuine", "ethical", "accountable", "certified", "verified", "upfront", "principled", "faithful", "sincere", "sound", "audited", "backed"],
  verbs: ["protect", "guarantee", "keep", "promise", "honor", "secure", "assure", "verify", "commit", "answer", "shield", "back", "vouch"],
  nouns: ["trust", "guarantee", "promise", "integrity", "reputation", "word", "accountability", "proof", "transparency", "backing"],
  phrases: ["stand behind", "peace of mind", "track record", "no hidden fees", "in writing"],
  avoid: [
    { word: "trust us", reason: "triggers distrust" },
    { word: "100% guaranteed", reason: "spammy" },
    { word: "no risk", reason: "overpromise" }
  ] },

{ id: "innovative", name: "Innovative", group: "mood",
  aliases: ["futuristic", "modern", "cutting edge", "forward-thinking", "tech", "inventive", "r&d"],
  adjectives: ["forward-thinking", "inventive", "pioneering", "ingenious", "original", "fresh", "smart", "adaptive", "agile", "next-generation", "experimental", "visionary", "clever", "emerging", "breakthrough", "future-ready", "modern", "unexpected", "novel", "modular"],
  verbs: ["invent", "reimagine", "build", "design", "prototype", "launch", "rethink", "evolve", "engineer", "pioneer", "test", "transform", "iterate"],
  nouns: ["idea", "breakthrough", "prototype", "frontier", "lab", "invention", "future", "approach", "edge", "blueprint", "leap"],
  phrases: ["built from scratch", "new way to", "first of its kind", "ahead of the curve"],
  avoid: [
    { word: "disruptive", reason: "tech cliché" },
    { word: "game-changer", reason: "cliché" },
    { word: "revolutionary", reason: "overused" },
    { word: "cutting-edge", reason: "cliché" },
    { word: "paradigm shift", reason: "jargon" },
    { word: "innovative", reason: "tell, don't show" }
  ] },

// ---------- Emotional ----------
{ id: "inspiring", name: "Inspiring", group: "mood",
  aliases: ["uplifting", "motivational", "empowering", "hopeful", "aspirational"],
  adjectives: ["uplifting", "hopeful", "empowering", "stirring", "rousing", "brave", "heartfelt", "luminous", "radiant", "moving", "galvanizing", "aspirational", "courageous", "energizing", "motivating", "encouraging", "meaningful", "resilient", "bold", "steadfast"],
  verbs: ["inspire", "lift", "empower", "spark", "rise", "dream", "believe", "kindle", "awaken", "strive", "champion", "transform", "ignite", "persevere"],
  nouns: ["hope", "courage", "purpose", "dream", "possibility", "spark", "vision", "potential", "calling", "resolve", "momentum"],
  phrases: ["step forward", "against the odds", "built for what's next", "begin again"],
  avoid: [
    { word: "unleash your potential", reason: "cliché" },
    { word: "live your best life", reason: "cliché" },
    { word: "dream big", reason: "cliché" }
  ] },

{ id: "nostalgic", name: "Nostalgic", group: "mood",
  aliases: ["retro", "vintage", "throwback", "old school", "analog", "classic"],
  adjectives: ["retro", "vintage", "classic", "old-school", "timeless", "familiar", "beloved", "throwback", "sepia", "faded", "homespun", "cherished", "wistful", "golden", "bygone", "simpler", "sentimental", "well-worn", "analog", "sun-faded"],
  verbs: ["remember", "revisit", "rediscover", "relive", "recall", "return", "revive", "reminisce", "cherish", "recreate", "treasure", "keep"],
  nouns: ["memories", "childhood", "summers", "mixtape", "keepsake", "era", "roots", "snapshot", "vinyl", "postcards", "heirlom"],
  phrases: ["bring back", "grandma's kitchen", "good old days", "just like you remember", "worn in"],
  avoid: [
    { word: "like you've never seen before", reason: "hype cliché" },
    { word: "back by popular demand", reason: "cliché unless verifiable" }
  ] },

{ id: "romantic", name: "Romantic", group: "mood",
  aliases: ["love", "valentine", "sensual", "dreamy", "intimate", "affectionate"],
  adjectives: ["dreamy", "tender", "intimate", "passionate", "enchanting", "sultry", "candlelit", "starry", "sweet", "heartfelt", "whimsical", "swoon-worthy", "lush", "velvety", "blushing", "devoted", "soft-focus", "magical", "ardent", "lingering"],
  verbs: ["swoon", "cherish", "adore", "whisper", "embrace", "woo", "linger", "sweep", "enchant", "kiss", "celebrate", "surprise", "captivate"],
  nouns: ["romance", "love", "devotion", "moonlight", "rendezvous", "keepsake", "embrace", "spark", "affection", "tryst", "serenade"],
  phrases: ["love story", "head over heels", "just the two of you", "stolen glance"],
  avoid: [
    { word: "perfect for that special someone", reason: "greeting-card cliché" },
    { word: "fairytale", reason: "cliché" }
  ] },

{ id: "urgent", name: "Urgent / Limited-time", group: "mood",
  aliases: ["sale", "scarcity", "limited", "deadline", "promo", "fomo", "launch", "drop"],
  adjectives: ["limited", "last-chance", "final", "fleeting", "rare", "time-sensitive", "instant", "immediate", "fast", "now-or-never", "closing", "rapid", "ending", "scarce", "one-time", "only", "today-only", "early", "brief", "imminent"],
  verbs: ["hurry", "grab", "claim", "secure", "act", "reserve", "rush", "catch", "beat", "book", "snag", "enter"],
  nouns: ["deadline", "countdown", "window", "sale", "allocation", "drop", "clock", "cutoff"],
  phrases: ["snap up", "lock in", "final hours", "last call", "flash sale", "early bird", "while stocks last", "doors close"],
  avoid: [
    { word: "ACT NOW!!!", reason: "spam trigger / aggressive" },
    { word: "fake countdown timers", reason: "dark pattern / deceptive" },
    { word: "buy before it's too late", reason: "pushy cliché" }
  ] }

);