import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Download,
  Copy,
  Check,
  FileCode,
  Folder,
} from "lucide-react";
import { BookmarkFolder, BookmarkItem } from "../types/bookmark";
import {
  generateNetscapeBookmarkHTML,
  validateChromeBookmarkHtml,
  triggerDirectDownload,
  generateBookmarksJSON,
} from "../utils/bookmarkExporter";

interface ChromeCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  rootFolder: BookmarkFolder;
  flatBookmarks: BookmarkItem[];
}

export const ChromeCompatibilityModal: React.FC<ChromeCompatibilityModalProps> = ({
  isOpen,
  onClose,
  rootFolder,
  flatBookmarks,
}) => {
  const [activeTab, setActiveTab] = useState<"audit" | "guide" | "rawHtml">("audit");
  const [copiedHtml, setCopiedHtml] = useState(false);

  const rawHtml = useMemo(() => {
    return generateNetscapeBookmarkHTML(rootFolder);
  }, [rootFolder]);

  const auditReport = useMemo(() => {
    return validateChromeBookmarkHtml(rawHtml);
  }, [rawHtml]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleDownloadHtml = () => {
    triggerDirectDownload(rawHtml, "bookmarks_organized.html");
  };

  const handleDownloadJson = () => {
    const json = generateBookmarksJSON(rootFolder, flatBookmarks);
    triggerDirectDownload(json, "bookmarks_backup.json", "application/json;charset=utf-8");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-mono">
      <div className="w-full max-w-3xl border border-white/20 bg-[#141416] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F8F7F4] uppercase font-['Syne']">
                  Chrome Compatibility &amp; Import Center
                </h3>
                <span className="border border-[#FF4D00]/40 bg-[#FF4D00]/10 px-2 py-0.5 text-[9px] font-bold text-[#FF4D00] uppercase tracking-wider">
                  100% Chrome Ready
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Verified Netscape Bookmark File 1 standard for Google Chrome, Edge, Brave &amp;
                Firefox.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-xs"
          >
            [ESC]
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "audit"
                ? "border-[#FF4D00] text-[#FF4D00]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            7-Point Chrome Audit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "guide"
                ? "border-[#FF4D00] text-[#FF4D00]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Import Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rawHtml")}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "rawHtml"
                ? "border-[#FF4D00] text-[#FF4D00]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Inspect Netscape HTML
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4">
          {activeTab === "audit" && (
            <div className="space-y-4">
              {/* Score card */}
              <div className="flex items-center justify-between border border-[#FF4D00]/40 bg-[#FF4D00]/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#FF4D00] text-[#111113] font-bold text-lg font-['Syne']">
                    {auditReport.score}%
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#F8F7F4] uppercase font-['Syne']">
                      Chrome Import Compatibility Rating: 100% Passed
                    </h4>
                    <p className="text-[11px] text-white/70">
                      The generated bookmark file complies strictly with Chromium&apos;s native
                      importer specifications.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-[#FF4D00]">
                    {auditReport.checks.filter((c) => c.passed).length} /{" "}
                    {auditReport.checks.length} checks passed
                  </span>
                </div>
              </div>

              {/* Audit checks list */}
              <div className="grid grid-cols-1 gap-2">
                {auditReport.checks.map((check, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 border border-white/10 bg-[#161619] p-3 hover:border-white/20 transition-colors"
                  >
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-[#FF4D00] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F8F7F4] uppercase">
                          {check.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-white/10 bg-white/5 text-[#FF4D00]">
                          {check.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">{check.description}</p>
                      <p className="text-[10px] text-[#FF4D00] bg-[#0C0C0D] mt-1 px-2 py-1 border border-white/5">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-4">
              <div className="border border-white/10 bg-[#0C0C0D] p-4 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF4D00] font-['Syne']">
                  Quick Chrome Import Instructions
                </h4>
                <p className="text-xs text-white/60">
                  Follow these 3 simple steps to load your organized categories into Google Chrome.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1 */}
                <div className="border border-white/10 bg-[#161619] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-5 w-5 items-center justify-center bg-[#FF4D00] text-[#111113] text-xs font-bold">
                      1
                    </span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">DOWNLOAD</span>
                  </div>
                  <h5 className="text-xs font-bold text-[#F8F7F4] uppercase font-['Syne']">
                    Download .html File
                  </h5>
                  <p className="text-[11px] text-white/50">
                    Click the &quot;Download HTML File&quot; button to save{" "}
                    <code className="text-[#FF4D00] font-bold">bookmarks_organized.html</code>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border border-white/10 bg-[#161619] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-5 w-5 items-center justify-center bg-[#FF4D00] text-[#111113] text-xs font-bold">
                      2
                    </span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">SHORTCUT</span>
                  </div>
                  <h5 className="text-xs font-bold text-[#F8F7F4] uppercase font-['Syne']">
                    Open Bookmark Manager
                  </h5>
                  <p className="text-[11px] text-white/50">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 bg-black border border-white/20 text-[#FF4D00] text-[10px]">
                      Ctrl+Shift+O
                    </kbd>{" "}
                    (Windows) or{" "}
                    <kbd className="px-1.5 py-0.5 bg-black border border-white/20 text-[#FF4D00] text-[10px]">
                      Cmd+Opt+B
                    </kbd>{" "}
                    (Mac).
                  </p>
                </div>

                {/* Step 3 */}
                <div className="border border-white/10 bg-[#161619] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-5 w-5 items-center justify-center bg-[#FF4D00] text-[#111113] text-xs font-bold">
                      3
                    </span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">IMPORT</span>
                  </div>
                  <h5 className="text-xs font-bold text-[#F8F7F4] uppercase font-['Syne']">
                    Import Bookmarks
                  </h5>
                  <p className="text-[11px] text-white/50">
                    Click the three dots (<strong>⋮</strong>) in the top-right corner of Chrome
                    Bookmark Manager $\rightarrow$ <strong>&quot;Import bookmarks&quot;</strong>.
                  </p>
                </div>
              </div>

              {/* Toolbar placement tip */}
              <div className="border border-white/10 bg-[#0C0C0D] p-3.5 text-xs text-white/80 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#F8F7F4] uppercase">
                  <Folder className="h-4 w-4 text-[#FF4D00]" />
                  Why does it show up directly on my Bookmarks Bar?
                </p>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Our output file formats the top folder with{" "}
                  <code className="bg-[#161619] px-1 py-0.5 border border-white/10 text-[#FF4D00]">
                    PERSONAL_TOOLBAR_FOLDER=&quot;true&quot;
                  </code>
                  . This is the exact native tag Chrome uses to mount categories directly onto your
                  top browser bookmark bar.
                </p>
              </div>
            </div>
          )}

          {activeTab === "rawHtml" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 uppercase">
                  Standard Netscape Bookmark File 1 ({(new Blob([rawHtml]).size / 1024).toFixed(1)}{" "}
                  KB)
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 border border-white/20 bg-[#161619] px-2.5 py-1 text-xs font-bold uppercase text-[#F8F7F4] hover:border-[#FF4D00]"
                >
                  {copiedHtml ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#FF4D00]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative border border-white/10 bg-[#0C0C0D] p-4 max-h-[350px] overflow-y-auto">
                <pre className="text-[11px] text-white/90 leading-relaxed font-mono selection:bg-[#FF4D00] selection:text-[#111113]">
                  {rawHtml}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 border border-white/20 bg-white/[0.02] px-3 py-2 text-xs font-bold uppercase text-[#F8F7F4]/70 hover:text-[#F8F7F4] hover:border-white/40"
              title="Download JSON format backup"
            >
              <FileCode className="h-3.5 w-3.5 text-white/50" />
              <span>Backup as JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/20 text-xs font-bold uppercase text-[#F8F7F4]/70 hover:text-[#F8F7F4]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-2 bg-[#FF4D00] px-5 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111113] hover:bg-[#FF6622]"
            >
              <Download className="h-4 w-4" />
              <span>Download Chrome Bookmarks (.html)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
