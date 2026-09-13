import React, { useState, useRef } from "react";
import { FileCode, Sparkles, Clipboard, ArrowRight } from "lucide-react";
import { SAMPLE_BOOKMARKS } from "../data/sampleBookmarks";

interface BookmarkUploaderProps {
  onLoadBookmarks: (html: string, sourceName: string) => void;
  isLoading?: boolean;
}

export const BookmarkUploader: React.FC<BookmarkUploaderProps> = ({
  onLoadBookmarks,
  isLoading: _isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndProcessFile(file);
  };

  const readAndProcessFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onLoadBookmarks(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readAndProcessFile(file);
    }
  };

  const handlePasteSubmit = () => {
    if (pastedText.trim()) {
      onLoadBookmarks(pastedText, "Pasted Bookmarks");
      setShowPasteModal(false);
      setPastedText("");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Drag & Drop Zone */}
      <div
        id="bookmark-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer border-2 transition-all duration-200 p-8 sm:p-12 text-center select-none ${
          isDragging
            ? "border-[#FF4D00] bg-[#FF4D00]/10 ring-2 ring-[#FF4D00]/40"
            : "border-dashed border-[#FF4D00] bg-[#111113] hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,text/html"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-4xl sm:text-5xl font-light text-[#FF4D00] leading-none mb-1">+</div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-[#F8F7F4] uppercase font-['Syne'] tracking-tight">
              Upload exported Chrome Bookmarks
            </h3>
            <p className="text-[11px] sm:text-xs text-[#F8F7F4]/60 uppercase tracking-widest font-mono">
              Drag and drop <span className="text-[#FF4D00]">bookmarks.html</span> or click to
              upload
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              id="browse-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 bg-[#FF4D00] text-[#111113] text-xs font-bold uppercase tracking-wider font-mono hover:bg-[#FF6622] transition-colors inline-flex items-center gap-2"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Select HTML File</span>
            </button>

            <button
              type="button"
              id="paste-code-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowPasteModal(true);
              }}
              className="px-4 py-2 border border-white/20 text-[#F8F7F4] text-xs font-bold uppercase tracking-wider font-mono hover:border-white/60 hover:bg-white/5 transition-colors inline-flex items-center gap-2"
            >
              <Clipboard className="h-3.5 w-3.5 text-[#F8F7F4]/70" />
              <span>Paste HTML / URLs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#FF4D00]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#F8F7F4]/70 font-mono">
              Instant Sample Datasets
            </span>
          </div>
          <span className="text-[10px] text-[#F8F7F4]/40 font-mono uppercase tracking-wider">
            Click to test categorization
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_BOOKMARKS.map((preset) => (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              type="button"
              onClick={() => onLoadBookmarks(preset.rawHtml, preset.name)}
              className="group flex flex-col text-left border border-white/10 bg-[#161619] p-3.5 hover:border-[#FF4D00] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-tight text-[#F8F7F4] font-['Syne'] group-hover:text-[#FF4D00] transition-colors">
                  {preset.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 border border-white/10 text-[#FF4D00] bg-white/[0.02]">
                  {preset.itemCount} links
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#F8F7F4]/60 line-clamp-2 font-mono">
                {preset.description}
              </p>
              <div className="mt-2.5 flex items-center text-[10px] font-bold uppercase tracking-wider text-[#FF4D00] font-mono">
                <span>Load &amp; Organize</span>
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl border border-white/20 bg-[#141416] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-[#F8F7F4] uppercase font-['Syne']">
                Paste Bookmarks HTML or URLs
              </h3>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="text-white/40 hover:text-white font-mono text-sm"
              >
                [ESC]
              </button>
            </div>
            <p className="mt-2 text-xs text-[#F8F7F4]/60 font-mono">
              Paste standard Netscape HTML code, or even raw lists of website URLs.
            </p>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="<!DOCTYPE NETSCAPE-Bookmark-file-1> ... OR paste links"
              rows={10}
              className="mt-4 w-full border border-white/10 bg-[#0C0C0D] p-3 font-mono text-xs text-[#F8F7F4] placeholder-white/20 focus:border-[#FF4D00] outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 border border-white/20 text-xs font-mono font-bold uppercase text-[#F8F7F4]/70 hover:text-[#F8F7F4] hover:border-white/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim()}
                className="px-4 py-2 bg-[#FF4D00] text-[#111113] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#FF6622] disabled:opacity-40"
              >
                Process &amp; Organize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
