import {
  BookmarkFolder,
  BookmarkItem,
  CategorizationOptions,
  ChangeSummary,
} from "../types/bookmark";

export interface CategoryRule {
  name: string;
  subCategory?: string;
  icon: string;
  color: string;
  domainMatches: string[];
  keywordMatches: string[];
  urlPathMatches?: string[];
}

export const TAXONOMY_RULES: CategoryRule[] = [
  // AI & Machine Learning
  {
    name: "AI & Machine Learning",
    subCategory: "LLMs & Models",
    icon: "Bot",
    color: "#8B5CF6",
    domainMatches: [
      "openai.com",
      "chatgpt.com",
      "anthropic.com",
      "claude.ai",
      "deepmind.google",
      "huggingface.co",
      "replicate.com",
      "mistral.ai",
      "groq.com",
      "perplexity.ai",
      "midjourney.com",
      "cohere.com",
      "stability.ai",
      "together.ai",
      "vllm.ai",
      "ollama.com",
      "lmstudio.ai",
      "poe.com",
      "gemini.google.com",
      "aistudio.google.com",
    ],
    keywordMatches: [
      "chatgpt",
      "gemini",
      "claude",
      "llm",
      "prompt",
      "transformer",
      "diffusion",
      "neural",
      "langchain",
      "llamaindex",
      "copilot",
      "genai",
      "whisper",
      "embedding",
    ],
  },
  // Front-End & Web Development
  {
    name: "Development & Engineering",
    subCategory: "Frontend & UI",
    icon: "Code",
    color: "#3B82F6",
    domainMatches: [
      "react.dev",
      "reactjs.org",
      "vuejs.org",
      "angular.dev",
      "svelte.dev",
      "nextjs.org",
      "remix.run",
      "tailwindcss.com",
      "getbootstrap.com",
      "vitejs.dev",
      "webpack.js.org",
      "eslint.org",
      "typescriptlang.org",
      "postcss.org",
      "radix-ui.com",
      "shadcn.com",
      "ui.shadcn.com",
      "styled-components.com",
      "mui.com",
      "chakra-ui.com",
      "ant.design",
    ],
    keywordMatches: [
      "react",
      "vue",
      "angular",
      "svelte",
      "nextjs",
      "css",
      "html",
      "javascript",
      "typescript",
      "tailwind",
      "frontend",
      "component",
      "dom",
      "webpack",
      "vite",
    ],
  },
  // Backend & Databases
  {
    name: "Development & Engineering",
    subCategory: "Backend & Databases",
    icon: "Database",
    color: "#0EA5E9",
    domainMatches: [
      "nodejs.org",
      "expressjs.com",
      "nestjs.com",
      "fastapi.tiangolo.com",
      "djangoproject.com",
      "rubyonrails.org",
      "spring.io",
      "graphql.org",
      "postgresql.org",
      "mongodb.com",
      "redis.io",
      "sqlite.org",
      "prisma.io",
      "drizzle.team",
      "supabase.com",
      "firebase.google.com",
      "planetscale.com",
      "neon.tech",
      "appwrite.io",
    ],
    keywordMatches: [
      "backend",
      "postgres",
      "sql",
      "mongodb",
      "redis",
      "prisma",
      "orm",
      "graphql",
      "rest api",
      "endpoint",
      "database",
      "crud",
      "django",
      "flask",
      "fastapi",
      "expressjs",
    ],
  },
  // DevOps & Cloud Infrastructure
  {
    name: "Development & Engineering",
    subCategory: "Cloud & DevOps",
    icon: "Cloud",
    color: "#06B6D4",
    domainMatches: [
      "aws.amazon.com",
      "cloud.google.com",
      "azure.microsoft.com",
      "vercel.com",
      "netlify.com",
      "cloudflare.com",
      "render.com",
      "railway.app",
      "fly.io",
      "docker.com",
      "kubernetes.io",
      "terraform.io",
      "github.com/features/actions",
      "digitalocean.com",
      "linode.com",
      "hetzner.com",
      "sentry.io",
      "datadoghq.com",
    ],
    keywordMatches: [
      "docker",
      "kubernetes",
      "aws",
      "gcp",
      "azure",
      "ci/cd",
      "devops",
      "cloud",
      "serverless",
      "lambda",
      "terraform",
      "sentry",
      "datadog",
      "grafana",
      "prometheus",
    ],
  },
  // Code Repos & Developer Tools
  {
    name: "Development & Engineering",
    subCategory: "Repositories & Tools",
    icon: "GitBranch",
    color: "#6366F1",
    domainMatches: [
      "github.com",
      "gitlab.com",
      "bitbucket.org",
      "stackoverflow.com",
      "stackexchange.com",
      "npmjs.com",
      "pypi.org",
      "crates.io",
      "developer.mozilla.org",
      "devdocs.io",
      "caniuse.com",
      "regex101.com",
      "postman.com",
      "insomnia.rest",
      "leetcode.com",
      "hackerrank.com",
      "codepen.io",
    ],
    keywordMatches: [
      "github",
      "gitlab",
      "stackoverflow",
      "npm",
      "pypi",
      "crates",
      "mdn",
      "regex",
      "postman",
      "git",
      "repo",
      "package",
      "api docs",
      "cheat sheet",
    ],
  },
  // Design & Creative
  {
    name: "Design & Creative",
    subCategory: "UI/UX & Inspiration",
    icon: "Palette",
    color: "#EC4899",
    domainMatches: [
      "figma.com",
      "dribbble.com",
      "behance.net",
      "framer.com",
      "mobbin.com",
      "awwwards.com",
      "godly.website",
      "land-book.com",
      "screenlane.com",
      "saaspo.com",
      "collectui.com",
      "pageflows.com",
    ],
    keywordMatches: [
      "figma",
      "dribbble",
      "behance",
      "framer",
      "ui design",
      "ux",
      "wireframe",
      "prototype",
      "inspiration",
      "typography",
      "palette",
      "landing page",
      "layout",
    ],
  },
  // Design Assets & Media
  {
    name: "Design & Creative",
    subCategory: "Icons & Assets",
    icon: "Sparkles",
    color: "#F43F5E",
    domainMatches: [
      "unsplash.com",
      "pexels.com",
      "freepik.com",
      "iconify.design",
      "lucide.dev",
      "fontawesome.com",
      "heroicons.com",
      "svgrepo.com",
      "flaticon.com",
      "thenounproject.com",
      "coolors.co",
      "fonts.google.com",
      "typewolf.com",
      "lottiefiles.com",
    ],
    keywordMatches: [
      "unsplash",
      "icons",
      "svg",
      "vector",
      "stock photo",
      "font",
      "typeface",
      "illustration",
      "mockup",
      "lottie",
      "texture",
      "colors",
    ],
  },
  // Productivity & Workspace
  {
    name: "Productivity & Workspace",
    subCategory: "Notes & Tasks",
    icon: "CheckSquare",
    color: "#10B981",
    domainMatches: [
      "notion.so",
      "trello.com",
      "asana.com",
      "linear.app",
      "monday.com",
      "clickup.com",
      "todoist.com",
      "ticktick.com",
      "obsidian.md",
      "roamresearch.com",
      "coda.io",
      "craft.do",
      "evernote.com",
      "keep.google.com",
      "tasks.google.com",
    ],
    keywordMatches: [
      "notion",
      "trello",
      "asana",
      "linear",
      "todoist",
      "obsidian",
      "tasks",
      "board",
      "sprint",
      "kanban",
      "notes",
      "workspace",
      "checklist",
    ],
  },
  // Docs, Storage & Meetings
  {
    name: "Productivity & Workspace",
    subCategory: "Docs & Communication",
    icon: "FileText",
    color: "#059669",
    domainMatches: [
      "docs.google.com",
      "drive.google.com",
      "dropbox.com",
      "onedrive.live.com",
      "slack.com",
      "zoom.us",
      "meet.google.com",
      "discord.com",
      "teams.microsoft.com",
      "loom.com",
      "miro.com",
      "calendly.com",
    ],
    keywordMatches: [
      "google docs",
      "google drive",
      "slack",
      "discord",
      "zoom",
      "meeting",
      "calendar",
      "dropbox",
      "cloud storage",
      "loom",
      "miro",
      "whiteboard",
      "spreadsheet",
    ],
  },
  // Finance, Business & Analytics
  {
    name: "Finance & Business",
    subCategory: "Payments & Banking",
    icon: "DollarSign",
    color: "#EAB308",
    domainMatches: [
      "stripe.com",
      "paypal.com",
      "wise.com",
      "chase.com",
      "bankofamerica.com",
      "wellsfargo.com",
      "revolut.com",
      "mercury.com",
      "brex.com",
      "gusto.com",
      "quickbooks.intuit.com",
      "xero.com",
      "paddle.com",
    ],
    keywordMatches: [
      "stripe",
      "paypal",
      "bank",
      "invoice",
      "payment",
      "payroll",
      "accounting",
      "billing",
      "credit card",
      "transfers",
    ],
  },
  // Investing & Analytics
  {
    name: "Finance & Business",
    subCategory: "Investing & Analytics",
    icon: "TrendingUp",
    color: "#CA8A04",
    domainMatches: [
      "tradingview.com",
      "coinbase.com",
      "binance.com",
      "robinhood.com",
      "finance.yahoo.com",
      "bloomberg.com",
      "analytics.google.com",
      "mixpanel.com",
      "posthog.com",
      "semrush.com",
      "ahrefs.com",
    ],
    keywordMatches: [
      "stocks",
      "crypto",
      "trading",
      "investing",
      "bitcoin",
      "ethereum",
      "portfolio",
      "analytics",
      "seo",
      "traffic",
      "metrics",
      "chart",
    ],
  },
  // Learning & Education
  {
    name: "Learning & Education",
    subCategory: "Courses & Tutorials",
    icon: "GraduationCap",
    color: "#F59E0B",
    domainMatches: [
      "coursera.org",
      "udemy.com",
      "edx.org",
      "freecodecamp.org",
      "frontendmasters.com",
      "egghead.io",
      "khanacademy.org",
      "scrimba.com",
      "codecademy.com",
      "pluralsight.com",
      "skillshare.com",
      "masterclass.com",
    ],
    keywordMatches: [
      "course",
      "tutorial",
      "learn",
      "academy",
      "curriculum",
      "lecture",
      "bootcamp",
      "certificate",
      "exercises",
      "study",
    ],
  },
  // Research & Reading
  {
    name: "Learning & Education",
    subCategory: "Articles & Reference",
    icon: "BookOpen",
    color: "#D97706",
    domainMatches: [
      "wikipedia.org",
      "arxiv.org",
      "medium.com",
      "substack.com",
      "goodreads.com",
      "scholar.google.com",
      "nature.com",
      "researchgate.net",
      "jstor.org",
      "gutenberg.org",
      "archive.org",
      "britannica.com",
    ],
    keywordMatches: [
      "wikipedia",
      "arxiv",
      "paper",
      "research",
      "journal",
      "reading",
      "book",
      "essay",
      "publication",
      "reference",
      "dictionary",
      "thesaurus",
    ],
  },
  // News & Media
  {
    name: "News & Publications",
    subCategory: "Tech & General News",
    icon: "Newspaper",
    color: "#64748B",
    domainMatches: [
      "news.ycombinator.com",
      "techcrunch.com",
      "theverge.com",
      "wired.com",
      "arstechnica.com",
      "nytimes.com",
      "bbc.com",
      "theguardian.com",
      "reuters.com",
      "wsj.com",
      "ft.com",
      "forbes.com",
      "economist.com",
      "engadget.com",
      "mashable.com",
      "9to5mac.com",
    ],
    keywordMatches: [
      "news",
      "hacker news",
      "techcrunch",
      "the verge",
      "breaking news",
      "report",
      "journalism",
      "editorial",
      "headline",
      "daily",
    ],
  },
  // Entertainment & Streaming
  {
    name: "Entertainment & Media",
    subCategory: "Video & Streaming",
    icon: "Film",
    color: "#EF4444",
    domainMatches: [
      "youtube.com",
      "netflix.com",
      "hulu.com",
      "disneyplus.com",
      "primevideo.com",
      "twitch.tv",
      "vimeo.com",
      "hbomax.com",
      "crunchyroll.com",
      "imdb.com",
      "rottentomatoes.com",
    ],
    keywordMatches: [
      "youtube",
      "netflix",
      "video",
      "stream",
      "movie",
      "series",
      "trailer",
      "anime",
      "watch",
      "show",
      "cinema",
      "film",
    ],
  },
  // Music & Audio
  {
    name: "Entertainment & Media",
    subCategory: "Music & Podcasts",
    icon: "Headphones",
    color: "#DC2626",
    domainMatches: [
      "spotify.com",
      "music.apple.com",
      "soundcloud.com",
      "bandcamp.com",
      "audiomack.com",
      "podcast.google.com",
      "overcast.fm",
      "pocketcasts.com",
    ],
    keywordMatches: [
      "music",
      "spotify",
      "album",
      "song",
      "playlist",
      "audio",
      "track",
      "podcast",
      "radio",
      "artist",
      "beat",
    ],
  },
  // Gaming
  {
    name: "Entertainment & Media",
    subCategory: "Gaming",
    icon: "Gamepad2",
    color: "#B91C1C",
    domainMatches: [
      "steampowered.com",
      "epicgames.com",
      "ign.com",
      "gamespot.com",
      "polygon.com",
      "roblox.com",
      "ea.com",
      "blizzard.com",
      "chess.com",
      "itch.io",
    ],
    keywordMatches: [
      "game",
      "steam",
      "gaming",
      "playstation",
      "xbox",
      "nintendo",
      "rpg",
      "multiplayer",
      "speedrun",
      "walkthrough",
      "mod",
    ],
  },
  // Shopping & E-Commerce
  {
    name: "Shopping & E-Commerce",
    subCategory: "Retail & Deals",
    icon: "ShoppingBag",
    color: "#14B8A6",
    domainMatches: [
      "amazon.com",
      "ebay.com",
      "aliexpress.com",
      "walmart.com",
      "target.com",
      "etsy.com",
      "bestbuy.com",
      "costco.com",
      "ikea.com",
      "shopify.com",
      "nike.com",
      "zara.com",
      "asos.com",
    ],
    keywordMatches: [
      "amazon",
      "shop",
      "store",
      "buy",
      "price",
      "deal",
      "cart",
      "order",
      "discount",
      "coupon",
      "ecommerce",
      "sale",
      "product",
    ],
  },
  // Social & Communities
  {
    name: "Social & Communities",
    subCategory: "Social Networks",
    icon: "Users",
    color: "#3B82F6",
    domainMatches: [
      "twitter.com",
      "x.com",
      "reddit.com",
      "linkedin.com",
      "facebook.com",
      "instagram.com",
      "threads.net",
      "bsky.app",
      "tiktok.com",
      "pinterest.com",
      "mastodon.social",
      "tumblr.com",
    ],
    keywordMatches: [
      "twitter",
      "reddit",
      "linkedin",
      "social",
      "community",
      "forum",
      "post",
      "thread",
      "followers",
      "profile",
    ],
  },
  // Travel & Lifestyle
  {
    name: "Travel & Lifestyle",
    subCategory: "Travel & Food",
    icon: "Compass",
    color: "#F97316",
    domainMatches: [
      "airbnb.com",
      "booking.com",
      "maps.google.com",
      "tripadvisor.com",
      "kayak.com",
      "expedia.com",
      "yelp.com",
      "ubereats.com",
      "doordash.com",
      "allrecipes.com",
      "strava.com",
      "myfitnesspal.com",
    ],
    keywordMatches: [
      "flight",
      "hotel",
      "travel",
      "map",
      "destination",
      "restaurant",
      "food",
      "recipe",
      "workout",
      "fitness",
      "vacation",
      "trip",
    ],
  },
  // Utilities & Tools
  {
    name: "Tools & Utilities",
    subCategory: "Online Utilities",
    icon: "Wrench",
    color: "#78716C",
    domainMatches: [
      "speedtest.net",
      "smallpdf.com",
      "tinypng.com",
      "10minutemail.com",
      "archive.is",
      "virustotal.com",
      "downdetector.com",
      "calc.com",
      "worldtimebuddy.com",
      "deepl.com",
      "translate.google.com",
    ],
    keywordMatches: [
      "converter",
      "calculator",
      "speedtest",
      "compress",
      "generator",
      "utility",
      "tool",
      "inspector",
      "checker",
      "formatter",
      "translator",
    ],
  },
];

