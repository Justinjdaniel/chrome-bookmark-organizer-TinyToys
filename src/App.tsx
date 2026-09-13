/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Bookmark,
  FolderTree,
  Sparkles,
  Download,
  Layers,
  ArrowLeftRight,
  RotateCcw,
  ShieldCheck,
  Key,
  Layout,
  CheckCircle2,
  Github,
} from "lucide-react";
import { BookmarkItem, CategorizationOptions } from "./types/bookmark";
import { parseBookmarkHTML } from "./utils/bookmarkParser";
import { organizeBookmarks } from "./utils/categorizer";
import { generateNetscapeBookmarkHTML, triggerDirectDownload } from "./utils/bookmarkExporter";
import { SAMPLE_BOOKMARKS } from "./data/sampleBookmarks";
import { BookmarkUploader } from "./components/BookmarkUploader";
import { ChangeSummaryReport } from "./components/ChangeSummaryReport";
import { FolderTreeView } from "./components/FolderTreeView";
import { BookmarkListView } from "./components/BookmarkListView";
import { StructureComparisonView } from "./components/StructureComparisonView";
import { ExportToolbar } from "./components/ExportToolbar";
import { BYOKSettingsModal, BYOKConfig } from "./components/BYOKSettingsModal";
import { ChromeCompatibilityModal } from "./components/ChromeCompatibilityModal";
import { ChromeToolbarSimulator } from "./components/ChromeToolbarSimulator";

import { executeAICategorization } from "./utils/aiCategorizer";

const BYOK_STORAGE_KEY = "chrome_bookmarks_byok_config";

