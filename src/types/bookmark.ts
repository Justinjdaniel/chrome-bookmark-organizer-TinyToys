export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  addDate?: string;
  lastModified?: string;
  icon?: string;
  originalFolder?: string;
  category: string;
  subCategory?: string;
  folderPath?: string[];
  domain: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  cleanedTitle?: string;
  tags?: string[];
}

export interface BookmarkFolder {
  id: string;
  title: string;
  addDate?: string;
  lastModified?: string;
  isToolbar?: boolean;
  children: (BookmarkFolder | BookmarkItem)[];
  color?: string;
  iconName?: string;
}

export interface ParseResult {
  rootFolder: BookmarkFolder;
  flatBookmarks: BookmarkItem[];
  originalFolderCount: number;
  hasToolbar: boolean;
}

export interface CategorizationOptions {
  removeDuplicates: boolean;
  cleanTitles: boolean;
  createSubfolders: boolean;
  hierarchyDepth?: number; // 1 = Flat (Category only), 2 = Standard (Category > Subfolder), 3 = Deep (Category > Subfolder > Topic)
  targetCategoryCount?: number; // 0 = Auto (Max ~20), 5, 10, 15, 20
  stripTrackingParams: boolean;
  customCategoryMappings?: Record<string, string>;
  organizeUnderBookmarksBar: boolean;
}

export interface ChangeSummary {
  originalBookmarkCount: number;
  finalBookmarkCount: number;
  duplicatesRemoved: number;
  titlesCleaned: number;
  trackingParamsStripped: number;
  categoriesCreated: {
    name: string;
    count: number;
    subfolderCount: number;
    color: string;
    icon: string;
  }[];
  originalFolderDepth: number;
  newFolderDepth: number;
  topDomains: { domain: string; count: number }[];
  structuralHighlights: string[];
}
