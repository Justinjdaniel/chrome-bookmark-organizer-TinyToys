import React from "react";
import { CheckCircle2, AlertCircle, Sparkles, Folder, Bookmark } from "lucide-react";
import { BookmarkFolder, BookmarkItem } from "../types/bookmark";

interface StructureComparisonViewProps {
  originalBookmarks: BookmarkItem[];
  organizedTree: BookmarkFolder;
  duplicatesCount: number;
}

export const StructureComparisonView: React.FC<StructureComparisonViewProps> = ({
  originalBookmarks,
  organizedTree,
  duplicatesCount,
}) => {
  return (
    <div className="space-y-4 font-mono">
      <div className="border border-white/10 bg-[#161619] p-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#F8F7F4] uppercase font-['Syne'] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FF4D00]" />
            Structural Transformation: Before vs. After
          </h4>
          <p className="text-xs text-white/50 mt-0.5">
            Compare raw unorganized bookmarks with the structured Chrome hierarchy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BEFORE CONTAINER */}
        <div className="border border-rose-500/30 bg-rose-950/10 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-['Syne']">
                Original Structure (Unorganized)
              </h5>
            </div>
            <span className="text-[10px] font-mono text-rose-300 border border-rose-500/30 bg-rose-950/40 px-2 py-0.5">
              {originalBookmarks.length} raw links
            </span>
          </div>

          <div className="text-xs text-rose-300/80 mb-3 space-y-1 bg-rose-950/20 p-3 border border-rose-500/20">
            <p className="flex items-center gap-1.5 font-bold text-rose-300 uppercase text-[11px]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              Issues in Original Export:
            </p>
            <ul className="list-disc list-inside text-[11px] text-rose-300/70 space-y-0.5 pl-1">
              <li>Flat single list without category hierarchy</li>
              <li>Unclassified mixed domains (Dev, Shopping, Media)</li>
              {duplicatesCount > 0 && <li>{duplicatesCount} duplicate / redundant bookmarks</li>}
              <li>Messy URLs with bloated tracking parameters</li>
            </ul>
          </div>

          {/* Raw list preview */}
          <div className="flex-1 overflow-y-auto max-h-[420px] border border-white/5 bg-[#0C0C0D] p-3 space-y-1.5 text-[11px]">
            {originalBookmarks.slice(0, 30).map((bm, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-white/60 truncate py-0.5 border-b border-white/5"
              >
                <Bookmark className="h-3 w-3 shrink-0 text-rose-400/80" />
                <span className="truncate text-white/80">{bm.title}</span>
                <span className="text-[9px] text-white/30 shrink-0">({bm.domain})</span>
              </div>
            ))}
            {originalBookmarks.length > 30 && (
              <div className="text-center py-2 text-[10px] text-white/30 uppercase italic">
                + {originalBookmarks.length - 30} more original bookmarks
              </div>
            )}
          </div>
        </div>

        {/* AFTER CONTAINER */}
        <div className="border border-[#FF4D00]/40 bg-[#FF4D00]/5 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#FF4D00]/20 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF4D00]" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#FF4D00] font-['Syne']">
                Organized Chrome Hierarchy
              </h5>
            </div>
            <span className="text-[10px] font-mono text-[#FF4D00] border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-2 py-0.5">
              Ready to Import
            </span>
          </div>

          <div className="text-xs text-white/80 mb-3 space-y-1 bg-white/[0.02] p-3 border border-white/10">
            <p className="flex items-center gap-1.5 font-bold text-[#FF4D00] uppercase text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#FF4D00]" />
              Enhancements Applied:
            </p>
            <ul className="list-disc list-inside text-[11px] text-white/70 space-y-0.5 pl-1">
              <li>Organized into clean domain categories</li>
              <li>Intuitive subfolders for deep collections</li>
              <li>Duplicates removed and tracking UTM parameters stripped</li>
              <li>
                Formatted with Chrome's native <span className="text-[#FF4D00]">Bookmarks bar</span>{" "}
                toolbar tag
              </li>
            </ul>
          </div>

          {/* Clean tree preview */}
          <div className="flex-1 overflow-y-auto max-h-[420px] border border-white/10 bg-[#0C0C0D] p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#F8F7F4] pb-1 border-b border-white/10">
              <Folder className="h-3.5 w-3.5 text-[#FF4D00]" />
              <span className="uppercase">Bookmarks bar</span>
            </div>

            <div className="pl-4 space-y-1.5 border-l border-white/10">
              {organizedTree.children.map((child: any) => {
                if (child.title === "Bookmarks bar") {
                  return child.children.map((catFolder: any) => (
                    <div key={catFolder.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white/80 bg-white/[0.03] px-2 py-1 border border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Folder className="h-3.5 w-3.5 text-[#FF4D00]" />
                          <span>{catFolder.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40 border border-white/10 px-1.5 py-0.2">
                          {catFolder.children?.length || 0} links
                        </span>
                      </div>
                    </div>
                  ));
                }
                return (
                  <div
                    key={child.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-white/80"
                  >
                    <Folder className="h-3.5 w-3.5 text-[#FF4D00]" />
                    <span>{child.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
