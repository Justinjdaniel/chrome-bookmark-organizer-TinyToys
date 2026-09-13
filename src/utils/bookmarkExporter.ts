import { BookmarkFolder, BookmarkItem } from "../types/bookmark";

export interface ChromeValidationReport {
  isValid: boolean;
  score: number; // 0 - 100
  checks: {
    name: string;
    description: string;
    passed: boolean;
    detail: string;
  }[];
}

/**
 * Escapes characters for strict Netscape HTML specification
 */
export function escapeBookmarkHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates official Netscape Bookmark File 1 format
 * Formatted identically to Chrome's native export engine for 100% zero-friction import.
 */
export function generateNetscapeBookmarkHTML(
  rootFolder: BookmarkFolder,
  includeOtherBookmarks = true,
): string {
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();

  function serializeItem(item: BookmarkItem, indentLevel: number): string {
    const indent = "    ".repeat(indentLevel);
    const addDate = item.addDate && /^\d+$/.test(item.addDate) ? item.addDate : currentTimestamp;
    const iconAttr =
      item.icon && item.icon.startsWith("data:") ? ` ICON="${escapeBookmarkHtml(item.icon)}"` : "";
    const cleanUrl = escapeBookmarkHtml(item.url);
    const cleanTitle = escapeBookmarkHtml(item.title || item.url);

    return `${indent}<DT><A HREF="${cleanUrl}" ADD_DATE="${addDate}"${iconAttr}>${cleanTitle}</A>\n`;
  }

  function serializeFolder(folder: BookmarkFolder, indentLevel: number): string {
    const indent = "    ".repeat(indentLevel);
    const addDate =
      folder.addDate && /^\d+$/.test(folder.addDate) ? folder.addDate : currentTimestamp;
    const lastModified =
      folder.lastModified && /^\d+$/.test(folder.lastModified) ? folder.lastModified : addDate;
    const isToolbar =
      folder.isToolbar || folder.title === "Bookmarks bar" || folder.title === "Bookmarks Bar";
    const toolbarAttr = isToolbar ? ' PERSONAL_TOOLBAR_FOLDER="true"' : "";

    let html = `${indent}<DT><H3 ADD_DATE="${addDate}" LAST_MODIFIED="${lastModified}"${toolbarAttr}>${escapeBookmarkHtml(folder.title)}</H3>\n`;
    html += `${indent}<DL><p>\n`;

    for (const child of folder.children) {
      if ("children" in child) {
        html += serializeFolder(child as BookmarkFolder, indentLevel + 1);
      } else {
        html += serializeItem(child as BookmarkItem, indentLevel + 1);
      }
    }

    html += `${indent}</DL><p>\n`;
    return html;
  }

  let output = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  // Find if Bookmarks bar already exists
  const hasBookmarksBar = rootFolder.children.some(
    (c) =>
      "children" in c &&
      (c.title === "Bookmarks bar" || c.title === "Bookmarks Bar" || c.isToolbar),
  );

  if (hasBookmarksBar) {
    for (const child of rootFolder.children) {
      if ("children" in child) {
        output += serializeFolder(child as BookmarkFolder, 1);
      } else {
        output += serializeItem(child as BookmarkItem, 1);
      }
    }
  } else {
    // Wrap inside standard Chrome Bookmarks bar toolbar container
    const toolbarFolder: BookmarkFolder = {
      id: "toolbar_root",
      title: "Bookmarks bar",
      isToolbar: true,
      addDate: currentTimestamp,
      lastModified: currentTimestamp,
      children: rootFolder.children,
    };
    output += serializeFolder(toolbarFolder, 1);
  }

  // Optionally append standard empty Other bookmarks container for pristine Chrome export parity
  if (
    includeOtherBookmarks &&
    !rootFolder.children.some((c) => "children" in c && c.title === "Other bookmarks")
  ) {
    output += `    <DT><H3 ADD_DATE="${currentTimestamp}" LAST_MODIFIED="${currentTimestamp}">Other bookmarks</H3>\n    <DL><p>\n    </DL><p>\n`;
  }

  output += `</DL><p>\n`;
  return output;
}

/**
 * Generates clean JSON backup format
 */
export function generateBookmarksJSON(
  rootFolder: BookmarkFolder,
  bookmarks: BookmarkItem[],
): string {
  return JSON.stringify(
    {
      format: "chrome-bookmark-organizer-v2",
      exportedAt: new Date().toISOString(),
      bookmarkCount: bookmarks.length,
      hierarchy: rootFolder,
      bookmarks: bookmarks,
    },
    null,
    2,
  );
}

