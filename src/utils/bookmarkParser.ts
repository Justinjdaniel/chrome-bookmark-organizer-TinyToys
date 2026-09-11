import { BookmarkFolder, BookmarkItem, ParseResult } from "../types/bookmark";

export function parseBookmarkHTML(htmlString: string): ParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const flatBookmarks: BookmarkItem[] = [];
  let originalFolderCount = 0;
  let counter = 0;

  function extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "other";
    }
  }

  function walkElement(element: Element, currentPath: string[]): (BookmarkFolder | BookmarkItem)[] {
    const results: (BookmarkFolder | BookmarkItem)[] = [];
    const children = Array.from(element.children);

    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const tagName = el.tagName.toUpperCase();

      if (tagName === "DT") {
        const h3 = el.querySelector(":scope > H3, :scope > h3");
        const a = el.querySelector(":scope > A, :scope > a");
        const dl =
          el.querySelector(":scope > DL, :scope > dl") ||
          (el.nextElementSibling?.tagName === "DL" ? el.nextElementSibling : null);

        if (h3) {
          originalFolderCount++;
          const folderTitle = h3.textContent?.trim() || "Untitled Folder";
          const addDate =
            h3.getAttribute("ADD_DATE") ||
            h3.getAttribute("add_date") ||
            String(Math.floor(Date.now() / 1000));
          const lastModified =
            h3.getAttribute("LAST_MODIFIED") || h3.getAttribute("last_modified") || addDate;
          const isToolbar =
            h3.getAttribute("PERSONAL_TOOLBAR_FOLDER") === "true" ||
            folderTitle.toLowerCase().includes("bookmarks bar");

          const folderId = `folder_${++counter}`;
          const newPath = [...currentPath, folderTitle];

          let folderChildren: (BookmarkFolder | BookmarkItem)[] = [];
          if (dl) {
            folderChildren = walkElement(dl, newPath);
          }

          results.push({
            id: folderId,
            title: folderTitle,
            addDate,
            lastModified,
            isToolbar,
            children: folderChildren,
          });
        } else if (a) {
          const href = a.getAttribute("HREF") || a.getAttribute("href") || "";
          if (href && !href.startsWith("javascript:") && !href.startsWith("data:")) {
            const title = a.textContent?.trim() || href;
            const addDate =
              a.getAttribute("ADD_DATE") ||
              a.getAttribute("add_date") ||
              String(Math.floor(Date.now() / 1000));
            const icon = a.getAttribute("ICON") || a.getAttribute("icon") || undefined;
            const domain = extractDomain(href);
            const id = `bm_${++counter}`;

            const item: BookmarkItem = {
              id,
              title,
              url: href,
              addDate,
              icon,
              originalFolder: currentPath.join(" / ") || "Root",
              category: "Uncategorized",
              domain,
            };

            flatBookmarks.push(item);
            results.push(item);
          }
        }
      } else if (tagName === "DL") {
        results.push(...walkElement(el, currentPath));
      } else if (tagName === "P") {
        // Skip or continue
      }
    }

    return results;
  }

  const rootDL = doc.querySelector("DL, dl") || doc.body;
  const parsedChildren = walkElement(rootDL, []);

  // Check if we extracted any bookmarks; if DOMParser had trouble due to unclosed Netscape tags, fallback to regex
  if (flatBookmarks.length === 0) {
    return parseViaRegex(htmlString);
  }

  const rootFolder: BookmarkFolder = {
    id: "root",
    title: "Bookmarks",
    children: parsedChildren,
  };

  return {
    rootFolder,
    flatBookmarks,
    originalFolderCount,
    hasToolbar: parsedChildren.some((c) => "isToolbar" in c && c.isToolbar),
  };
}

export function parseViaRegex(content: string): ParseResult {
  const flatBookmarks: BookmarkItem[] = [];
  let counter = 0;

  function extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "other";
    }
  }

  // Find all <A HREF="...">Title</A> tags
  const regex = /<A\s+[^>]*HREF=["']([^"']+)["'][^>]*>(.*?)<\/A>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const url = match[1];
    let title = match[2].replace(/<[^>]*>/g, "").trim();
    if (!title) title = url;

    // Check for ADD_DATE & ICON in full tag
    const fullTag = match[0];
    const addDateMatch = /ADD_DATE=["'](\d+)["']/i.exec(fullTag);
    const iconMatch = /ICON=["']([^"']+)["']/i.exec(fullTag);

    const item: BookmarkItem = {
      id: `bm_rx_${++counter}`,
      title,
      url,
      addDate: addDateMatch ? addDateMatch[1] : String(Math.floor(Date.now() / 1000)),
      icon: iconMatch ? iconMatch[1] : undefined,
      category: "Uncategorized",
      domain: extractDomain(url),
      originalFolder: "Imported Bookmarks",
    };

    flatBookmarks.push(item);
  }

  // Also check plain URLs if pasted raw text
  if (flatBookmarks.length === 0) {
    const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
    let urlMatch: RegExpExecArray | null;
    const seen = new Set<string>();

    while ((urlMatch = urlRegex.exec(content)) !== null) {
      const rawUrl = urlMatch[1];
      if (!seen.has(rawUrl)) {
        seen.add(rawUrl);
        const domain = extractDomain(rawUrl);
        flatBookmarks.push({
          id: `bm_txt_${++counter}`,
          title: domain.charAt(0).toUpperCase() + domain.slice(1),
          url: rawUrl,
          addDate: String(Math.floor(Date.now() / 1000)),
          category: "Uncategorized",
          domain,
          originalFolder: "Imported URLs",
        });
      }
    }
  }

  const rootFolder: BookmarkFolder = {
    id: "root",
    title: "Bookmarks",
    children: flatBookmarks,
  };

  return {
    rootFolder,
    flatBookmarks,
    originalFolderCount: 1,
    hasToolbar: false,
  };
}