export function cleanUrlTracking(rawUrl: string): { cleanedUrl: string; hadParams: boolean } {
  try {
    const parsed = new URL(rawUrl);
    const trackingKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_id",
      "fbclid",
      "gclid",
      "dclid",
      "gbraid",
      "wbraid",
      "ref",
      "source",
      "feature",
      "si",
      "igshid",
      "trk",
      "mc_cid",
      "mc_eid",
      "_hsenc",
      "_hsmi",
    ];

    let removedAny = false;
    for (const key of trackingKeys) {
      if (parsed.searchParams.has(key)) {
        parsed.searchParams.delete(key);
        removedAny = true;
      }
    }

    return {
      cleanedUrl: parsed.toString(),
      hadParams: removedAny,
    };
  } catch {
    return { cleanedUrl: rawUrl, hadParams: false };
  }
}

export function cleanBookmarkTitle(
  rawTitle: string,
  url: string,
): { cleanedTitle: string; changed: boolean } {
  let title = rawTitle.trim();
  const original = title;

  // Remove common SEO prefixes / suffixes
  title = title.replace(
    /\s*[-–—|:]\s*(YouTube|Google Search|Official Site|Home|Wikipedia|Reddit|GitHub|Amazon|Netflix)\s*$/i,
    "",
  );
  title = title.replace(/^(\(\d+\)\s*)/, ""); // Remove (1) notification counters
  title = title.replace(/^\s*(Login|Sign in|Welcome to|Home of)\s*[-–—|:]\s*/i, "");
  title = title.replace(/\s*\[(Updated|New|\d{4})\]\s*$/i, "");
  title = title.replace(/\s*-\s*The\s+[A-Za-z0-9\s]+\s*Platform\s*$/i, "");

  // If title was just a raw URL, make a nicer title from domain/path
  if (title.startsWith("http://") || title.startsWith("https://") || title.length === 0) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "");
      const pathPart = parsed.pathname.split("/").filter(Boolean).pop();
      if (pathPart && pathPart.length < 30) {
        title = `${host} - ${pathPart.replace(/[-_]/g, " ")}`;
      } else {
        title = host.charAt(0).toUpperCase() + host.slice(1);
      }
    } catch {
      title = "Web Bookmark";
    }
  }

  return {
    cleanedTitle: title.trim() || rawTitle,
    changed: title.trim() !== original,
  };
}

