'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Key,
  ShieldCheck,
  FileCode,
  FolderTree,
  Play,
  RotateCcw,
  Download,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Moon,
  Sun,
  Github,
  CheckCircle,
  HelpCircle,
  Folder,
  FileText,
  X,
} from 'lucide-react';
import {
  parseBookmarksHtml,
  exportToNetscapeHtml,
  flattenBookmarks,
  BookmarkItem,
  FolderItem,
  BookmarkNode,
} from '@/utils/bookmarkParser';
import {
  testGeminiApiKey,
  processAllBookmarks,
  retrySingleBatch,
  ProcessingProgress,
  BatchItem,
  CategorizedItem,
} from '@/utils/geminiProcessor';

const DEFAULT_CATEGORIES = [
  'Frontend Dev',
  'Backend & Databases',
  'DevOps & Cloud',
  'AI & Machine Learning',
  'Documentation & Cheat Sheets',
  'Productivity Tools',
  'Articles & Reading',
  'Media & Entertainment',
  'Design & UI/UX',
];

const PREPOPULATED_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-pro',
];

export default function Home() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // BYOK States
  const [apiKey, setApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [customModel, setCustomModel] = useState('');

  // Bookmark Parsing States
  const [bookmarksHtml, setBookmarksHtml] = useState<string>('');
  const [parsedRoot, setParsedRoot] = useState<FolderItem | null>(null);
  const [flatBookmarks, setFlatBookmarks] = useState<BookmarkItem[]>([]);
  const [fileName, setFileName] = useState('');

  // Processing settings state
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [batchSize, setBatchSize] = useState(25);
  const [delayMs, setDelayMs] = useState(2500);
  const [folderMode, setFolderMode] = useState<
    'full_ai' | 'preserve_sub' | 'flat_list'
  >('full_ai');

  // Execution Process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [batchLogs, setBatchLogs] = useState<
    {
      index: number;
      success: boolean;
      itemsCount: number;
      error?: string;
      rawItems: BatchItem[];
    }[]
  >([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Result state
  const [organizedRoot, setOrganizedRoot] = useState<FolderItem | null>(null);
  const [outputHtml, setOutputHtml] = useState<string>('');
  const [urlCategoryMapping, setUrlCategoryMapping] = useState<
    Map<string, string>
  >(new Map());

  // Key storage sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = sessionStorage.getItem('gemini_api_key');
      const isLight = document.documentElement.classList.contains('light');
      setTimeout(() => {
        if (savedKey) {
          setApiKey(savedKey);
          setIsKeyValid(true);
        }
        setTheme(isLight ? 'light' : 'dark');
      }, 0);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      if (nextTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }
  };

  const handleSaveApiKey = async (keyToVerify: string) => {
    if (!keyToVerify.trim()) return;
    setIsValidatingKey(true);
    setIsKeyValid(null);
    const activeModel = customModel.trim() || selectedModel;
    const isValid = await testGeminiApiKey(keyToVerify, activeModel);
    setIsValidatingKey(false);
    setIsKeyValid(isValid);
    if (isValid) {
      sessionStorage.setItem('gemini_api_key', keyToVerify);
    }
  };

  const handleClearApiKey = () => {
    sessionStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsKeyValid(null);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const isHtml =
        file.type === 'text/html' || file.name.toLowerCase().endsWith('.html');
      if (!isHtml) {
        alert('Please drop a valid HTML file (.html)');
        return;
      }
      processSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBookmarksHtml(text);
      try {
        const root = parseBookmarksHtml(text);
        setParsedRoot(root);
        const flatList = flattenBookmarks(root);
        if (!flatList || flatList.length === 0) {
          alert(
            'No bookmarks found in the file. Please verify it is a valid bookmarks export with actual bookmark entries.'
          );
          setFlatBookmarks([]);
          return;
        }
        setFlatBookmarks(flatList);
      } catch (err) {
        alert(
          'Failed to parse bookmarks.html. Please verify it is a valid Google Chrome Netscape Bookmark export.'
        );
      }
    };
    reader.onerror = () => {
      alert('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategoryName('');
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleCancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const startReorganization = async () => {
    if (!apiKey) {
      alert('Please enter and verify your Gemini API key first.');
      return;
    }
    if (!flatBookmarks.length) {
      alert('Please upload a valid bookmarks.html file first.');
      return;
    }

    setIsProcessing(true);
    setProgress(null);
    setBatchLogs([]);
    setOrganizedRoot(null);
    setOutputHtml('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const activeModel = customModel.trim() || selectedModel;
    const urlCategoryMap = new Map<string, string>();

    // Validate batch size before processing
    const validBatchSize = Math.min(50, Math.max(5, batchSize)) || 25;

    // Prepare batches for logging
    const total = flatBookmarks.length;
    const initialLogs: typeof batchLogs = [];
    for (let i = 0, batchIdx = 0; i < total; i += validBatchSize, batchIdx++) {
      const chunk = flatBookmarks
        .slice(i, i + validBatchSize)
        .map((b, idx) => ({
          id: i + idx,
          url: b.url,
          title: b.title,
        }));
      initialLogs.push({
        index: batchIdx,
        success: false,
        itemsCount: chunk.length,
        rawItems: chunk,
      });
    }
    setBatchLogs(initialLogs);

    try {
      const fullMap = await processAllBookmarks(
        apiKey,
        activeModel,
        flatBookmarks,
        categories,
        customInstructions,
        validBatchSize,
        delayMs,
        (prog) => setProgress(prog),
        (batchIdx, success, items, errMsg) => {
          setBatchLogs((prev) =>
            prev.map((log) => {
              if (log.index === batchIdx) {
                return {
                  ...log,
                  success,
                  error: errMsg,
                };
              }
              return log;
            })
          );
          if (success && items) {
            for (const item of items) {
              urlCategoryMap.set(item.url, item.category);
            }
          }
        },
        controller.signal
      );

      // Store the mapping in state
      setUrlCategoryMapping(fullMap);

      // Re-assemble structure based on selected structuring mode
      const finalRoot = rebuildStructuredBookmarks(
        flatBookmarks,
        fullMap,
        folderMode
      );
      setOrganizedRoot(finalRoot);
      const output = exportToNetscapeHtml(finalRoot);
      setOutputHtml(output);
    } catch (err) {
      console.error(err);
      setProgress({
        total: flatBookmarks.length,
        processed: 0,
        currentBatch: 0,
        totalBatches: Math.ceil(flatBookmarks.length / batchSize),
        statusText: `Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        etaSeconds: 0,
      });
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const rebuildStructuredBookmarks = (
    originalBookmarks: BookmarkItem[],
    mapping: Map<string, string>,
    mode: 'full_ai' | 'preserve_sub' | 'flat_list'
  ): FolderItem => {
    const root: FolderItem = {
      type: 'folder',
      title: 'root',
      children: [],
    };

    if (mode === 'flat_list') {
      // Return a simple list of bookmarks at root
      root.children = originalBookmarks.map((b) => {
        const cat = mapping.get(b.url) || 'Uncategorized';
        return {
          ...b,
          title: `${b.title} [${cat}]`,
        };
      });
      return root;
    }

    if (mode === 'full_ai') {
      // Create top-level folders for each user specified category
      const categoryFoldersMap = new Map<string, FolderItem>();

      // Seed with standard categories
      for (const cat of categories) {
        categoryFoldersMap.set(cat, {
          type: 'folder',
          title: cat,
          children: [],
        });
      }

      // Add a fallback folder
      categoryFoldersMap.set('Uncategorized', {
        type: 'folder',
        title: 'Uncategorized',
        children: [],
      });

      for (const bookmark of originalBookmarks) {
        const cat = mapping.get(bookmark.url) || 'Uncategorized';
        let folder = categoryFoldersMap.get(cat);
        if (!folder) {
          // Dynamic category if Gemini replied with a valid non-default category
          folder = {
            type: 'folder',
            title: cat,
            children: [],
          };
          categoryFoldersMap.set(cat, folder);
        }
        folder.children.push(bookmark);
      }

      // Populate root children with non-empty folders
      for (const folder of categoryFoldersMap.values()) {
        if (folder.children.length > 0) {
          root.children.push(folder);
        }
      }

      return root;
    }

    if (mode === 'preserve_sub') {
      // Maintain top-level folder names and group within them
      if (!parsedRoot) {
        return rebuildStructuredBookmarks(
          originalBookmarks,
          mapping,
          'full_ai'
        );
      }

      // Deep copy parsedRoot structure and categorize within folders
      const resultRoot = JSON.parse(JSON.stringify(parsedRoot)) as FolderItem;
      processNodePreserve(resultRoot, mapping);
      return resultRoot;
    }

    return root;
  };

  const processNodePreserve = (
    node: BookmarkNode,
    mapping: Map<string, string>
  ) => {
    if (node.type === 'folder') {
      // Separate bookmarks and subfolders
      const subfolders = node.children.filter(
        (c) => c.type === 'folder'
      ) as FolderItem[];
      const bookmarks = node.children.filter(
        (c) => c.type === 'bookmark'
      ) as BookmarkItem[];

      // Group bookmarks in this folder by their category
      const groupedMap = new Map<string, BookmarkItem[]>();
      for (const b of bookmarks) {
        const cat = mapping.get(b.url) || 'Uncategorized';
        if (!groupedMap.has(cat)) {
          groupedMap.set(cat, []);
        }
        groupedMap.get(cat)!.push(b);
      }

      // Create structured category folders within this folder
      const categorizedSubfolders: FolderItem[] = [];
      for (const [catName, list] of groupedMap.entries()) {
        categorizedSubfolders.push({
          type: 'folder',
          title: catName,
          children: list,
        });
      }

      // Recursively run on existing subfolders
      for (const sf of subfolders) {
        processNodePreserve(sf, mapping);
      }

      node.children = [...categorizedSubfolders, ...subfolders];
    }
  };

  const handleRetrySpecificBatch = async (batchIdx: number) => {
    if (!apiKey) return;
    const log = batchLogs[batchIdx];
    if (!log) return;

    const activeModel = customModel.trim() || selectedModel;

    try {
      // Show pending in logs UI
      setBatchLogs((prev) =>
        prev.map((item) => {
          if (item.index === batchIdx) {
            return {
              ...item,
              error: 'Retrying manually...',
            };
          }
          return item;
        })
      );

      // Use retrySingleBatch for retry with schema validation and backoff
      const categorized = await retrySingleBatch(
        apiKey,
        activeModel,
        log.rawItems,
        categories,
        customInstructions
      );

      // Update mapping and local logs
      setBatchLogs((prev) =>
        prev.map((item) => {
          if (item.index === batchIdx) {
            return {
              ...item,
              success: true,
              error: undefined,
            };
          }
          return item;
        })
      );

      // Merge returned categories into the mapping
      const updatedMapping = new Map(urlCategoryMapping);
      for (const item of categorized) {
        updatedMapping.set(item.url, item.category);
      }
      setUrlCategoryMapping(updatedMapping);

      // Rebuild the export/download structure
      const finalRoot = rebuildStructuredBookmarks(
        flatBookmarks,
        updatedMapping,
        folderMode
      );
      setOrganizedRoot(finalRoot);
      const output = exportToNetscapeHtml(finalRoot);
      setOutputHtml(output);

      alert(
        `Batch ${batchIdx + 1} sorted successfully! Export has been updated.`
      );
    } catch (err) {
      console.error(err);
      alert(
        `Manual retry failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const downloadSortedHtmlFile = () => {
    if (!outputHtml) return;
    const blob = new Blob([outputHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookmarks_sorted.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header navbar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Gemini Bookmarks Organizer
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                100% Client-side privacy & smart reorganization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <a
              href="https://github.com/Justinjdaniel/chrome-bookmark-organizer-TinyToys"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              aria-label="View source on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Info Banner */}
        <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Server-Side Logging
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tidy Up Your Browser Safely
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Upload your raw Chrome <b>bookmarks.html</b>, input your personal
              Gemini API Key, and organize them dynamically. Your key is stored
              locally inside <code>sessionStorage</code> and requests go
              directly to Google&apos;s Generative AI API endpoints from your
              browser.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-950/40 p-3 rounded-lg border border-gray-200 dark:border-gray-800/80">
            <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Close tab to completely destroy API key traces.</span>
          </div>
        </div>

        {/* Configurations Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: API Key & Bookmarks Upload */}
          <div className="lg:col-span-5 space-y-8">
            {/* Step 1: BYOK Settings */}
            <div className="bg-white dark:bg-[#0c1220] border border-gray-200 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-indigo-500">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  1. Bring Your Own Key (BYOK)
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Gemini API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setIsKeyValid(null);
                      }}
                      placeholder="AIzaSy..."
                      className="flex-grow px-4 py-2 text-sm bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-gray-900 dark:text-white"
                    />
                    {apiKey && isKeyValid ? (
                      <button
                        onClick={handleClearApiKey}
                        className="px-3 py-2 text-xs text-red-500 border border-red-500/20 hover:bg-red-500/10 rounded-xl transition"
                      >
                        Clear
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSaveApiKey(apiKey)}
                        disabled={isValidatingKey || !apiKey}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {isValidatingKey ? 'Verifying...' : 'Verify'}
                      </button>
                    )}
                  </div>
                  {isKeyValid === true && (
                    <p className="text-xs text-green-500 mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> API Key
                      successfully verified & ready.
                    </p>
                  )}
                  {isKeyValid === false && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> API Key
                      verification failed. Verify your key structure.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Gemini Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setCustomModel('');
                        setIsKeyValid(null);
                      }}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-xl text-gray-900 dark:text-white"
                    >
                      {PREPOPULATED_MODELS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Custom Model ID
                    </label>
                    <input
                      type="text"
                      value={customModel}
                      onChange={(e) => {
                        setCustomModel(e.target.value);
                        setIsKeyValid(null);
                      }}
                      placeholder="e.g. gemini-2.0-pro-exp"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Bookmarks File Source */}
            <div className="bg-white dark:bg-[#0c1220] border border-gray-200 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-blue-500">
                <FileCode className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  2. Upload bookmarks.html
                </h3>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-950/10"
              >
                <input
                  type="file"
                  accept=".html"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bookmarks-file-upload"
                />
                <label
                  htmlFor="bookmarks-file-upload"
                  className="cursor-pointer space-y-3 block"
                >
                  <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl inline-block">
                    <Folder className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {fileName ? (
                      <span className="text-blue-500 font-semibold">
                        {fileName}
                      </span>
                    ) : (
                      <span>
                        Drag &amp; drop bookmarks.html or click to browse
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Supports Netscape HTML bookmark files exported from
                    Chrome/Firefox
                  </p>
                </label>
              </div>

              {flatBookmarks.length > 0 && (
                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-blue-500">
                    <FileText className="w-5 h-5" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Parsed File
                      </h4>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {flatBookmarks.length} Bookmarks Found
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFileName('');
                      setBookmarksHtml('');
                      setParsedRoot(null);
                      setFlatBookmarks([]);
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Clear parsed file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Custom Categorization & Run Options */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 3: Categorization & Rules Setting */}
            <div className="bg-white dark:bg-[#0c1220] border border-gray-200 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-500">
                  <FolderTree className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    3. Configure AI Categories
                  </h3>
                </div>
                <button
                  onClick={() => setCategories(DEFAULT_CATEGORIES)}
                  className="text-xs font-semibold text-purple-500 hover:underline"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                    Target Categories ({categories.length})
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1.5 border border-gray-100 dark:border-gray-800/80 rounded-xl bg-gray-50/50 dark:bg-gray-950/20">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/10"
                      >
                        {cat}
                        <button
                          onClick={() => removeCategory(cat)}
                          className="hover:text-red-500 transition-colors"
                          aria-label={`Remove category ${cat}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                      placeholder="Add custom category label..."
                      className="flex-grow px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={addCategory}
                      className="px-3.5 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition"
                      aria-label="Add category"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Structuring Model Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setFolderMode('full_ai')}
                      className={`p-3.5 rounded-xl border text-left space-y-1 transition ${
                        folderMode === 'full_ai'
                          ? 'border-purple-500 bg-purple-500/5 text-purple-900 dark:text-purple-400'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                      }`}
                    >
                      <h4 className="text-xs font-bold">
                        Full AI Reorganization
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Flatten everything, fully categorize from scratch.
                      </p>
                    </button>
                    <button
                      onClick={() => setFolderMode('preserve_sub')}
                      className={`p-3.5 rounded-xl border text-left space-y-1 transition ${
                        folderMode === 'preserve_sub'
                          ? 'border-purple-500 bg-purple-500/5 text-purple-900 dark:text-purple-400'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                      }`}
                    >
                      <h4 className="text-xs font-bold">
                        Preserve top-level folders
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Sort and create categories inside existing folder
                        structures.
                      </p>
                    </button>
                    <button
                      onClick={() => setFolderMode('flat_list')}
                      className={`p-3.5 rounded-xl border text-left space-y-1 transition ${
                        folderMode === 'flat_list'
                          ? 'border-purple-500 bg-purple-500/5 text-purple-900 dark:text-purple-400'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                      }`}
                    >
                      <h4 className="text-xs font-bold">Export Flat List</h4>
                      <p className="text-[11px] text-gray-400">
                        Append category metadata tag at the end of each link.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Batch Size (URLs per Request)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={batchSize}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setBatchSize(25);
                          return;
                        }
                        const num = Number(val);
                        if (isNaN(num)) {
                          setBatchSize(25);
                          return;
                        }
                        const clamped = Math.min(50, Math.max(5, num));
                        setBatchSize(clamped);
                      }}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-xl text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Sequential Rate Limit Delay (ms)
                    </label>
                    <input
                      type="number"
                      min="500"
                      max="10000"
                      step="500"
                      value={delayMs}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setDelayMs(2500);
                          return;
                        }
                        const num = Number(val);
                        if (isNaN(num)) {
                          setDelayMs(2500);
                          return;
                        }
                        const clamped = Math.min(10000, Math.max(500, num));
                        setDelayMs(clamped);
                      }}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-xl text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Custom Prompt / Categorization Guidelines
                  </label>
                  <textarea
                    rows={2}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Always place Github URLs under Frontend Dev, prioritize academic articles to Reading List."
                    className="w-full px-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Trigger Row */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <div>
                  {isProcessing ? (
                    <button
                      onClick={handleCancelProcessing}
                      className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md"
                    >
                      <X className="w-4 h-4" /> Cancel Process
                    </button>
                  ) : (
                    <button
                      onClick={startReorganization}
                      disabled={!apiKey || !flatBookmarks.length}
                      className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-500/10 disabled:opacity-40"
                    >
                      <Play className="w-4 h-4" /> Start AI Categorization
                    </button>
                  )}
                </div>

                {outputHtml && (
                  <button
                    onClick={downloadSortedHtmlFile}
                    className="px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-green-500/10"
                  >
                    <Download className="w-4 h-4" /> Download
                    bookmarks_sorted.html
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Processing progress console & logs */}
        {(progress || batchLogs.length > 0) && (
          <div className="bg-white dark:bg-[#0c1220] border border-gray-200 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RefreshCw
                className={`w-5 h-5 text-indigo-500 ${isProcessing ? 'animate-spin' : ''}`}
              />
              AI Sequential Processing Terminal
            </h3>

            {progress && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span>
                    Batch {progress.currentBatch} of {progress.totalBatches}
                  </span>
                  <span>{progress.statusText}</span>
                  {progress.etaSeconds > 0 && (
                    <span>Est. Remaining Time: ~{progress.etaSeconds}s</span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{
                      width: `${Math.round((progress.processed / progress.total) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {progress.processed} of {progress.total} total links processed
                  ({Math.round((progress.processed / progress.total) * 100)}%)
                </div>
              </div>
            )}

            {/* Batch items feedback terminal */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Console Batch History Logs
              </label>
              <div className="max-h-72 overflow-y-auto border border-gray-100 dark:border-gray-800/80 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-950/40 space-y-3.5 font-mono text-xs">
                {batchLogs.map((log) => (
                  <div
                    key={log.index}
                    className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800/40 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${log.success ? 'bg-green-500' : 'bg-amber-500'}`}
                        ></span>
                        <span className="font-bold text-gray-800 dark:text-gray-300">
                          Batch #{log.index + 1} ({log.itemsCount} URLs)
                        </span>
                        {log.error && (
                          <span className="text-red-500 text-[11px] font-semibold">
                            {log.error}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-[11px] max-w-lg truncate">
                        {log.rawItems.map((item) => item.title).join(', ')}
                      </div>
                    </div>

                    {!log.success && log.error && (
                      <button
                        onClick={() => handleRetrySpecificBatch(log.index)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shrink-0 text-[10px]"
                      >
                        Retry Batch
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800/80 py-8 bg-gray-50 dark:bg-[#070b13] transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 space-y-1">
          <p>
            © {new Date().getFullYear()} AI Chrome Bookmark Organizer. All
            rights reserved.
          </p>
          <p>
            This application is governed strictly by the Bring Your Own Key
            security structure. No personal data, configurations, or credentials
            ever leave your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
