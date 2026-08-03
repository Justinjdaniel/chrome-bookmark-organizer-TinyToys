# AI Chrome Bookmark Organizer

An elegant, modern, and highly secure **Bring Your Own Key (BYOK)** single-page web application built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **Lucide React**. It allows you to parse, customize, sequentially categorize, and re-export cluttered Google Chrome `bookmarks.html` files directly from your client browser using Google's **Gemini API**.

---

## 🚀 Key Features

- **Secure Bring Your Own Key (BYOK) Architecture:** Your Gemini API Key is entered through a secure client interface and persisted strictly in browser `sessionStorage`. The app sends requests directly from your browser to Google's Gemini API; it does not proxy or persist the key on its own server.
- **Modern Desktop Netscape Parser:** Reads Chrome-compliant `bookmarks.html` structures directly on the client, preserving original metadata such as `ADD_DATE`, `LAST_MODIFIED`, and base64 favicon `ICON` attributes.
- **Full AI Reorganization:** Choose to flatten and let Gemini group all your bookmarks into a clean, newly-structured folder set from scratch.
- **Preserve & Sub-Categorize:** Retain your existing top-level folders, but let Gemini organize and group bookmarks cleanly _inside_ those existing structures.
- **Dynamic Categories Customization:** Add, edit, or delete target categories directly from the web interface prior to starting the sorting job.
- **Sequential Batch Processing:** Chunks URLs into batches (configurable 5–50, default: 25), processing them sequentially with configurable delays (500–10000 ms, default: 2500 ms). Gemini RPM limits are project and model-specific; adjust delay to fit your quota.
- **Interactive Terminal Logs & Retry:** Watch real-time execution progress, complete with visual progress bars, estimated times remaining, and an inline manual "Retry Batch" mechanism for failed requests.
- **One-Click Netscape Export:** Rebuilds your organized structure into a fully standard Netscape format `bookmarks_sorted.html` file, ready to be imported back into Chrome or Firefox.

---

## 🔒 Security Guarantees (BYOK)

Your privacy and security are our highest priority:

1. **Direct Browser Calling:** The application initializes `@google/generative-ai` directly in your browser. Gemini requests and the key are sent directly from the browser to Google's Gemini API at `https://generativelanguage.googleapis.com`.
2. **`sessionStorage` Persistence:** Your API Key is stored inside the browser's `sessionStorage`. Closing your tab or browser window immediately and completely destroys the key from memory.
3. **Static Build:** Next.js compiles into pure client-side HTML, CSS, and JS assets. No server-side storage, analytics, or background databases exist.

---

## 🧠 AI Parsing Workflow

```
[ Upload bookmarks.html ]
           │
           ▼
[ Parse Netscape HTML into structured JSON (Preserving Dates & Icons) ]
           │
           ▼
[ Chunk bookmarks into batches of 25-30 ]
           │
           ▼
[ Sequential Requests with ~2.5s Delay to Google's Generative AI ]
           │
           ▼
[ Structured JSON array schema response parsing & dynamic validation ]
           │
           ▼
[ Re-assemble JSON into designated folder structure modes ]
           │
           ▼
[ Re-export to compliant Netscape bookmarks_sorted.html ]
```

---

## 🛠️ Local Development Setup

To run this application locally, you will need **Node.js** (v22+) and **pnpm** (v10+).

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Justinjdaniel/chrome-bookmark-organizer-TinyToys.git
   cd chrome-bookmark-organizer-TinyToys
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Start the development server:**

   ```bash
   pnpm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment Instructions

### Deploying to Render (Static Web Service)

Since this is a static client-side application, you can deploy it as a Render **Static Site**:

1. Connect your GitHub repository to [Render](https://dashboard.render.com).
2. Select **Static Site** as the service type.
3. Use the following configuration (Render reads the included `render.yaml` automatically):
   - **Build Command:** `pnpm run build`
   - **Publish Directory:** `out`
4. Deploy! Your app will be live on a global CDN.

### Deploying to GitHub Pages

1. Install GitHub Pages utility: `pnpm add -D gh-pages`
2. Update `next.config.mjs` if you are hosting under a subpath (e.g., `basePath: '/repo-name'`).
3. Add a deploy script to `package.json`: `"deploy": "gh-pages -d out"`.
4. Run `pnpm run build && pnpm run deploy`.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
