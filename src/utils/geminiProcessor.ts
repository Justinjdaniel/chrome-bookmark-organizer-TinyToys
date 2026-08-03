import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { BookmarkItem } from './bookmarkParser';

export interface BatchItem {
  id: number;
  url: string;
  title: string;
}

export interface CategorizedItem {
  url: string;
  category: string;
}

export interface ProcessingProgress {
  total: number;
  processed: number;
  currentBatch: number;
  totalBatches: number;
  statusText: string;
  etaSeconds: number;
}

export type BatchCallback = (
  batchIndex: number,
  success: boolean,
  categorizedItems?: CategorizedItem[],
  errorMessage?: string
) => void;

/**
 * Validates a Gemini API key by listing or attempting a simple token check/generation.
 */
export async function testGeminiApiKey(
  apiKey: string,
  modelName: string = 'gemini-1.5-flash'
): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: 'Hello, respond with exactly OK' }] },
      ],
    });
    const text = result.response.text();
    return text.length > 0;
  } catch (error) {
    console.error('Gemini API verification failed:', error);
    return false;
  }
}

/**
 * Categorizes a batch of bookmarks using Gemini API with retry and structured output.
 */
async function processBatchWithRetry(
  apiKey: string,
  modelName: string,
  items: BatchItem[],
  categories: string[],
  customInstructions: string,
  attempt: number = 1,
  maxAttempts: number = 3,
  signal?: AbortSignal
): Promise<CategorizedItem[]> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // We enforce structured output format using responseSchema
    const schema: Schema = {
      description:
        'List of categorized links matching the provided categories exactly',
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          url: {
            type: SchemaType.STRING,
            description: 'The original URL that was passed in',
          },
          category: {
            type: SchemaType.STRING,
            description:
              'The matched category from the provided list. Must be one of the listed categories.',
          },
        },
        required: ['url', 'category'],
      },
    };

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      },
      systemInstruction: `You are an advanced bookmark categorizer. Your task is to organize bookmarks into the allowed set of categories.
You MUST output a valid JSON array of objects. Each object MUST have keys: 'url' and 'category'.
The 'category' value MUST be chosen strictly from this allowed list of categories:
${categories.map((c) => `- ${c}`).join('\n')}

If a bookmark doesn't fit perfectly, choose the single best fit.
Custom organizational instructions: ${customInstructions || 'None provided'}`,
    });

    const prompt = `Categorize the following bookmarks:\n${JSON.stringify(items, null, 2)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    // Validate that the parsed result is an array of valid objects
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid response: expected an array');
    }

    // Create a set of submitted URLs for validation
    const submittedUrls = new Set(items.map((item) => item.url));

    // Validate that categories returned are actually in the requested list (case-insensitive correction can be done)
    const normalizedCategories = categories.map((c) => c.toLowerCase().trim());
    const validated: CategorizedItem[] = [];

    for (const item of parsed) {
      // Validate structure
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof item.url !== 'string' ||
        typeof item.category !== 'string'
      ) {
        continue; // Skip invalid entries
      }

      // Only include items whose URL was actually submitted
      if (!submittedUrls.has(item.url)) {
        continue;
      }

      const matchIndex = normalizedCategories.indexOf(
        item.category.toLowerCase().trim()
      );
      if (matchIndex !== -1) {
        validated.push({
          url: item.url,
          category: categories[matchIndex], // keep original case
        });
      } else {
        validated.push({
          url: item.url,
          category: 'Uncategorized',
        });
      }
    }

    return validated;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Processing aborted by user');
    }

    if (attempt < maxAttempts) {
      const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
      console.warn(
        `Attempt ${attempt} failed. Retrying in ${delayMs}ms... Error:`,
        error
      );

      // Abortable wait
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delayMs);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Processing aborted by user'));
          });
        }
      });

      if (signal?.aborted) {
        throw new Error('Processing aborted by user');
      }

      return processBatchWithRetry(
        apiKey,
        modelName,
        items,
        categories,
        customInstructions,
        attempt + 1,
        maxAttempts,
        signal
      );
    }
    throw error;
  }
}

/**
 * Runs a complete bookmark classification job on all items with progress callbacks.
 */
export async function processAllBookmarks(
  apiKey: string,
  modelName: string,
  bookmarks: bookmarksParser_BookmarkItem[],
  categories: string[],
  customInstructions: string,
  batchSize: number = 25,
  delayBetweenBatchesMs: number = 2500,
  onProgress: (progress: ProcessingProgress) => void,
  onBatchComplete: BatchCallback,
  signal?: AbortSignal
): Promise<Map<string, string>> {
  // Alias bookmarks to match imports
  const bookmarksItems = bookmarks as BookmarkItem[];
  const resultMapping = new Map<string, string>(); // url -> category
  const total = bookmarksItems.length;

  // Chunk bookmarks into batches
  const batches: BatchItem[][] = [];
  for (let i = 0; i < total; i += batchSize) {
    const chunk = bookmarksItems.slice(i, i + batchSize).map((b, idx) => ({
      id: i + idx,
      url: b.url,
      title: b.title,
    }));
    batches.push(chunk);
  }

  const totalBatches = batches.length;
  let processed = 0;
  let failedBatchCount = 0;
  let wasAborted = false;

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    if (signal?.aborted) {
      wasAborted = true;
      onProgress({
        total,
        processed,
        currentBatch: batchIdx,
        totalBatches,
        statusText: 'Processing aborted by user.',
        etaSeconds: 0,
      });
      break;
    }

    const currentBatchItems = batches[batchIdx];
    const statusText = `Processing batch ${batchIdx + 1} of ${totalBatches}...`;

    // Estimate ETA based on average delay and remaining batches
    const remainingBatches = totalBatches - batchIdx;
    const etaSeconds = Math.ceil(
      (remainingBatches * delayBetweenBatchesMs) / 1000
    );

    onProgress({
      total,
      processed,
      currentBatch: batchIdx + 1,
      totalBatches,
      statusText,
      etaSeconds,
    });

    try {
      const categorized = await processBatchWithRetry(
        apiKey,
        modelName,
        currentBatchItems,
        categories,
        customInstructions,
        1,
        3,
        signal
      );

      for (const item of categorized) {
        resultMapping.set(item.url, item.category);
      }

      processed += currentBatchItems.length;
      onBatchComplete(batchIdx, true, categorized);
    } catch (error) {
      console.error(`Failed to process batch ${batchIdx + 1}:`, error);
      const errMsg = error instanceof Error ? error.message : String(error);
      onBatchComplete(batchIdx, false, undefined, errMsg);
      failedBatchCount++;

      // We do not stop execution immediately; if failed, we keep the original URLs categorized as 'Uncategorized'
      // and allow the caller to handle manual retry for this batch specifically or skip it.
      for (const item of currentBatchItems) {
        resultMapping.set(item.url, 'Uncategorized');
      }
      processed += currentBatchItems.length;
    }

    // Delay between batches (only if there are subsequent batches)
    if (batchIdx < totalBatches - 1 && !signal?.aborted) {
      const delayStatusText = `Waiting ${delayBetweenBatchesMs / 1000}s to avoid rate limits...`;
      onProgress({
        total,
        processed,
        currentBatch: batchIdx + 1,
        totalBatches,
        statusText: delayStatusText,
        etaSeconds: Math.ceil(
          ((remainingBatches - 1) * delayBetweenBatchesMs) / 1000
        ),
      });

      // Abortable wait between batches
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delayBetweenBatchesMs);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Processing aborted by user'));
          });
        }
      }).catch(() => {
        // Aborted, will be caught by the next signal check
      });

      if (signal?.aborted) {
        wasAborted = true;
        break;
      }
    }
  }

  // Determine final status message
  let finalStatusText: string;
  if (wasAborted) {
    finalStatusText = 'Processing aborted by user.';
  } else if (failedBatchCount > 0) {
    finalStatusText = `Processing completed with ${failedBatchCount} batch(es) failed.`;
  } else {
    finalStatusText = 'All batches processed successfully!';
  }

  onProgress({
    total,
    processed,
    currentBatch: totalBatches,
    totalBatches,
    statusText: finalStatusText,
    etaSeconds: 0,
  });

  return resultMapping;
}

/**
 * Specifically processes a single failed batch manually.
 */
export async function retrySingleBatch(
  apiKey: string,
  modelName: string,
  batchItems: BatchItem[],
  categories: string[],
  customInstructions: string
): Promise<CategorizedItem[]> {
  return processBatchWithRetry(
    apiKey,
    modelName,
    batchItems,
    categories,
    customInstructions,
    1,
    3
  );
}

// Temporary compatibility type helper for the module local types
type bookmarksParser_BookmarkItem = BookmarkItem;