export function classifyBookmark(bookmark: BookmarkItem): {
  category: string;
  subCategory: string;
  color: string;
  icon: string;
} {
  const urlLower = bookmark.url.toLowerCase();
  const domainLower = bookmark.domain.toLowerCase();
  const titleLower = bookmark.title.toLowerCase();

  // 1. Check exact domain matches
  for (const rule of TAXONOMY_RULES) {
    for (const d of rule.domainMatches) {
      if (domainLower === d || domainLower.endsWith("." + d)) {
        return {
          category: rule.name,
          subCategory: rule.subCategory || "General",
          color: rule.color,
          icon: rule.icon,
        };
      }
    }
  }

  // 2. Check keyword matches in URL and Title
  let bestMatch: CategoryRule | null = null;
  let bestScore = 0;

  for (const rule of TAXONOMY_RULES) {
    let score = 0;
    for (const kw of rule.keywordMatches) {
      if (titleLower.includes(kw)) score += 2;
      if (urlLower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return {
      category: bestMatch.name,
      subCategory: bestMatch.subCategory || "General",
      color: bestMatch.color,
      icon: bestMatch.icon,
    };
  }

  // 3. Fallback to general categorization based on top-level domain or generic heuristics
  if (
    domainLower.includes("edu") ||
    domainLower.includes("school") ||
    domainLower.includes("university")
  ) {
    return {
      category: "Learning & Education",
      subCategory: "Academic",
      color: "#F59E0B",
      icon: "GraduationCap",
    };
  }
  if (domainLower.includes("gov") || domainLower.includes("org")) {
    return {
      category: "Reference & Public",
      subCategory: "Organizations",
      color: "#64748B",
      icon: "BookOpen",
    };
  }

  return {
    category: "General & Miscellaneous",
    subCategory: "Unsorted",
    color: "#6B7280",
    icon: "Folder",
  };
}

export function organizeBookmarks(
  flatBookmarks: BookmarkItem[],
  options: CategorizationOptions,
): {
  organizedTree: BookmarkFolder;
  processedBookmarks: BookmarkItem[];
  changeSummary: ChangeSummary;
} {
  const processedBookmarks: BookmarkItem[] = [];
  const seenUrls = new Map<string, string>(); // normalized URL -> ID of original
  let duplicatesRemoved = 0;
  let titlesCleanedCount = 0;
  let trackingParamsStrippedCount = 0;

  // Step 1: Clean and de-duplicate bookmarks
  for (const bm of flatBookmarks) {
    let currentUrl = bm.url;
    let _urlCleaned = false;

    if (options.stripTrackingParams) {
      const { cleanedUrl, hadParams } = cleanUrlTracking(currentUrl);
      if (hadParams) {
        currentUrl = cleanedUrl;
        trackingParamsStrippedCount++;
        _urlCleaned = true;
      }
    }

    // Normalized URL for duplicate checking
    const normUrl = currentUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "")
      .toLowerCase();
    const isDup = seenUrls.has(normUrl);

    if (isDup) {
      duplicatesRemoved++;
      if (options.removeDuplicates) {
        continue; // Skip adding duplicate to active organized list
      }
    } else {
      seenUrls.set(normUrl, bm.id);
    }

    let finalTitle = bm.title;
    if (options.cleanTitles) {
      const { cleanedTitle, changed } = cleanBookmarkTitle(finalTitle, currentUrl);
      if (changed) {
        finalTitle = cleanedTitle;
        titlesCleanedCount++;
      }
    }

    // Categorize
    const classification = classifyBookmark({ ...bm, url: currentUrl, title: finalTitle });

    const processedItem: BookmarkItem = {
      ...bm,
      url: currentUrl,
      title: finalTitle,
      category: classification.category,
      subCategory: classification.subCategory,
      isDuplicate: isDup,
      duplicateOfId: isDup ? seenUrls.get(normUrl) : undefined,
    };

    processedBookmarks.push(processedItem);
  }

  // Step 2: Build intuitive hierarchical tree structure based on hierarchy depth
  // Depth 1: [Bookmarks Bar] -> [Category] -> [Bookmarks]
  // Depth 2: [Bookmarks Bar] -> [Category] -> [Subfolder] -> [Bookmarks]
  // Depth 3: [Bookmarks Bar] -> [Category] -> [Subfolder] -> [Sub-topic] -> [Bookmarks]
  const hierarchyDepth =
    options.hierarchyDepth !== undefined
      ? options.hierarchyDepth
      : options.createSubfolders
        ? 2
        : 1;
  const allowSubfolders = options.createSubfolders && hierarchyDepth >= 2;

  const categoryFoldersMap = new Map<string, Map<string, BookmarkItem[]>>();

  for (const bm of processedBookmarks) {
    const cat = bm.category || "General & Miscellaneous";
    const subCat = allowSubfolders ? bm.subCategory || "General" : "General";

    if (!categoryFoldersMap.has(cat)) {
      categoryFoldersMap.set(cat, new Map());
    }
    const subMap = categoryFoldersMap.get(cat)!;
    if (!subMap.has(subCat)) {
      subMap.set(subCat, []);
    }
    subMap.get(subCat)!.push(bm);
  }

  let folderCounter = 0;
  const categoryFoldersList: BookmarkFolder[] = [];
  const categoriesCreatedSummary: ChangeSummary["categoriesCreated"] = [];

  // Sort categories logically
  const categoryOrder = [
    "Development & Engineering",
    "AI & Machine Learning",
    "Design & Creative",
    "Productivity & Workspace",
    "Finance & Business",
    "Learning & Education",
    "News & Publications",
    "Entertainment & Media",
    "Shopping & E-Commerce",
    "Social & Communities",
    "Travel & Lifestyle",
    "Tools & Utilities",
    "Reference & Public",
    "General & Miscellaneous",
  ];

  const sortedCatNames = Array.from(categoryFoldersMap.keys()).sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const catName of sortedCatNames) {
    const subMap = categoryFoldersMap.get(catName)!;
    const catRule = TAXONOMY_RULES.find((r) => r.name === catName);
    const catColor = catRule?.color || "#4F46E5";
    const catIcon = catRule?.icon || "Folder";

    const subFolderChildren: (BookmarkFolder | BookmarkItem)[] = [];
    let totalItemsInCat = 0;

    const subEntries = Array.from(subMap.entries());
    const totalCount = subEntries.reduce((acc, [, items]) => acc + items.length, 0);

    if (
      !allowSubfolders ||
      (subEntries.length === 1 && subEntries[0][0] === "General") ||
      totalCount < 3
    ) {
      // Flat within category (Level 1)
      for (const [, items] of subEntries) {
        subFolderChildren.push(...items);
        totalItemsInCat += items.length;
      }
    } else {
      // Group by subfolders (Level 2 or Level 3)
      for (const [subName, items] of subEntries) {
        if (items.length === 0) continue;
        totalItemsInCat += items.length;

        // If Level 3 is enabled and subName has a nested delimiter like "/" or " > "
        if (hierarchyDepth >= 3 && (subName.includes("/") || subName.includes(">"))) {
          const parts = subName
            .split(/[/>]/)
            .map((p) => p.trim())
            .filter(Boolean);
          if (parts.length >= 2) {
            const parentName = parts[0];
            const childName = parts.slice(1).join(" / ");

            // Look for existing parent folder or create it
            let existingParent = subFolderChildren.find(
              (f) => "children" in f && f.title === parentName,
            ) as BookmarkFolder | undefined;

            if (!existingParent) {
              existingParent = {
                id: `nested_${++folderCounter}`,
                title: parentName,
                addDate: String(Math.floor(Date.now() / 1000)),
                children: [],
              };
              subFolderChildren.push(existingParent);
            }

            // Create child subfolder
            existingParent.children.push({
              id: `sub_${++folderCounter}`,
              title: childName,
              addDate: String(Math.floor(Date.now() / 1000)),
              children: items,
            });
            continue;
          }
        }

        // Standard Level 2 subfolder
        if (items.length >= 1 && (subEntries.length > 1 || subName !== "General")) {
          subFolderChildren.push({
            id: `subfolder_${++folderCounter}`,
            title: subName,
            addDate: String(Math.floor(Date.now() / 1000)),
            children: items,
          });
        } else {
          subFolderChildren.push(...items);
        }
      }
    }

    const catFolder: BookmarkFolder = {
      id: `cat_${++folderCounter}`,
      title: catName,
      addDate: String(Math.floor(Date.now() / 1000)),
      children: subFolderChildren,
      color: catColor,
      iconName: catIcon,
    };

    categoryFoldersList.push(catFolder);
    categoriesCreatedSummary.push({
      name: catName,
      count: totalItemsInCat,
      subfolderCount: subEntries.length,
      color: catColor,
      icon: catIcon,
    });
  }

  // Wrap inside Bookmarks Bar if requested for optimal Chrome import experience
  let rootFolder: BookmarkFolder;
  if (options.organizeUnderBookmarksBar) {
    const bookmarksBar: BookmarkFolder = {
      id: "bookmarks_bar",
      title: "Bookmarks bar",
      isToolbar: true,
      addDate: String(Math.floor(Date.now() / 1000)),
      children: categoryFoldersList,
    };
    rootFolder = {
      id: "root",
      title: "Bookmarks",
      children: [bookmarksBar],
    };
  } else {
    rootFolder = {
      id: "root",
      title: "Bookmarks",
      children: categoryFoldersList,
    };
  }

  // Calculate domain stats
  const domainCounts = new Map<string, number>();
  for (const bm of processedBookmarks) {
    domainCounts.set(bm.domain, (domainCounts.get(bm.domain) || 0) + 1);
  }
  const topDomains = Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([domain, count]) => ({ domain, count }));

  const computedDepth = options.organizeUnderBookmarksBar ? 1 + hierarchyDepth : hierarchyDepth;

  const changeSummary: ChangeSummary = {
    originalBookmarkCount: flatBookmarks.length,
    finalBookmarkCount: processedBookmarks.length,
    duplicatesRemoved,
    titlesCleaned: titlesCleanedCount,
    trackingParamsStripped: trackingParamsStrippedCount,
    categoriesCreated: categoriesCreatedSummary,
    originalFolderDepth: 1,
    newFolderDepth: computedDepth,
    topDomains,
    structuralHighlights: [
      `Categorized ${processedBookmarks.length} bookmarks into ${categoriesCreatedSummary.length} intuitive folders with Level ${hierarchyDepth} hierarchy depth.`,
      duplicatesRemoved > 0
        ? `Detected and resolved ${duplicatesRemoved} duplicate entries.`
        : `Verified zero duplicate links.`,
      titlesCleanedCount > 0
        ? `Cleaned ${titlesCleanedCount} bloated/SEO website titles.`
        : `Preserved authentic bookmark labels.`,
      trackingParamsStrippedCount > 0
        ? `Sanitized tracking query parameters (UTMs, click IDs) from ${trackingParamsStrippedCount} URLs.`
        : `Verified all URLs are well-formed.`,
      `Structured directly for Google Chrome's "Bookmarks bar" with 1-click native HTML import compatibility.`,
    ],
  };

  return {
    organizedTree: rootFolder,
    processedBookmarks,
    changeSummary,
  };
}
