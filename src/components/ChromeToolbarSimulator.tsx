import React, { useState } from "react";
import {
  Folder,
  ChevronDown,
  ExternalLink,
  Globe,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Star,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { BookmarkFolder } from "../types/bookmark";

interface ChromeToolbarSimulatorProps {
  rootFolder: BookmarkFolder;
}

export const ChromeToolbarSimulator: React.FC<ChromeToolbarSimulatorProps> = ({ rootFolder }) => {
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  const toolbarCategories: BookmarkFolder[] = React.useMemo(() => {
    const bar = rootFolder.children.find(
      (c) =>
        "children" in c &&
        (c.title === "Bookmarks bar" || c.title === "Bookmarks Bar" || c.isToolbar),
    ) as BookmarkFolder | undefined;

    if (bar && Array.isArray(bar.children)) {
      return bar.children.filter((c) => "children" in c) as BookmarkFolder[];
    }
    return rootFolder.children.filter((c) => "children" in c) as BookmarkFolder[];
  }, [rootFolder]);

  const toggleFolder = (folderId: string) => {
    setOpenFolderId(openFolderId === folderId ? null : folderId);
  };

  return (
    <div className="border border-white/10 bg-[#161619] overflow-hidden font-mono">
      {/* Chrome Browser Window Header Frame */}
      <div className="bg-[#111113] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
        {/* Window controls dots */}
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
        </div>

        {/* Tab Preview */}
        <div className="flex items-center gap-2 bg-[#1A1A1E] px-3.5 py-1 text-xs font-bold text-[#F8F7F4] max-w-xs border-t border-x border-white/10">
          <Bookmark className="h-3 w-3 text-[#FF4D00] fill-current" />
          <span className="truncate uppercase text-[11px] font-mono">Chrome • Toolbar Preview</span>
        </div>

        <div className="w-12 text-right">
          <MoreVertical className="h-3.5 w-3.5 text-white/40 inline-block" />
        </div>
      </div>

      {/* Chrome Navigation & Omnibox bar */}
      <div className="bg-[#141416] px-4 py-2 border-b border-white/10 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-white/40">
          <button type="button" className="p-1 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 text-white/20">
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 hover:text-white">
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Omnibox */}
        <div className="flex-1 flex items-center gap-2 bg-[#0C0C0D] px-3 py-1 text-xs text-white/70 border border-white/10">
          <Lock className="h-3 w-3 text-white/30" />
          <span className="text-[#F8F7F4] font-bold">chrome://bookmarks</span>
          <span className="text-white/40 text-[10px] hidden sm:inline">
            — Imported Bookmarks Bar
          </span>
          <div className="ml-auto">
            <Star className="h-3.5 w-3.5 text-[#FF4D00] fill-current" />
          </div>
        </div>
      </div>

      {/* Chrome Bookmarks Bar (Live Simulation) */}
      <div className="relative bg-[#111113] px-3 py-1.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto select-none min-h-[38px]">
        {toolbarCategories.length === 0 ? (
          <span className="text-xs text-white/30 italic px-2">No folders in bookmarks bar</span>
        ) : (
          toolbarCategories.map((folder) => {
            const isOpen = openFolderId === folder.id;
            const childCount = folder.children?.length || 0;

            return (
              <div key={folder.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFolder(folder.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold transition-all ${
                    isOpen ? "bg-[#FF4D00] text-[#111113]" : "text-[#F8F7F4]/90 hover:bg-white/10"
                  }`}
                >
                  <Folder
                    className={`h-3 w-3 ${isOpen ? "text-[#111113] fill-[#111113]" : "text-[#FF4D00]"}`}
                  />
                  <span className="whitespace-nowrap uppercase text-[11px]">{folder.title}</span>
                  <span
                    className={`text-[10px] font-mono ${isOpen ? "text-[#111113]" : "text-white/40"}`}
                  >
                    ({childCount})
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Dropdown Menu Simulation */}
                {isOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setOpenFolderId(null)} />
                    <div className="absolute left-0 top-full mt-1 z-30 w-72 border border-white/20 bg-[#161619] p-1.5 shadow-2xl max-h-80 overflow-y-auto animate-in fade-in duration-100 font-mono">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                        <span>{folder.title}</span>
                        <span>{childCount} links</span>
                      </div>

                      {folder.children.map((child: any) => {
                        const isSubfolder = "children" in child;

                        if (isSubfolder) {
                          return (
                            <div
                              key={child.id}
                              className="flex items-center justify-between px-2.5 py-1.5 text-xs text-[#F8F7F4] hover:bg-white/10 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Folder className="h-3 w-3 text-[#FF4D00] shrink-0" />
                                <span className="truncate">{child.title}</span>
                              </div>
                              <div className="flex items-center gap-1 text-white/40">
                                <span className="text-[10px]">{child.children?.length || 0}</span>
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            </div>
                          );
                        }

                        return (
                          <a
                            key={child.id}
                            href={child.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-white/70 hover:bg-[#FF4D00]/10 hover:text-[#F8F7F4] group transition-colors"
                          >
                            {child.icon ? (
                              <img
                                src={child.icon}
                                alt=""
                                className="h-3 w-3 shrink-0 rounded-xs"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Globe className="h-3 w-3 text-white/40 group-hover:text-[#FF4D00] shrink-0" />
                            )}
                            <span className="truncate flex-1">{child.title}</span>
                            <ExternalLink className="h-3 w-3 text-white/20 opacity-0 group-hover:opacity-100 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Simulator Content Footer */}
      <div className="bg-[#141416] p-3 text-xs text-white/60 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
          <span className="text-[#F8F7F4] uppercase text-[10px] font-bold tracking-wider">
            Interactive Chrome Simulation: Click any folder above to inspect subitems
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/40 hidden sm:inline uppercase">
          {toolbarCategories.length} Categories on Bar
        </span>
      </div>
    </div>
  );
};
