import React, { useState, useMemo } from "react";
import { Search, ExternalLink, Trash2, Edit3, Check, X, Filter, Tag } from "lucide-react";
import { BookmarkItem } from "../types/bookmark";

interface BookmarkListViewProps {
  bookmarks: BookmarkItem[];
  availableCategories: string[];
  onUpdateBookmark: (updated: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
  onBulkMoveCategory: (ids: string[], newCategory: string) => void;
  onBulkDelete: (ids: string[]) => void;
  selectedCategoryFilter?: string;
  onClearCategoryFilter?: () => void;
}

export const BookmarkListView: React.FC<BookmarkListViewProps> = ({
  bookmarks,
  availableCategories,
  onUpdateBookmark,
  onDeleteBookmark,
  onBulkMoveCategory,
  onBulkDelete,
  selectedCategoryFilter,
  onClearCategoryFilter,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategoryFilter || "ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState("");

  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setCategoryFilter(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bm) => {
      if (categoryFilter !== "ALL" && bm.category !== categoryFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = bm.title.toLowerCase().includes(q);
        const matchesUrl = bm.url.toLowerCase().includes(q);
        const matchesDomain = bm.domain.toLowerCase().includes(q);
        const matchesCat = bm.category.toLowerCase().includes(q);
        return matchesTitle || matchesUrl || matchesDomain || matchesCat;
      }
      return true;
    });
  }, [bookmarks, categoryFilter, search]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookmarks.map((b) => b.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const startEditing = (bm: BookmarkItem) => {
    setEditingId(bm.id);
    setEditTitle(bm.title);
    setEditCategory(bm.category);
  };

  const saveEditing = (bm: BookmarkItem) => {
    onUpdateBookmark({
      ...bm,
      title: editTitle.trim() || bm.title,
      category: editCategory || bm.category,
    });
    setEditingId(null);
  };

  const handleBulkMove = () => {
    if (!bulkCategoryTarget || selectedIds.size === 0) return;
    onBulkMoveCategory(Array.from(selectedIds), bulkCategoryTarget);
    setSelectedIds(new Set());
    setBulkCategoryTarget("");
  };

  const handleBulkDeleteAction = () => {
    if (selectedIds.size === 0) return;
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="border border-white/10 bg-[#161619] overflow-hidden font-mono">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-white/10 bg-[#111113] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, URL, domain or tags..."
              className="w-full border border-white/10 bg-[#0C0C0D] pl-9 pr-3 py-2 text-xs text-[#F8F7F4] placeholder-white/30 focus:border-[#FF4D00] outline-none"
            />
          </div>

          {/* Category Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[#FF4D00] shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                if (e.target.value === "ALL" && onClearCategoryFilter) {
                  onClearCategoryFilter();
                }
              }}
              className="border border-white/10 bg-[#0C0C0D] px-3 py-2 text-xs font-mono text-[#F8F7F4] outline-none focus:border-[#FF4D00]"
            >
              <option value="ALL">ALL CATEGORIES ({bookmarks.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()} ({bookmarks.filter((b) => b.category === cat).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[#FF4D00]/50 bg-[#FF4D00]/10 px-3.5 py-2 text-xs text-[#F8F7F4]">
            <div className="flex items-center gap-2 font-bold text-[#FF4D00]">
              <span>{selectedIds.size} BOOKMARKS SELECTED</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/70 uppercase">Move to:</span>
                <select
                  value={bulkCategoryTarget}
                  onChange={(e) => setBulkCategoryTarget(e.target.value)}
                  className="border border-white/20 bg-[#0C0C0D] px-2 py-1 text-xs text-[#F8F7F4] outline-none"
                >
                  <option value="">Select Category...</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkMove}
                  disabled={!bulkCategoryTarget}
                  className="bg-[#FF4D00] px-2.5 py-1 text-xs font-bold text-[#111113] hover:bg-[#FF6622] disabled:opacity-40"
                >
                  Apply
                </button>
              </div>

              <span className="text-white/20">|</span>

              <button
                type="button"
                onClick={handleBulkDeleteAction}
                className="flex items-center gap-1 border border-rose-500/60 bg-rose-950/40 text-rose-300 px-2.5 py-1 text-xs hover:bg-rose-900"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks Table */}
      <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
        <table className="w-full text-left text-xs text-white/80 border-collapse">
          <thead className="sticky top-0 bg-[#0C0C0D] text-[10px] font-bold uppercase tracking-wider text-white/50 border-b border-white/10 z-10">
            <tr>
              <th className="py-2.5 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredBookmarks.length > 0 && selectedIds.size === filteredBookmarks.length
                  }
                  onChange={toggleSelectAll}
                  className="accent-[#FF4D00] cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3">Title &amp; Destination URL</th>
              <th className="py-2.5 px-3 w-48">Category</th>
              <th className="py-2.5 px-3 w-36">Domain</th>
              <th className="py-2.5 px-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredBookmarks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/40 uppercase">
                  No bookmarks matching your criteria.
                </td>
              </tr>
            ) : (
              filteredBookmarks.map((bm) => {
                const isSelected = selectedIds.has(bm.id);
                const isEditing = editingId === bm.id;

                return (
                  <tr
                    key={bm.id}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      isSelected ? "bg-[#FF4D00]/10" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(bm.id)}
                        className="accent-[#FF4D00] cursor-pointer"
                      />
                    </td>

                    {/* Title and URL Column */}
                    <td className="py-3 px-3 min-w-[280px]">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full border border-[#FF4D00] bg-[#0C0C0D] px-2 py-1 text-xs text-[#F8F7F4] outline-none"
                          />
                          <p className="text-[10px] text-white/40 truncate">{bm.url}</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {bm.icon && (
                              <img
                                src={bm.icon}
                                alt=""
                                className="h-3.5 w-3.5 shrink-0 rounded-xs"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            )}
                            <span className="font-bold text-[#F8F7F4] line-clamp-1">
                              {bm.title}
                            </span>
                            {bm.isDuplicate && (
                              <span className="border border-amber-500/40 bg-amber-500/10 text-amber-300 px-1.5 py-0.2 text-[9px] font-bold">
                                DUPLICATE
                              </span>
                            )}
                          </div>
                          <a
                            href={bm.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-[10px] text-white/50 hover:text-[#FF4D00] truncate block max-w-lg transition-colors"
                          >
                            {bm.url}
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Category Column */}
                    <td className="py-3 px-3">
                      {isEditing ? (
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full border border-[#FF4D00] bg-[#0C0C0D] px-2 py-1 text-xs text-[#F8F7F4] outline-none"
                        >
                          {availableCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 border border-white/10 bg-[#111113] px-2 py-0.5 text-[11px] text-[#F8F7F4]">
                          <Tag className="h-3 w-3 text-[#FF4D00]" />
                          <span className="truncate">{bm.category}</span>
                        </span>
                      )}
                    </td>

                    {/* Domain */}
                    <td className="py-3 px-3 text-white/50 text-[11px] truncate">{bm.domain}</td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => saveEditing(bm)}
                            className="p-1 text-[#FF4D00] hover:bg-white/10"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-white/40 hover:text-white"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={bm.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="p-1 text-white/40 hover:text-[#FF4D00]"
                            title="Open Link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => startEditing(bm)}
                            className="p-1 text-white/40 hover:text-white"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteBookmark(bm.id)}
                            className="p-1 text-white/40 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 bg-[#111113] flex items-center justify-between text-[10px] text-white/40 uppercase font-mono">
        <span>
          Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
        </span>
        {selectedCategoryFilter && (
          <button
            type="button"
            onClick={onClearCategoryFilter}
            className="text-[#FF4D00] hover:underline font-bold"
          >
            [Clear filter: {selectedCategoryFilter}]
          </button>
        )}
      </div>
    </div>
  );
};
