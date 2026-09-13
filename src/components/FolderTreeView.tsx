import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Bookmark,
  Search,
} from "lucide-react";
import { BookmarkFolder, BookmarkItem } from "../types/bookmark";

interface FolderTreeViewProps {
  rootFolder: BookmarkFolder;
  onSelectBookmark?: (item: BookmarkItem) => void;
  onSelectFolder?: (folder: BookmarkFolder) => void;
}

export const FolderTreeView: React.FC<FolderTreeViewProps> = ({
  rootFolder,
  onSelectBookmark,
  onSelectFolder,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    bookmarks_bar: true,
    cat_1: true,
    cat_2: true,
    cat_3: true,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    function collect(node: BookmarkFolder | BookmarkItem) {
      if ("children" in node) {
        all[node.id] = true;
        node.children.forEach(collect);
      }
    }
    collect(rootFolder);
    setExpandedFolders(all);
  };

  const collapseAll = () => {
    setExpandedFolders({});
  };

  function countDescendantBookmarks(node: BookmarkFolder | BookmarkItem): number {
    if (!("children" in node)) return 1;
    return node.children.reduce((acc, c) => acc + countDescendantBookmarks(c), 0);
  }

  const renderNode = (node: BookmarkFolder | BookmarkItem, depth = 0) => {
    const isFolder = "children" in node;

    if (isFolder) {
      const folder = node as BookmarkFolder;
      const isExpanded = !!expandedFolders[folder.id];
      const count = countDescendantBookmarks(folder);

      if (searchTerm) {
        const matchesName = folder.title.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMatchingChild = folder.children.some((c) => {
          if ("children" in c) return countDescendantBookmarks(c) > 0;
          return (
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.url.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        if (!matchesName && !hasMatchingChild) return null;
      }

      return (
        <div key={folder.id} className="select-none font-mono">
          <div
            onClick={(e) => {
              toggleFolder(folder.id, e);
              onSelectFolder?.(folder);
            }}
            className={`group flex items-center justify-between py-1.5 px-2 text-xs font-medium cursor-pointer transition-colors ${
              depth === 0
                ? "bg-white/[0.04] text-[#F8F7F4] font-bold"
                : "hover:bg-white/[0.04] text-[#F8F7F4]/90"
            }`}
            style={{ paddingLeft: `${Math.max(0.5, depth * 1.1)}rem` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white/40 group-hover:text-[#FF4D00]">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>

              {isExpanded ? (
                <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#FF4D00]" />
              ) : (
                <Folder className="h-3.5 w-3.5 shrink-0 text-[#FF4D00]" />
              )}

              <span className="truncate">{folder.title}</span>
            </div>

            <span className="shrink-0 text-[10px] font-mono border border-white/10 px-1.5 py-0.2 text-white/50 bg-[#0C0C0D]">
              {count}
            </span>
          </div>

          {isExpanded && folder.children.length > 0 && (
            <div className="border-l border-white/10 ml-3 pl-1 space-y-0.5 mt-0.5">
              {folder.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const item = node as BookmarkItem;

      if (searchTerm) {
        const matches =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.url.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matches) return null;
      }

      return (
        <div
          key={item.id}
          onClick={() => onSelectBookmark?.(item)}
          className="group flex items-center justify-between py-1 px-2 text-xs text-white/70 hover:bg-[#FF4D00]/10 hover:text-[#F8F7F4] cursor-pointer transition-colors font-mono"
          style={{ paddingLeft: `${Math.max(0.5, depth * 1.1)}rem` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {item.icon ? (
              <img
                src={item.icon}
                alt=""
                className="h-3 w-3 shrink-0 rounded-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <Bookmark className="h-3 w-3 shrink-0 text-white/30 group-hover:text-[#FF4D00]" />
            )}
            <span className="truncate">{item.title}</span>
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-0.5 text-white/40 hover:text-[#FF4D00] transition-opacity"
            title="Open link"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full border border-white/10 bg-[#161619] overflow-hidden">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-white/10 bg-[#111113] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-[#FF4D00]" />
            <h4 className="text-xs font-bold text-[#F8F7F4] uppercase font-['Syne'] tracking-wider">
              Hierarchy Tree Preview
            </h4>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <button
              type="button"
              onClick={expandAll}
              className="text-white/60 hover:text-[#FF4D00] uppercase"
            >
              [Expand All]
            </button>
            <span className="text-white/20">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-white/60 hover:text-[#FF4D00] uppercase"
            >
              [Collapse]
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search folders or links..."
            className="w-full border border-white/10 bg-[#0C0C0D] pl-8 pr-3 py-1.5 text-xs font-mono text-[#F8F7F4] placeholder-white/30 focus:border-[#FF4D00] outline-none"
          />
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="flex-1 p-3 overflow-y-auto max-h-[500px] space-y-0.5 text-white/80">
        {renderNode(rootFolder)}
      </div>
    </div>
  );
};
