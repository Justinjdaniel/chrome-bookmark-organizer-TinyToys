export interface BookmarkPreset {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  rawHtml: string;
}

export const SAMPLE_BOOKMARKS: BookmarkPreset[] = [
  {
    id: "sample_full_mix",
    name: "Messy Chrome Export (50+ links)",
    description:
      "Realistic chaotic browser export with mixed tabs, duplicate links, tracking UTMs, and flat structure.",
    itemCount: 52,
    rawHtml: `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1672531199" LAST_MODIFIED="1704067199" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks bar</H3>
    <DL><p>
        <DT><A HREF="https://github.com/trending?since=daily&utm_source=hackernews" ADD_DATE="1690000001">Trending Repositories on GitHub today - GitHub</A>
        <DT><A HREF="https://react.dev/reference/react/useEffect?ref=twitter" ADD_DATE="1690000002">useEffect – React Documentation [Updated 2024]</A>
        <DT><A HREF="https://tailwindcss.com/docs/utility-first" ADD_DATE="1690000003">Utility-First Fundamentals - Tailwind CSS</A>
        <DT><A HREF="https://chatgpt.com/?model=gpt-4o" ADD_DATE="1690000004">ChatGPT</A>
        <DT><A HREF="https://claude.ai/chats" ADD_DATE="1690000005">Claude by Anthropic</A>
        <DT><A HREF="https://figma.com/files/recent" ADD_DATE="1690000006">Recent Files - Figma Design</A>
        <DT><A HREF="https://dribbble.com/shots/popular" ADD_DATE="1690000007">Discover the World's Top Designers &amp; Creatives - Dribbble</A>
        <DT><A HREF="https://notion.so/workspace/weekly-sprint-board" ADD_DATE="1690000008">Weekly Sprint Board - Notion</A>
        <DT><A HREF="https://linear.app/team/inbox" ADD_DATE="1690000009">Linear – Issue Tracking</A>
        <DT><A HREF="https://stripe.com/docs/api" ADD_DATE="1690000010">Stripe API Reference - Payments</A>
        <DT><A HREF="https://news.ycombinator.com/" ADD_DATE="1690000011">Hacker News</A>
        <DT><A HREF="https://theverge.com/tech" ADD_DATE="1690000012">Tech News - The Verge</A>
        <DT><A HREF="https://youtube.com/watch?v=dQw4w9WgXcQ&utm_source=share" ADD_DATE="1690000013">Rick Astley - Never Gonna Give You Up - YouTube</A>
        <DT><A HREF="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" ADD_DATE="1690000014">Today's Top Hits | Spotify Playlist</A>
        <DT><A HREF="https://amazon.com/dp/B08N5WRWNW?tag=affiliate-20" ADD_DATE="1690000015">Sony WH-1000XM4 Wireless Headphones : Amazon.com</A>
        <DT><A HREF="https://reddit.com/r/webdev" ADD_DATE="1690000016">r/webdev: What's new in web development - Reddit</A>
        <DT><A HREF="https://twitter.com/home" ADD_DATE="1690000017">Home / X (formerly Twitter)</A>
        <DT><A HREF="https://linkedin.com/feed/" ADD_DATE="1690000018">Feed | LinkedIn</A>
        <DT><A HREF="https://airbnb.com/s/Tokyo--Japan" ADD_DATE="1690000019">Vacation Rentals in Tokyo - Airbnb</A>
        <DT><A HREF="https://speedtest.net/" ADD_DATE="1690000020">Speedtest by Ookla - The Global Broadband Speed Test</A>
        <DT><A HREF="https://huggingface.co/models" ADD_DATE="1690000021">Hugging Face – The AI Community building the future</A>
        <DT><A HREF="https://lucide.dev/icons" ADD_DATE="1690000022">Lucide Icons - Beautiful &amp; consistent icons</A>
        <DT><A HREF="https://unsplash.com/t/wallpapers" ADD_DATE="1690000023">HD Wallpapers &amp; Backgrounds | Unsplash</A>
        <DT><A HREF="https://nextjs.org/docs/app" ADD_DATE="1690000024">Building Your Application: Routing | Next.js</A>
        <DT><A HREF="https://nodejs.org/api/fs.html" ADD_DATE="1690000025">File system | Node.js v20.x Documentation</A>
        <DT><A HREF="https://supabase.com/dashboard" ADD_DATE="1690000026">Supabase | The Open Source Firebase Alternative</A>
        <DT><A HREF="https://vercel.com/dashboard" ADD_DATE="1690000027">Vercel: Build and deploy the best web experiences</A>
        <DT><A HREF="https://cloudflare.com/" ADD_DATE="1690000028">Cloudflare - The Web Performance &amp; Security Company</A>
        <DT><A HREF="https://stackoverflow.com/questions/11227809" ADD_DATE="1690000029">Why is processing a sorted array faster than unsorted? - Stack Overflow</A>
        <DT><A HREF="https://developer.mozilla.org/en-US/docs/Web/JavaScript" ADD_DATE="1690000030">JavaScript | MDN Web Docs</A>
        <DT><A HREF="https://ui.shadcn.com/docs" ADD_DATE="1690000031">shadcn/ui - Beautifully designed components</A>
        <DT><A HREF="https://framer.com/templates" ADD_DATE="1690000032">Framer Templates – Launch your website in minutes</A>
        <DT><A HREF="https://tradingview.com/chart/" ADD_DATE="1690000033">Interactive Financial Charts - TradingView</A>
        <DT><A HREF="https://coinbase.com/explore" ADD_DATE="1690000034">Crypto Prices, Charts and Market Cap | Coinbase</A>
        <DT><A HREF="https://coursera.org/learn/machine-learning" ADD_DATE="1690000035">Supervised Machine Learning: Regression and Classification - Coursera</A>
        <DT><A HREF="https://arxiv.org/abs/1706.03762" ADD_DATE="1690000036">[1706.03762] Attention Is All You Need</A>
        <DT><A HREF="https://steampowered.com/" ADD_DATE="1690000037">Welcome to Steam</A>
        <DT><A HREF="https://twitch.tv/directory" ADD_DATE="1690000038">Browse Categories - Twitch</A>
        <DT><A HREF="https://tiny-png.com/" ADD_DATE="1690000039">TinyPNG – Smart WebP, PNG and JPEG Compression</A>
        <DT><A HREF="https://regex101.com/" ADD_DATE="1690000040">regex101: build, test, and debug regex</A>
        <DT><A HREF="https://github.com/trending?since=daily" ADD_DATE="1690000041">Trending Repositories - GitHub (DUPLICATE)</A>
        <DT><A HREF="https://chatgpt.com/" ADD_DATE="1690000042">ChatGPT (DUPLICATE)</A>
        <DT><A HREF="https://www.nytimes.com/section/technology" ADD_DATE="1690000043">Technology News - The New York Times</A>
        <DT><A HREF="https://wired.com/category/gear/" ADD_DATE="1690000044">Gear Reviews &amp; Tech Guides | WIRED</A>
        <DT><A HREF="https://ebay.com/deals" ADD_DATE="1690000045">Daily Deals on Electronics &amp; More | eBay</A>
        <DT><A HREF="https://booking.com/city/fr/paris.html" ADD_DATE="1690000046">The 10 Best Hotels in Paris, France | Booking.com</A>
        <DT><A HREF="https://maps.google.com/" ADD_DATE="1690000047">Google Maps</A>
        <DT><A HREF="https://trello.com/b/roadmap" ADD_DATE="1690000048">Product Roadmap Board | Trello</A>
        <DT><A HREF="https://slack.com/" ADD_DATE="1690000049">Slack is your productivity platform | Slack</A>
        <DT><A HREF="https://docs.google.com/document/u/0/" ADD_DATE="1690000050">Google Docs - Online Document Editor</A>
        <DT><A HREF="https://drive.google.com/drive/my-drive" ADD_DATE="1690000051">Google Drive: Sign-in / My Drive</A>
        <DT><A HREF="https://postgresql.org/docs/current/" ADD_DATE="1690000052">PostgreSQL: Documentation: 16: PostgreSQL 16 Documentation</A>
    </DL><p>
</DL><p>`,
  },
  {
    id: "sample_tech_dev",
    name: "Developer & Tech Stash (25 items)",
    description: "Programming languages, cloud providers, database systems, and AI models.",
    itemCount: 25,
    rawHtml: `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1700000000" LAST_MODIFIED="1700000000" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks bar</H3>
    <DL><p>
        <DT><A HREF="https://github.com/facebook/react" ADD_DATE="1700000001">GitHub - facebook/react: The library for web and native user interfaces</A>
        <DT><A HREF="https://typescriptlang.org/docs/" ADD_DATE="1700000002">Documentation - TypeScript</A>
        <DT><A HREF="https://tailwindcss.com/" ADD_DATE="1700000003">Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.</A>
        <DT><A HREF="https://vitejs.dev/guide/" ADD_DATE="1700000004">Getting Started | Vite</A>
        <DT><A HREF="https://nodejs.org/en/docs" ADD_DATE="1700000005">Node.js Documentation</A>
        <DT><A HREF="https://expressjs.com/" ADD_DATE="1700000006">Express - Node.js web application framework</A>
        <DT><A HREF="https://www.postgresql.org/" ADD_DATE="1700000007">PostgreSQL: The World's Most Advanced Open Source Relational Database</A>
        <DT><A HREF="https://redis.io/docs/" ADD_DATE="1700000008">Redis documentation</A>
        <DT><A HREF="https://aws.amazon.com/console/" ADD_DATE="1700000009">AWS Management Console</A>
        <DT><A HREF="https://cloud.google.com/" ADD_DATE="1700000010">Cloud Computing Services | Google Cloud</A>
        <DT><A HREF="https://vercel.com/" ADD_DATE="1700000011">Vercel: Build and deploy the best web experiences</A>
        <DT><A HREF="https://cloudflare.com/" ADD_DATE="1700000012">Cloudflare</A>
        <DT><A HREF="https://docker.com/" ADD_DATE="1700000013">Docker: Accelerated Container Application Development</A>
        <DT><A HREF="https://kubernetes.io/" ADD_DATE="1700000014">Kubernetes - Production-Grade Container Orchestration</A>
        <DT><A HREF="https://openai.com/api/" ADD_DATE="1700000015">OpenAI API</A>
        <DT><A HREF="https://huggingface.co/" ADD_DATE="1700000016">Hugging Face – The AI Community building the future</A>
        <DT><A HREF="https://anthropic.com/" ADD_DATE="1700000017">Anthropic Claude</A>
        <DT><A HREF="https://developer.mozilla.org/en-US/" ADD_DATE="1700000018">MDN Web Docs</A>
        <DT><A HREF="https://caniuse.com/" ADD_DATE="1700000019">Can I use... Support tables for HTML5, CSS3, etc</A>
        <DT><A HREF="https://news.ycombinator.com/" ADD_DATE="1700000020">Hacker News</A>
        <DT><A HREF="https://github.com/trending" ADD_DATE="1700000021">Trending Repositories on GitHub</A>
        <DT><A HREF="https://lucide.dev/" ADD_DATE="1700000022">Lucide Icons</A>
        <DT><A HREF="https://drizzle.team/" ADD_DATE="1700000023">Drizzle ORM</A>
        <DT><A HREF="https://prisma.io/" ADD_DATE="1700000024">Prisma - Next-generation ORM for Node.js &amp; TypeScript</A>
        <DT><A HREF="https://postman.com/" ADD_DATE="1700000025">Postman API Platform</A>
    </DL><p>
</DL><p>`,
  },
];
