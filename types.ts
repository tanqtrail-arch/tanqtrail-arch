
export interface ExtractedPage {
  pageNumber: number;
  text: string;
  images: ExtractedImage[];
  width: number;
  height: number;
  previewUrl: string;
}

export interface ExtractedImage {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConversionStatus {
  step: 'idle' | 'parsing' | 'optimizing' | 'generating' | 'completed' | 'error';
  progress: number;
  message: string;
}

export interface OptimizedSlideContent {
  title: string;
  bullets: string[];
  suggestedLayout: 'title-only' | 'image-text' | 'text-only' | 'complex';
}
