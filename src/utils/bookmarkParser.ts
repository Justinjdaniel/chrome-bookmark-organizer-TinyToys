export interface BookmarkItem {
  type: 'bookmark';
  title: string;
  url: string;
  addDate?: string;
  lastModified?: string;
  icon?: string;
}

export interface FolderItem {
  type: 'folder';
  title: string;
  addDate?: string;
  lastModified?: string;
  children: (BookmarkItem | FolderItem)[];
}

export type BookmarkNode = BookmarkItem | FolderItem;

/**
 * Parses Chrome Netscape format bookmarks.html on the client side.
 * Relies on browser's DOMParser to inspect elements and structure.
 */
export function parseBookmarksHtml(htmlContent: string): FolderItem {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Root node to accumulate all items
  const root: FolderItem = {
    type: 'folder',
    title: 'root',
    children: [],
  };

  // Find first DL element, which contains the top-level bookmarks list
  const firstDl = doc.querySelector('dl');
  if (firstDl) {
    parseDl(firstDl, root.children);
  } else {
    // Fallback: search anywhere in the document
    const body = doc.body;
    if (body) {
      parseDl(body, root.children);
    }
  }

  return root;
}

function parseDl(dlElement: Element, childrenList: BookmarkNode[]) {
  // Children are generally DT elements within DL
  const children = Array.from(dlElement.children);

  for (const child of children) {
    if (child.tagName.toLowerCase() === 'dt') {
      // Check if it's a folder or a bookmark
      // A folder usually contains an H3 element followed by a DL element
      const h3 = child.querySelector(':scope > h3');
      const dl = child.querySelector(':scope > dl');
      const a = child.querySelector(':scope > a');

      if (h3) {
        const folder: FolderItem = {
          type: 'folder',
          title: h3.textContent || 'Untitled Folder',
          addDate: h3.getAttribute('add_date') || undefined,
          lastModified: h3.getAttribute('last_modified') || undefined,
          children: [],
        };
        childrenList.push(folder);

        if (dl) {
          parseDl(dl, folder.children);
        } else {
          // Sometimes the DL is a sibling of the DT or next sibling
          const nextSibling = child.nextElementSibling;
          if (nextSibling && nextSibling.tagName.toLowerCase() === 'dl') {
            parseDl(nextSibling, folder.children);
          }
        }
      } else if (a) {
        const bookmark: BookmarkItem = {
          type: 'bookmark',
          title: a.textContent || 'Untitled Bookmark',
          url: a.getAttribute('href') || '',
          addDate: a.getAttribute('add_date') || undefined,
          lastModified: a.getAttribute('last_modified') || undefined,
          icon: a.getAttribute('icon') || undefined,
        };
        childrenList.push(bookmark);
      }
    } else if (child.tagName.toLowerCase() === 'dl') {
      // In some weird structures, DL elements can be direct children
      parseDl(child, childrenList);
    }
  }
}

/**
 * Re-assembles a structured FolderItem tree into valid Netscape bookmarks.html.
 * Keeps all timestamps and icons if present.
 */
export function exportToNetscapeHtml(root: FolderItem): string {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
`;

  html += renderFolderContents(root, 1, true);
  return html;
}

function renderFolderContents(
  folder: FolderItem,
  depth: number,
  isRoot: boolean = false
): string {
  const indent = '    '.repeat(depth);
  const dlIndent = '    '.repeat(depth - 1);
  let html = '';

  if (!isRoot) {
    const addDateAttr = folder.addDate
      ? ` ADD_DATE="${escapeHtml(folder.addDate)}"`
      : '';
    const lastModAttr = folder.lastModified
      ? ` LAST_MODIFIED="${escapeHtml(folder.lastModified)}"`
      : '';
    html += `${dlIndent}<DT><H3${addDateAttr}${lastModAttr}>${escapeHtml(folder.title)}</H3>\n`;
  }

  html += `${dlIndent}<DL><p>\n`;

  for (const child of folder.children) {
    if (child.type === 'folder') {
      html += renderFolderContents(child, depth + 1, false);
    } else {
      const addDateAttr = child.addDate
        ? ` ADD_DATE="${escapeHtml(child.addDate)}"`
        : '';
      const lastModAttr = child.lastModified
        ? ` LAST_MODIFIED="${escapeHtml(child.lastModified)}"`
        : '';
      const iconAttr = child.icon ? ` ICON="${escapeHtml(child.icon)}"` : '';
      html += `${indent}<DT><A HREF="${escapeHtml(child.url)}"${addDateAttr}${lastModAttr}${iconAttr}>${escapeHtml(child.title)}</A>\n`;
    }
  }

  html += `${dlIndent}</DL><p>\n`;
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extracts a flat list of bookmarks from any FolderItem tree structure.
 */
export function flattenBookmarks(node: BookmarkNode): BookmarkItem[] {
  if (node.type === 'bookmark') {
    return [node];
  }

  const flatList: BookmarkItem[] = [];
  for (const child of node.children) {
    flatList.push(...flattenBookmarks(child));
  }
  return flatList;
}
