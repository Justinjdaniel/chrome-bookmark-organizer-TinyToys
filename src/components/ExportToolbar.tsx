import React, { useState } from "react";
import {
  Download,
  Code,
  Sparkles,
  SlidersHorizontal,
  Copy,
  Check,
  ShieldCheck,
  Key,
  RefreshCw,
} from "lucide-react";
import { CategorizationOptions, BookmarkFolder, BookmarkItem } from "../types/bookmark";
import { generateNetscapeBookmarkHTML, triggerDirectDownload } from "../utils/bookmarkExporter";
import { BYOKConfig } from "./BYOKSettingsModal";

interface ExportToolbarProps {
  rootFolder: BookmarkFolder;
  flatBookmarks: BookmarkItem[];
  options: CategorizationOptions;
  onOptionsChange: (newOptions: CategorizationOptions) => void;
  onRunAICategorization?: (
    instructions: string,
    categoryCount: number,
    hierarchyDepth: number,
  ) => Promise<void>;
  isAILoading?: boolean;
  onOpenChromeModal: () => void;
  onOpenBYOKModal: () => void;
  byokConfig: BYOKConfig;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  rootFolder,
  flatBookmarks,
  options,
  onOptionsChange,
  onRunAICategorization,
  isAILoading,
  onOpenChromeModal,
  onOpenBYOKModal,
  byokConfig,
}) => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiTargetCategories, setAiTargetCategories] = useState<number>(
    options.targetCategoryCount || 0,
  ); // 0 = auto (max 20)
  const [aiHierarchyDepth, setAiHierarchyDepth] = useState<number>(options.hierarchyDepth || 2); // 1 = flat, 2 = standard, 3 = deep
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState("bookmarks_organized.html");

  const rawHtml = React.useMemo(() => {
    return generateNetscapeBookmarkHTML(rootFolder);
  }, [rootFolder]);

  const handleDownload = () => {
    triggerDirectDownload(rawHtml, filename);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAISubmit = async () => {
    if (onRunAICategorization) {
      // Also sync selected hierarchy depth to options
      onOptionsChange({
        ...options,
        hierarchyDepth: aiHierarchyDepth,
        createSubfolders: aiHierarchyDepth >= 2,
        targetCategoryCount: aiTargetCategories,
      });
      await onRunAICategorization(aiCustomPrompt, aiTargetCategories, aiHierarchyDepth);
      setShowAIModal(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/[0.02] p-3 sm:p-4">
      {/* Left Actions & Audits */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Chrome Compatibility Audit Button */}
        <button
          type="button"
          id="chrome-audit-btn"
          onClick={onOpenChromeModal}
          className="px-3 py-1.5 border border-white/20 hover:border-[#FF4D00] text-[#F8F7F4] text-[11px] font-bold uppercase tracking-wider font-mono bg-[#161619] transition-all inline-flex items-center gap-1.5"
          title="Verify Chrome import specifications"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#FF4D00]" />
          <span>Chrome Audit</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
        </button>

        {/* BYOK Status / Trigger */}
        <button
          type="button"
          id="byok-settings-btn"
          onClick={onOpenBYOKModal}
          className={`px-3 py-1.5 border text-[11px] font-bold uppercase tracking-wider font-mono transition-all inline-flex items-center gap-1.5 ${
            byokConfig.useBYOK && byokConfig.apiKey
              ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]"
              : "border-white/20 hover:border-white/40 bg-[#161619] text-[#F8F7F4]"
          }`}
          title="Configure BYOK Gemini API Key"
        >
          <Key
            className={`h-3.5 w-3.5 ${byokConfig.useBYOK && byokConfig.apiKey ? "text-[#FF4D00]" : "text-white/50"}`}
          />
          <span>{byokConfig.useBYOK && byokConfig.apiKey ? "BYOK Active" : "BYOK Settings"}</span>
        </button>

        {/* Cleaning Preferences */}
        <button
          type="button"
          id="toggle-options-btn"
          onClick={() => setShowOptionsModal(true)}
          className="px-3 py-1.5 border border-white/20 hover:border-white/40 bg-[#161619] text-[#F8F7F4] text-[11px] font-bold uppercase tracking-wider font-mono transition-all inline-flex items-center gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-white/50" />
          <span>Cleaning Rules</span>
        </button>

        {/* AI Semantic Sort */}
        {onRunAICategorization && (
          <button
            type="button"
            id="ai-categorize-btn"
            onClick={() => setShowAIModal(true)}
            disabled={isAILoading}
            className="px-3 py-1.5 border border-[#FF4D00]/60 bg-[#FF4D00]/10 text-[#FF4D00] hover:bg-[#FF4D00]/20 text-[11px] font-bold uppercase tracking-wider font-mono transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isAILoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>AI Semantic Sort</span>
          </button>
        )}
      </div>

      {/* Right Primary Download and Inspect */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="preview-html-btn"
          onClick={() => setShowCodeModal(true)}
          className="px-3 py-2 border border-white/20 hover:border-white/50 text-[#F8F7F4] text-xs font-bold uppercase tracking-wider font-mono bg-[#161619] transition-colors inline-flex items-center gap-1.5"
        >
          <Code className="h-3.5 w-3.5 text-white/60" />
          <span className="hidden sm:inline">Inspect Code</span>
        </button>

        {/* Primary Download Button */}
        <button
          type="button"
          id="direct-download-btn"
          onClick={handleDownload}
          className="px-4 py-2 bg-[#FF4D00] hover:bg-[#FF6622] text-[#111113] text-xs sm:text-sm font-extrabold uppercase tracking-wider font-mono transition-colors inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Download (.html)</span>
        </button>
      </div>

      {/* Raw HTML Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl border border-white/20 bg-[#141416] p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-[#FF4D00]" />
                <h3 className="text-sm font-bold text-[#F8F7F4] uppercase font-['Syne']">
                  Generated Netscape Bookmark File 1 (.html)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="text-white/40 hover:text-white font-mono text-sm"
              >
                [ESC]
              </button>
            </div>

            <div className="relative mt-4 flex-1 overflow-hidden border border-white/10 bg-[#0C0C0D]">
              <button
                type="button"
                onClick={handleCopyCode}
                className="absolute right-3 top-3 inline-flex items-center gap-1.5 border border-white/20 bg-[#18181B] px-3 py-1 text-[11px] font-mono font-bold uppercase text-[#F8F7F4] hover:border-[#FF4D00]"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-[#FF4D00]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <pre className="h-full overflow-y-auto p-4 text-[11px] font-mono text-[#F8F7F4]/90 leading-relaxed selection:bg-[#FF4D00] selection:text-[#111113]">
                {rawHtml}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] font-mono text-white/50 uppercase">
                Size: {(new Blob([rawHtml]).size / 1024).toFixed(1)} KB
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-1.5 border border-white/20 text-xs font-mono font-bold uppercase text-[#F8F7F4]/70 hover:text-[#F8F7F4]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-1.5 bg-[#FF4D00] text-[#111113] text-xs font-mono font-bold uppercase hover:bg-[#FF6622]"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cleaning Preferences Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg border border-white/20 bg-[#141416] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F8F7F4] uppercase font-['Syne']">
                Categorization &amp; Cleaning Options
              </h3>
              <button
                type="button"
                onClick={() => setShowOptionsModal(false)}
                className="text-white/40 hover:text-white font-mono text-sm"
              >
                [ESC]
              </button>
            </div>
            <p className="mt-2 text-xs text-[#F8F7F4]/60 font-mono">
              Configure sorting rules and export formatting specs.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <label className="flex items-start gap-3 p-2.5 border border-white/10 bg-white/[0.02] cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={options.removeDuplicates}
                  onChange={(e) =>
                    onOptionsChange({ ...options, removeDuplicates: e.target.checked })
                  }
                  className="mt-0.5 accent-[#FF4D00]"
                />
                <div>
                  <p className="font-bold text-[#F8F7F4] uppercase">Remove Duplicate URLs</p>
                  <p className="text-[11px] text-[#F8F7F4]/50">
                    Automatically deduplicate identical web links.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 border border-white/10 bg-white/[0.02] cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={options.cleanTitles}
                  onChange={(e) => onOptionsChange({ ...options, cleanTitles: e.target.checked })}
                  className="mt-0.5 accent-[#FF4D00]"
                />
                <div>
                  <p className="font-bold text-[#F8F7F4] uppercase">Clean Website Titles</p>
                  <p className="text-[11px] text-[#F8F7F4]/50">
                    Strip redundant SEO noise, YouTube suffixes, etc.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 border border-white/10 bg-white/[0.02] cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={options.stripTrackingParams}
                  onChange={(e) =>
                    onOptionsChange({ ...options, stripTrackingParams: e.target.checked })
                  }
                  className="mt-0.5 accent-[#FF4D00]"
                />
                <div>
                  <p className="font-bold text-[#F8F7F4] uppercase">
                    Sanitize Tracking Query Params
                  </p>
                  <p className="text-[11px] text-[#F8F7F4]/50">
                    Remove utm_*, fbclid, ref parameters from links.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 border border-white/10 bg-white/[0.02] cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={options.createSubfolders}
                  onChange={(e) =>
                    onOptionsChange({ ...options, createSubfolders: e.target.checked })
                  }
                  className="mt-0.5 accent-[#FF4D00]"
                />
                <div>
                  <p className="font-bold text-[#F8F7F4] uppercase">Generate Subfolders</p>
                  <p className="text-[11px] text-[#F8F7F4]/50">
                    Organize deep domain collections into subcategories.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 border border-white/10 bg-white/[0.02] cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={options.organizeUnderBookmarksBar}
                  onChange={(e) =>
                    onOptionsChange({
                      ...options,
                      organizeUnderBookmarksBar: e.target.checked,
                    })
                  }
                  className="mt-0.5 accent-[#FF4D00]"
                />
                <div>
                  <p className="font-bold text-[#F8F7F4] uppercase">
                    Mount to &quot;Bookmarks bar&quot;
                  </p>
                  <p className="text-[11px] text-[#F8F7F4]/50">
                    Attaches PERSONAL_TOOLBAR_FOLDER=&quot;true&quot; for instant top-bar display in
                    Chrome.
                  </p>
                </div>
              </label>

              {/* Folder Nesting Depth in Rules Modal */}
              <div className="p-2.5 border border-white/10 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8F7F4] uppercase text-[11px]">
                    Folder Nesting Depth
                  </span>
                  <span className="text-[#FF4D00] text-[10px] font-bold uppercase">
                    Level {options.hierarchyDepth || (options.createSubfolders ? 2 : 1)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { depth: 1, label: "Level 1: Flat" },
                    { depth: 2, label: "Level 2: Standard" },
                    { depth: 3, label: "Level 3: Deep" },
                  ].map((d) => (
                    <button
                      key={d.depth}
                      type="button"
                      onClick={() =>
                        onOptionsChange({
                          ...options,
                          hierarchyDepth: d.depth,
                          createSubfolders: d.depth >= 2,
                        })
                      }
                      className={`p-1.5 border text-center text-[10px] uppercase font-bold transition-all ${
                        (options.hierarchyDepth || (options.createSubfolders ? 2 : 1)) === d.depth
                          ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]"
                          : "border-white/10 bg-[#0C0C0D] text-white/60 hover:text-white"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-[11px] uppercase font-bold text-[#F8F7F4]/70 mb-1">
                  Export Filename
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full border border-white/10 bg-[#0C0C0D] px-3 py-1.5 text-xs text-[#F8F7F4] font-mono outline-none focus:border-[#FF4D00]"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOptionsModal(false)}
                className="px-4 py-2 bg-[#FF4D00] text-[#111113] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#FF6622]"
              >
                Apply &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Semantic Categorization Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl border border-white/20 bg-[#141416] p-6 shadow-2xl max-h-[90vh] overflow-y-auto font-mono">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-[#FF4D00]">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-sm font-bold text-[#F8F7F4] uppercase font-['Syne']">
                  AI Dynamic Taxonomy &amp; Hierarchy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="text-white/40 hover:text-white text-xs font-mono"
              >
                [ESC]
              </button>
            </div>

            {/* Architecture Execution Badge */}
            <div className="mt-3 p-2.5 border border-white/10 bg-[#0C0C0D] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${byokConfig.useBYOK && byokConfig.apiKey ? "bg-[#FF4D00] animate-pulse" : "bg-emerald-400"}`}
                />
                <span className="text-white/70">
                  {byokConfig.useBYOK && byokConfig.apiKey
                    ? "Execution Mode: Direct Client-to-Gemini (No Server Relay)"
                    : "Execution Mode: Server-Side Gemini API Proxy"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#FF4D00] uppercase border border-[#FF4D00]/30 px-1.5 py-0.5">
                {byokConfig.useBYOK && byokConfig.apiKey
                  ? byokConfig.model || "Gemini"
                  : "Zero Setup"}
              </span>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Option 1: Target Categories Count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-bold text-[#F8F7F4] flex items-center gap-1.5">
                    <span>1. Target Category Count</span>
                    <span className="text-[#FF4D00] text-[10px]">
                      {aiTargetCategories === 0
                        ? "(Auto / Max ~20)"
                        : `(~${aiTargetCategories} Folders)`}
                    </span>
                  </label>
                  <span className="text-[10px] text-white/40">Hard ceiling: 20 max</span>
                </div>
                <p className="text-[11px] text-white/50 leading-normal">
                  Control how many top-level category folders AI should create. 0 sets Auto (AI
                  finds optimal natural groupings, capped at 20 max).
                </p>

                {/* Preset Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                  {[
                    { value: 0, label: "0: Auto", sub: "Max ~20" },
                    { value: 5, label: "5 Folders", sub: "Compact" },
                    { value: 10, label: "10 Folders", sub: "Balanced" },
                    { value: 15, label: "15 Folders", sub: "Granular" },
                    { value: 20, label: "20 Folders", sub: "Maximum" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setAiTargetCategories(preset.value)}
                      className={`p-2 border text-left transition-all ${
                        aiTargetCategories === preset.value
                          ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]"
                          : "border-white/10 bg-[#0C0C0D] text-white/70 hover:border-white/30"
                      }`}
                    >
                      <div className="font-bold text-[11px] uppercase">{preset.label}</div>
                      <div className="text-[9px] opacity-60">{preset.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Hierarchy Nesting Depth */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-bold text-[#F8F7F4]">
                    2. Folder Hierarchy Nesting Depth
                  </label>
                  <span className="text-[#FF4D00] text-[10px] uppercase font-bold">
                    Level {aiHierarchyDepth}{" "}
                    {aiHierarchyDepth === 1
                      ? "(Flat)"
                      : aiHierarchyDepth === 2
                        ? "(Standard)"
                        : "(Deep)"}
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-normal">
                  Determine how deeply bookmarks are nested into subfolders.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiHierarchyDepth(1)}
                    className={`p-2.5 border text-left transition-all ${
                      aiHierarchyDepth === 1
                        ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]"
                        : "border-white/10 bg-[#0C0C0D] text-white/70 hover:border-white/30"
                    }`}
                  >
                    <div className="font-bold text-[11px] uppercase">Level 1: Flat</div>
                    <div className="text-[10px] opacity-70 mt-1">
                      No subfolders. Bookmarks sit directly inside primary category folders.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiHierarchyDepth(2)}
                    className={`p-2.5 border text-left transition-all ${
                      aiHierarchyDepth === 2
                        ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]"
                        : "border-white/10 bg-[#0C0C0D] text-white/70 hover:border-white/30"
                    }`}
                  >
                    <div className="font-bold text-[11px] uppercase flex items-center justify-between">
                      <span>Level 2: Standard</span>
                      <span className="text-[9px] text-[#FF4D00] bg-[#FF4D00]/20 px-1">Best</span>
                    </div>
                    <div className="text-[10px] opacity-70 mt-1">
                      Category &gt; Subfolder &gt; Links (e.g. Dev &gt; Frontend &gt; Links).
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiHierarchyDepth(3)}
                    className={`p-2.5 border text-left transition-all ${
                      aiHierarchyDepth === 3
                        ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]"
                        : "border-white/10 bg-[#0C0C0D] text-white/70 hover:border-white/30"
                    }`}
                  >
                    <div className="font-bold text-[11px] uppercase">Level 3: Deep</div>
                    <div className="text-[10px] opacity-70 mt-1">
                      Category &gt; Subfolder &gt; Topic &gt; Links for granular organization.
                    </div>
                  </button>
                </div>
              </div>

              {/* Option 3: Custom Prompt Guidelines */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-[11px] uppercase font-bold text-[#F8F7F4]/80">
                  3. Custom Guidance / Prompt (Optional)
                </label>
                <textarea
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  placeholder="E.g., 'Separate client projects from learning resources and prioritize AI research tools'..."
                  rows={2}
                  className="w-full border border-white/10 bg-[#0C0C0D] p-2.5 text-xs text-[#F8F7F4] placeholder-white/20 focus:border-[#FF4D00] outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[10px] text-white/40 font-mono">
                {flatBookmarks.length} bookmarks will be categorized
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-3 py-1.5 border border-white/20 text-xs font-mono font-bold uppercase text-[#F8F7F4]/70 hover:text-[#F8F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAISubmit}
                  disabled={isAILoading}
                  className="px-4 py-1.5 bg-[#FF4D00] text-[#111113] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#FF6622] disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isAILoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Classifying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Run AI Categorization</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
