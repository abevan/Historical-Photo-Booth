// FIX: Moved the `AIStudio` interface into the `declare global` block
// to ensure it correctly merges with any other global declarations.
// A module-scoped interface with the same name as a global interface
// creates a conflict, which this change resolves.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Made `aistudio` optional to align with runtime checks and resolve modifier conflicts.
    aistudio?: AIStudio;
  }
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
  name: string;
}

export interface HistoricalScene {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  // FIX: Changed imageKeywords to be an array of strings to align with API response and fix usage errors.
  imageKeywords?: string[];
}