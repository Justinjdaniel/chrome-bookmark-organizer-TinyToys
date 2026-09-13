/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { BYOKConfig } from "../components/BYOKSettingsModal";
import { BookmarkItem } from "../types/bookmark";

export interface AICategorizationRequest {
  bookmarks: BookmarkItem[];
  customInstructions?: string;
  targetCategoryCount?: number; // 0 = Auto (max 20), 5, 10, 15, 20
  hierarchyDepth?: number; // 1 = Flat, 2 = Standard, 3 = Deep
  byokConfig: BYOKConfig;
}

export interface AIClassificationResult {
  id: string;
  category: string;
  subCategory?: string;
  cleanedTitle?: string;
  confidence?: number;
  reason?: string;
}

export interface AICategorizationResponse {
  success: boolean;
  classifications: AIClassificationResult[];
  modelUsed: string;
  executionMode: "client-direct";
  totalProcessed: number;
}

/** Executes AI bookmark classification directly from the browser with the user's BYOK key. */
export async function executeAICategorization(
  req: AICategorizationRequest,
): Promise<AICategorizationResponse> {
  const {
    bookmarks,
    customInstructions,
    targetCategoryCount = 0,
    hierarchyDepth = 2,
    byokConfig,
  } = req;

  if (!bookmarks || bookmarks.length === 0) {
    throw new Error("No bookmarks provided for AI categorization.");
  }

  const itemsToProcess = bookmarks.slice(0, 150).map((b, idx) => ({
    id: b.id || `bm_${idx}`,
    title: b.title || "",
    url: b.url || "",
  }));

  const catCountNum = typeof targetCategoryCount === "number" ? targetCategoryCount : 0;
  const depthNum = typeof hierarchyDepth === "number" ? hierarchyDepth : 2;

  const directApiKey = byokConfig.useBYOK ? byokConfig.apiKey.trim() : "";

  if (!directApiKey) {
    throw new Error(
      "BYOK API key required: open BYOK Settings and enter your Gemini API key. This deployment runs fully in the browser.",
    );
  }

  try {
    const apiKey = directApiKey;
    const modelToUse = byokConfig.model.trim() || "gemini-3.7-flash";

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build-client",
        },
      },
    });

    let categoryCountInstruction = "";
    if (catCountNum > 0) {
      const clampedCount = Math.min(20, Math.max(3, catCountNum));
      categoryCountInstruction = `CRITICAL CATEGORY CONSTRAINT: Target creating approximately ${clampedCount} high-level distinct categories in total across all bookmarks (strict maximum ceiling of 20 categories). Consolidate related domains under these ${clampedCount} categories so the user does not get too many scattered folders.`;
    } else {
      categoryCountInstruction = `CRITICAL CATEGORY CONSTRAINT: Automatically determine the optimal number of intuitive categories based on the content, but STRICTLY LIMIT the total number of distinct main categories to a maximum ceiling of 20 to avoid fragmentation.`;
    }

    let hierarchyInstruction = "";
    if (depthNum === 1) {
      hierarchyInstruction = `HIERARCHY DEPTH = 1 (FLAT): Do NOT create any subfolders. Set "subCategory" to "" (empty string) or null for all bookmarks. All bookmarks must sit directly in their primary category folder.`;
    } else if (depthNum === 3) {
      hierarchyInstruction = `HIERARCHY DEPTH = 3 (DEEP): Create a 2-tier subfolder path inside "subCategory" using the format "Subfolder / Topic" (for example: "Frontend / React", "AI / LLM Frameworks", "Cloud / CI-CD", "Finance / Invoicing") for granular grouping.`;
    } else {
      hierarchyInstruction = `HIERARCHY DEPTH = 2 (STANDARD): Create clean, single-tier subfolder names inside "subCategory" (for example: "Frontend", "Databases", "Streaming", "Banking", "Documentation").`;
    }

    const prompt = `You are an expert information architect and browser bookmark taxonomy specialist.
Analyze the following list of web bookmarks and organize each into an intuitive, clean browser folder structure.

${categoryCountInstruction}

${hierarchyInstruction}

General Guidelines:
- Categories must be clear, professional, and practical for daily browser navigation.
- Clean up bloated or noisy website titles (strip YouTube suffixes, notification counters, redundant SEO slogans).
${customInstructions ? `- User custom requirements: ${customInstructions}` : ""}

Bookmarks to classify:
${JSON.stringify(itemsToProcess, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING, description: "Main category folder name" },
              subCategory: { type: Type.STRING, description: "Subfolder name or path (optional)" },
              cleanedTitle: { type: Type.STRING, description: "Clean, readable bookmark title" },
              confidence: { type: Type.NUMBER, description: "Confidence score 0.0-1.0" },
              reason: { type: Type.STRING, description: "Brief rationale for grouping" },
            },
            required: ["id", "category", "cleanedTitle"],
          },
        },
      },
    });

    const resultText = response.text || "[]";
    const classifications = JSON.parse(resultText);

    return {
      success: true,
      classifications,
      modelUsed: modelToUse,
      executionMode: "client-direct",
      totalProcessed: itemsToProcess.length,
    };
  } catch (clientErr: any) {
    console.warn("Direct client Gemini call error:", clientErr);
    throw new Error(
      clientErr.message || "Direct Gemini API call failed. Check your API key and network.",
      {
        cause: clientErr,
      },
    );
  }
}