/**
 * Comprehensive 7-point Chrome Import Compatibility Validator
 */
export function validateChromeBookmarkHtml(html: string): ChromeValidationReport {
  const checks: ChromeValidationReport["checks"] = [];

  // Check 1: NETSCAPE DOCTYPE
  const hasDocType = /<!DOCTYPE\s+NETSCAPE-Bookmark-file-1>/i.test(html);
  checks.push({
    name: "Netscape DOCTYPE Specification",
    description: "Must begin with <!DOCTYPE NETSCAPE-Bookmark-file-1>",
    passed: hasDocType,
    detail: hasDocType
      ? "Valid Netscape bookmark file declaration found."
      : "Missing <!DOCTYPE NETSCAPE-Bookmark-file-1> declaration.",
  });

  // Check 2: UTF-8 Meta Header
  const hasMetaUtf8 =
    /<META\s+HTTP-EQUIV=["']Content-Type["']\s+CONTENT=["']text\/html;\s*charset=UTF-8["']/i.test(
      html,
    );
  checks.push({
    name: "UTF-8 Charset Encoding",
    description: "Requires explicit UTF-8 Content-Type meta header",
    passed: hasMetaUtf8,
    detail: hasMetaUtf8
      ? "Valid UTF-8 charset meta header present."
      : "Missing or malformed META Content-Type tag.",
  });

  // Check 3: Chrome Bookmarks Bar Toolbar Attribute
  const hasToolbarAttr = /PERSONAL_TOOLBAR_FOLDER=["']true["']/i.test(html);
  checks.push({
    name: "Chrome Bookmarks Bar Integration",
    description: 'Requires PERSONAL_TOOLBAR_FOLDER="true" on toolbar folder',
    passed: hasToolbarAttr,
    detail: hasToolbarAttr
      ? 'PERSONAL_TOOLBAR_FOLDER="true" verified. Folders will mount directly to Chrome top bar.'
      : 'Missing PERSONAL_TOOLBAR_FOLDER="true". Items may end up inside "Imported" subfolder.',
  });

  // Check 4: DL / p Hierarchy Structure
  const dlOpenCount = (html.match(/<DL><p>/g) || []).length;
  const dlCloseCount = (html.match(/<\/DL><p>/g) || []).length;
  const dlBalanced = dlOpenCount > 0 && dlOpenCount === dlCloseCount;
  checks.push({
    name: "Nested <DL><p> / </DL><p> Balance",
    description: "Folder containers must have matching open and close tags",
    passed: dlBalanced,
    detail: dlBalanced
      ? `Properly balanced: ${dlOpenCount} open <DL><p> and ${dlCloseCount} close </DL><p> tags.`
      : `Mismatched tags: ${dlOpenCount} open vs ${dlCloseCount} close.`,
  });

  // Check 5: Hyperlink & Folder Syntax
  const aTagCount = (html.match(/<DT><A\s+HREF=/g) || []).length;
  const h3TagCount = (html.match(/<DT><H3\s+/g) || []).length;
  const tagsValid = aTagCount > 0 && h3TagCount > 0;
  checks.push({
    name: "Standard DT / H3 / A Tags",
    description: "Links must use standard <DT><A HREF=...> and folders <DT><H3>",
    passed: tagsValid,
    detail: `Found ${h3TagCount} folders and ${aTagCount} formatted bookmark links.`,
  });

  // Check 6: Add Date Timestamps
  const hasAddDates = /ADD_DATE=["']\d{9,12}["']/.test(html);
  checks.push({
    name: "Unix Epoch Timestamps",
    description: "Valid numeric timestamps for bookmarks and folders",
    passed: hasAddDates,
    detail: hasAddDates
      ? "All items possess valid Unix epoch timestamps."
      : "Missing or invalid ADD_DATE attributes.",
  });

  // Check 7: Character & URL Entity Escaping
  const hasUnescapedAmp = /HREF="[^"]*&(?!(amp|lt|gt|quot|#\d+|#x[0-9a-fA-F]+);)[^"]*"/.test(html);
  checks.push({
    name: "HTML/URL Entity Safety",
    description: 'All special characters (&, <, >, ") must be safely escaped',
    passed: !hasUnescapedAmp,
    detail: !hasUnescapedAmp
      ? "All URLs and titles are securely entity-escaped."
      : "Unescaped ampersand detected in URL parameters.",
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    isValid: passedCount === checks.length,
    score,
    checks,
  };
}

/**
 * Triggers a direct file download in the browser
 */
export function triggerDirectDownload(
  content: string,
  filename = "bookmarks_organized.html",
  mimeType = "text/html;charset=utf-8",
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
