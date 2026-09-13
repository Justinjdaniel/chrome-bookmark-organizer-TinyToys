import React from "react";
import {
  FolderTree,
  Sparkles,
  Trash2,
  ShieldCheck,
  Tag,
  Layers,
  Globe,
  CheckCircle,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { ChangeSummary } from "../types/bookmark";

interface ChangeSummaryReportProps {
  summary: ChangeSummary;
  onSelectCategoryFilter?: (categoryName: string) => void;
}

export const ChangeSummaryReport: React.FC<ChangeSummaryReportProps> = ({
  summary,
  onSelectCategoryFilter,
}) => {
  return (
    <div className="space-y-6">
      {/* Metric Cards Grid with Syne Numbers and Space Mono Labels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="border border-white/10 bg-[#161619] p-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#F8F7F4]/60">
              Bookmarks
            </span>
            <Layers className="h-3.5 w-3.5 text-[#FF4D00]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8F7F4] font-['Syne'] tracking-tight">
            {summary.finalBookmarkCount}
          </p>
          <p className="mt-1 text-[10px] text-white/40 font-mono">
            of {summary.originalBookmarkCount} original
          </p>
        </div>

        <div className="border border-white/10 bg-[#161619] p-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#F8F7F4]/60">
              Categories
            </span>
            <FolderTree className="h-3.5 w-3.5 text-[#FF4D00]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8F7F4] font-['Syne'] tracking-tight">
            {summary.categoriesCreated.length}
          </p>
          <p className="mt-1 text-[10px] text-white/40 font-mono">top-level folders</p>
        </div>

        <div className="border border-white/10 bg-[#161619] p-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#F8F7F4]/60">
              Duplicates
            </span>
            <Trash2 className="h-3.5 w-3.5 text-[#FF4D00]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8F7F4] font-['Syne'] tracking-tight">
            {summary.duplicatesRemoved}
          </p>
          <p className="mt-1 text-[10px] text-white/40 font-mono">redundant links purged</p>
        </div>

        <div className="border border-white/10 bg-[#161619] p-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#F8F7F4]/60">
              Clean Titles
            </span>
            <Sparkles className="h-3.5 w-3.5 text-[#FF4D00]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8F7F4] font-['Syne'] tracking-tight">
            {summary.titlesCleaned}
          </p>
          <p className="mt-1 text-[10px] text-white/40 font-mono">SEO noise stripped</p>
        </div>

        <div className="border border-white/10 bg-[#161619] p-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#F8F7F4]/60">
              UTM Cleaned
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-[#FF4D00]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8F7F4] font-['Syne'] tracking-tight">
            {summary.trackingParamsStripped}
          </p>
          <p className="mt-1 text-[10px] text-white/40 font-mono">trackers sanitized</p>
        </div>

        <div className="border border-white/10 bg-[#161619] p-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#F8F7F4]/60">
              Depth Level
            </span>
            <FolderOpen className="h-3.5 w-3.5 text-[#FF4D00]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8F7F4] font-['Syne'] tracking-tight">
            {summary.newFolderDepth}
          </p>
          <p className="mt-1 text-[10px] text-white/40 font-mono">Bar → Cat → Subfolder</p>
        </div>
      </div>

      {/* Structural Taxonomy & Key Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Grid */}
        <div className="lg:col-span-2 border border-white/10 bg-[#161619] p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#FF4D00]" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F8F7F4] font-['Syne']">
                Organized Category Taxonomy
              </h4>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase">
              Click to filter list
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {summary.categoriesCreated.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelectCategoryFilter?.(cat.name)}
                className="flex items-center justify-between border border-white/10 bg-[#111113] p-3 text-left hover:border-[#FF4D00] hover:bg-white/[0.04] transition-all group font-mono"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || "#FF4D00" }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#F8F7F4] truncate group-hover:text-[#FF4D00] transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {cat.subfolderCount > 1
                        ? `${cat.subfolderCount} subfolders`
                        : "flat hierarchy"}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-mono text-xs font-bold text-[#FF4D00] border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-2 py-0.5">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Changes Summary & Domain distribution */}
        <div className="border border-white/10 bg-[#141416] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Sparkles className="h-4 w-4 text-[#FF4D00]" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F8F7F4] font-['Syne']">
                Structure Transformation
              </h4>
            </div>

            <ul className="space-y-2.5 font-mono text-xs">
              {summary.structuralHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-white/80 leading-relaxed">
                  <CheckCircle className="h-3.5 w-3.5 text-[#FF4D00] shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-white/40 tracking-wider">
              <Globe className="h-3 w-3 text-[#FF4D00]" />
              <span>Top Domains In Export:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
              {summary.topDomains.slice(0, 6).map((d) => (
                <span
                  key={d.domain}
                  className="border border-white/10 bg-[#0C0C0D] px-2 py-0.5 text-white/70"
                >
                  {d.domain} <strong className="text-[#FF4D00]">({d.count})</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chrome Import Shortcut Helper */}
      <div className="border border-white/10 bg-[#161619] p-4 font-mono">
        <div className="flex items-start gap-3">
          <div className="border border-[#FF4D00] bg-[#FF4D00]/10 p-1.5 text-[#FF4D00] shrink-0">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-[#F8F7F4] uppercase font-['Syne'] tracking-wide">
              How to import into Google Chrome
            </h5>
            <ol className="mt-1.5 list-decimal list-inside space-y-1 text-xs text-white/70 leading-relaxed">
              <li>
                Click <strong>Download (.html)</strong> to save your clean bookmarks.
              </li>
              <li>
                In Google Chrome, press{" "}
                <kbd className="border border-white/20 px-1 py-0.5 bg-black text-[#FF4D00] text-[10px]">
                  Ctrl+Shift+O
                </kbd>{" "}
                (Mac:{" "}
                <kbd className="border border-white/20 px-1 py-0.5 bg-black text-[#FF4D00] text-[10px]">
                  Cmd+Opt+B
                </kbd>
                ) to open the Bookmark Manager.
              </li>
              <li>
                Click <strong>⋮</strong> in the top-right corner $\rightarrow${" "}
                <strong>Import bookmarks</strong> and choose your downloaded file.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