export default function App() {
  const [sourceFileName, setSourceFileName] = useState<string>("Messy Chrome Export (Sample)");
  const [rawBookmarks, setRawBookmarks] = useState<BookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "summary" | "tree" | "simulator" | "list" | "comparison"
  >("summary");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>();
  const [isAILoading, setIsAILoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isChromeModalOpen, setIsChromeModalOpen] = useState(false);
  const [isBYOKModalOpen, setIsBYOKModalOpen] = useState(false);

  // BYOK Configuration state with localStorage persistence
  const [byokConfig, setByokConfig] = useState<BYOKConfig>(() => {
    try {
      const saved = localStorage.getItem(BYOK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.model) {
          parsed.model = "gemini-3.7-flash";
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to load BYOK config from localStorage", e);
    }
    return {
      apiKey: "",
      model: "gemini-3.7-flash",
      isVerified: false,
      useBYOK: false,
    };
  });

  const [options, setOptions] = useState<CategorizationOptions>({
    removeDuplicates: true,
    cleanTitles: true,
    createSubfolders: true,
    stripTrackingParams: true,
    organizeUnderBookmarksBar: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveBYOKConfig = (newConfig: BYOKConfig) => {
    setByokConfig(newConfig);
    try {
      localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(newConfig));
      if (newConfig.useBYOK && newConfig.apiKey) {
        showToast(`BYOK Active: Using custom ${newConfig.model}`);
      } else {
        showToast("BYOK disabled: enter and enable a Gemini API key to use AI");
      }
    } catch (e) {
      console.warn("Failed to persist BYOK config", e);
    }
  };

  // Initial load of sample bookmarks on mount so user sees instant working state
  useEffect(() => {
    const defaultSample = SAMPLE_BOOKMARKS[0];
    const parsed = parseBookmarkHTML(defaultSample.rawHtml);
    setRawBookmarks(parsed.flatBookmarks);
    setSourceFileName(defaultSample.name);
  }, []);

  const handleLoadBookmarks = (htmlContent: string, sourceName: string) => {
    const parsed = parseBookmarkHTML(htmlContent);
    if (parsed.flatBookmarks.length === 0) {
      showToast("No valid bookmark links found in the uploaded file.");
      return;
    }
    setRawBookmarks(parsed.flatBookmarks);
    setSourceFileName(sourceName);
    showToast(`Loaded ${parsed.flatBookmarks.length} bookmarks from ${sourceName}`);
  };

  // Compute organized tree and change summary
  const { organizedTree, processedBookmarks, changeSummary } = useMemo(() => {
    return organizeBookmarks(rawBookmarks, options);
  }, [rawBookmarks, options]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const bm of processedBookmarks) {
      set.add(bm.category);
    }
    return Array.from(set).sort();
  }, [processedBookmarks]);

  const handleUpdateBookmark = (updated: BookmarkItem) => {
    setRawBookmarks((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
    showToast(`Updated "${updated.title}"`);
  };

  const handleDeleteBookmark = (id: string) => {
    setRawBookmarks((prev) => prev.filter((b) => b.id !== id));
    showToast("Bookmark removed");
  };

  const handleBulkMoveCategory = (ids: string[], newCategory: string) => {
    const targetSet = new Set(ids);
    setRawBookmarks((prev) =>
      prev.map((b) => (targetSet.has(b.id) ? { ...b, category: newCategory } : b)),
    );
    showToast(`Moved ${ids.length} bookmarks to ${newCategory}`);
  };

  const handleBulkDelete = (ids: string[]) => {
    const targetSet = new Set(ids);
    setRawBookmarks((prev) => prev.filter((b) => !targetSet.has(b.id)));
    showToast(`Deleted ${ids.length} bookmarks`);
  };

  const handleRunAICategorization = async (
    instructions: string,
    categoryCount: number = 0,
    hierarchyDepth: number = 2,
  ) => {
    try {
      setIsAILoading(true);
      const result = await executeAICategorization({
        bookmarks: rawBookmarks,
        customInstructions: instructions,
        targetCategoryCount: categoryCount,
        hierarchyDepth: hierarchyDepth,
        byokConfig,
      });

      if (result.classifications && Array.isArray(result.classifications)) {
        const classMap = new Map<
          string,
          { category: string; subCategory?: string; cleanedTitle?: string }
        >();
        for (const item of result.classifications) {
          classMap.set(item.id, {
            category: item.category,
            subCategory: item.subCategory,
            cleanedTitle: item.cleanedTitle,
          });
        }

        setRawBookmarks((prev) =>
          prev.map((bm) => {
            const aiClass = classMap.get(bm.id);
            if (aiClass) {
              return {
                ...bm,
                category: aiClass.category || bm.category,
                subCategory: aiClass.subCategory || bm.subCategory,
                title: aiClass.cleanedTitle || bm.title,
              };
            }
            return bm;
          }),
        );

        const modeText = `Direct Client (${result.modelUsed})`;

        showToast(
          `AI Categorization applied! [${modeText} | ~${categoryCount === 0 ? "Auto" : categoryCount} categories, Level ${hierarchyDepth} depth]`,
        );
      }
    } catch (err: any) {
      console.error("AI Categorization error:", err);
      const errMsg = err.message || "Failed. Keeping rule-based taxonomy.";
      showToast(`AI categorization: ${errMsg}`);
      if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("byok")) {
        setTimeout(() => setIsBYOKModalOpen(true), 600);
      }
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] text-[#F8F7F4] flex flex-col font-mono selection:bg-[#FF4D00] selection:text-[#111113]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border border-[#FF4D00] bg-[#161619] px-4 py-3 text-xs font-bold font-mono text-[#F8F7F4] shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#FF4D00] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#111113]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]">
            <Bookmark className="h-4 w-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#F8F7F4] font-['Syne']">
                BOOKMARK FORGE
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#FF4D00] border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-1.5 py-0.2 hidden sm:inline-block">
                VERSION 1.0.4
              </span>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
              Chrome Compatible • Netscape 1 File
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chrome 7-Point Audit */}
          <button
            type="button"
            id="nav-chrome-audit-btn"
            onClick={() => setIsChromeModalOpen(true)}
            className="px-3 py-1.5 border border-white/20 hover:border-white/50 text-[#F8F7F4] text-xs font-bold uppercase tracking-wider font-mono bg-transparent transition-all hidden md:inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#FF4D00]" />
            <span>Chrome Audit</span>
          </button>

          {/* BYOK Status Pill */}
          <button
            type="button"
            id="header-byok-btn"
            onClick={() => setIsBYOKModalOpen(true)}
            className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-wider font-mono transition-all inline-flex items-center gap-1.5 ${
              byokConfig.useBYOK && byokConfig.apiKey
                ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]"
                : "border-white/20 bg-transparent text-[#F8F7F4] hover:border-white/40"
            }`}
          >
            <Key
              className={`h-3.5 w-3.5 ${byokConfig.useBYOK ? "text-[#FF4D00]" : "text-white/50"}`}
            />
            <span className="hidden sm:inline">
              {byokConfig.useBYOK && byokConfig.apiKey ? "BYOK Active" : "BYOK Settings"}
            </span>
          </button>

          {/* Direct Download Button */}
          <button
            type="button"
            id="header-download-btn"
            onClick={() => {
              const html = generateNetscapeBookmarkHTML(organizedTree);
              triggerDirectDownload(html, "bookmarks_organized.html");
              showToast("Downloaded bookmarks_organized.html");
            }}
            className="px-4 py-2 bg-[#FF4D00] hover:bg-[#FF6622] text-[#111113] text-xs sm:text-sm font-extrabold uppercase tracking-wider font-mono transition-all inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download (.html)</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Hero Header */}
        <section className="space-y-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-[#FF4D00] text-[10px] uppercase font-bold tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
            <span>Browser Bookmark Transformation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-[#F8F7F4] font-['Syne'] leading-none">
            Chrome Bookmark Manager
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono max-w-3xl leading-relaxed">
            Auto-sort, deduplicate &amp; export clean browser folder hierarchies directly compatible
            with Google Chrome, Edge, Brave &amp; Firefox.
          </p>
        </section>

        {/* Upload Zone & Presets */}
        <section className="space-y-4">
          <BookmarkUploader onLoadBookmarks={handleLoadBookmarks} isLoading={isAILoading} />
        </section>

        {/* Dataset Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#161619] p-3.5 font-mono text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2 w-2 rounded-full bg-[#FF4D00]" />
            <span className="text-white/40 uppercase text-[10px]">Active Source:</span>
            <span className="text-[#F8F7F4] font-bold truncate">{sourceFileName}</span>
            <span className="border border-white/10 bg-[#0C0C0D] px-2 py-0.5 text-[10px] text-[#FF4D00]">
              {rawBookmarks.length} raw bookmarks
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const sample = SAMPLE_BOOKMARKS[0];
                handleLoadBookmarks(sample.rawHtml, sample.name);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#FF4D00] uppercase font-bold transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Sample</span>
            </button>
          </div>
        </div>

        {/* Export & Actions Toolbar */}
        <ExportToolbar
          rootFolder={organizedTree}
          flatBookmarks={processedBookmarks}
          options={options}
          onOptionsChange={setOptions}
          onRunAICategorization={handleRunAICategorization}
          isAILoading={isAILoading}
          onOpenChromeModal={() => setIsChromeModalOpen(true)}
          onOpenBYOKModal={() => setIsBYOKModalOpen(true)}
          byokConfig={byokConfig}
        />

        {/* Navigation Tabs */}
        <div className="border-b border-white/10 flex items-center gap-1 sm:gap-2 overflow-x-auto font-mono">
          <button
            type="button"
            id="tab-summary"
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === "summary"
                ? "border-[#FF4D00] text-[#FF4D00] bg-white/[0.02]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Summary &amp; Analytics</span>
          </button>

          <button
            type="button"
            id="tab-tree"
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === "tree"
                ? "border-[#FF4D00] text-[#FF4D00] bg-white/[0.02]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span>Hierarchy Tree</span>
          </button>

          <button
            type="button"
            id="tab-simulator"
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === "simulator"
                ? "border-[#FF4D00] text-[#FF4D00] bg-white/[0.02]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Chrome Toolbar Preview</span>
          </button>

          <button
            type="button"
            id="tab-list"
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === "list"
                ? "border-[#FF4D00] text-[#FF4D00] bg-white/[0.02]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Bookmarks List &amp; Editor ({processedBookmarks.length})</span>
          </button>

          <button
            type="button"
            id="tab-comparison"
            onClick={() => setActiveTab("comparison")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === "comparison"
                ? "border-[#FF4D00] text-[#FF4D00] bg-white/[0.02]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Before vs. After</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div className="transition-all duration-150">
          {activeTab === "summary" && (
            <ChangeSummaryReport
              summary={changeSummary}
              onSelectCategoryFilter={(catName) => {
                setSelectedCategoryFilter(catName);
                setActiveTab("list");
              }}
            />
          )}

          {activeTab === "tree" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
              <div className="lg:col-span-2">
                <FolderTreeView rootFolder={organizedTree} />
              </div>
              <div className="space-y-4">
                <div className="border border-white/10 bg-[#161619] p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8F7F4] font-['Syne'] mb-3">
                    Hierarchy Blueprint
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-mono">
                    Bookmarks are grouped under{" "}
                    <strong className="text-[#F8F7F4]">Bookmarks bar</strong> with{" "}
                    <code className="text-[#FF4D00] bg-[#0C0C0D] px-1 py-0.5 border border-white/10 text-[10px]">
                      PERSONAL_TOOLBAR_FOLDER=&quot;true&quot;
                    </code>{" "}
                    so they mount directly to your browser&apos;s top bar upon import.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChromeModalOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 border border-white/20 bg-white/[0.02] py-2 text-xs font-bold uppercase text-[#F8F7F4] hover:border-[#FF4D00]"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#FF4D00]" />
                      <span>Audit Chrome Compatibility</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const html = generateNetscapeBookmarkHTML(organizedTree);
                        triggerDirectDownload(html, "bookmarks_organized.html");
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#FF4D00] py-2.5 text-xs font-bold uppercase text-[#111113] hover:bg-[#FF6622]"
                    >
                      <Download className="h-4 w-4" />
                      <span>Direct Download File</span>
                    </button>
                  </div>
                </div>

                <div className="border border-white/10 bg-[#0C0C0D] p-5 text-white/80 space-y-2">
                  <h5 className="text-xs font-bold text-[#FF4D00] uppercase tracking-wider font-['Syne']">
                    Chrome Import Shortcut
                  </h5>
                  <p className="text-xs text-white/60 leading-relaxed font-mono">
                    Press{" "}
                    <kbd className="bg-black px-1.5 py-0.5 border border-white/20 text-[#FF4D00] text-[10px]">
                      Ctrl+Shift+O
                    </kbd>{" "}
                    (Mac:{" "}
                    <kbd className="bg-black px-1.5 py-0.5 border border-white/20 text-[#FF4D00] text-[10px]">
                      Cmd+Opt+B
                    </kbd>
                    ) to open Chrome Bookmark Manager $\rightarrow$ <strong>⋮</strong> $\rightarrow${" "}
                    <strong>Import bookmarks</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#F8F7F4] uppercase font-['Syne']">
                    Live Chrome Browser Bar Mockup
                  </h3>
                  <p className="text-xs text-white/50">
                    Interactive simulation of how your organized folders look and behave directly in
                    Google Chrome.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChromeModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4D00] uppercase hover:underline"
                >
                  <ShieldCheck className="h-4 w-4 text-[#FF4D00]" />
                  <span>Verify Import Format</span>
                </button>
              </div>

              <ChromeToolbarSimulator rootFolder={organizedTree} />
            </div>
          )}

          {activeTab === "list" && (
            <BookmarkListView
              bookmarks={processedBookmarks}
              availableCategories={availableCategories}
              onUpdateBookmark={handleUpdateBookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onBulkMoveCategory={handleBulkMoveCategory}
              onBulkDelete={handleBulkDelete}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter(undefined)}
            />
          )}

          {activeTab === "comparison" && (
            <StructureComparisonView
              originalBookmarks={rawBookmarks}
              organizedTree={organizedTree}
              duplicatesCount={changeSummary.duplicatesRemoved}
            />
          )}
        </div>
      </main>

      {/* BYOK Settings Modal */}
      <BYOKSettingsModal
        isOpen={isBYOKModalOpen}
        onClose={() => setIsBYOKModalOpen(false)}
        config={byokConfig}
        onSaveConfig={handleSaveBYOKConfig}
      />

      {/* Chrome Compatibility & Import Modal */}
      <ChromeCompatibilityModal
        isOpen={isChromeModalOpen}
        onClose={() => setIsChromeModalOpen(false)}
        rootFolder={organizedTree}
        flatBookmarks={processedBookmarks}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#111113] py-5 text-xs text-white/50 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="uppercase text-[10px] tracking-wider text-white/40">
            BOOKMARK FORGE // BUILT BY JUSTIN JOHN D. // 100% CHROME COMPATIBLE
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Justinjdaniel/chrome-bookmark-organizer-TinyToys"
              target="_blank"
              rel="noreferrer"
              title="View Bookmark Forge on GitHub"
              aria-label="View Bookmark Forge on GitHub"
              className="hover:text-[#FF4D00] text-white/60 inline-flex items-center gap-1 uppercase text-[11px] font-bold"
            >
              <Github className="h-3 w-3" />
              <span>GitHub</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href="https://github.com/Justinjdaniel/chrome-bookmark-organizer-TinyToys/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#FF4D00] text-white/60 uppercase text-[11px] font-bold"
            >
              Report an issue
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
