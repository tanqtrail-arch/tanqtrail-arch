
import * as pdfjsLib from 'pdfjs-dist';
import { ExtractedPage, ExtractedImage } from '../types';

// Use the same version as the importmap
const PDFJS_VERSION = '5.4.530';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;

export const parsePdf = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<ExtractedPage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const results: ExtractedPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    // Use a higher scale for better image quality in the slide
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Extract text with positioning information
    const textContent = await page.getTextContent();
    const textLines = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    // Render page to a canvas to get the "background" visual
    // We try to render WITHOUT text if possible, but standard PDF.js doesn't easily separate
    // For this app, we provide the full render as the background, which is the most robust way
    // to preserve layout for "background images".
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ 
      canvasContext: context, 
      viewport: viewport,
      // Some PDFs might have a transparent background, we want white for slides
    }).promise;
    
    // Add a white background if the PDF is transparent
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d')!;
    finalCtx.fillStyle = '#FFFFFF';
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    finalCtx.drawImage(canvas, 0, 0);

    const previewUrl = finalCanvas.toDataURL('image/png');

    results.push({
      pageNumber: i,
      text: textLines,
      images: [{
        dataUrl: previewUrl,
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      }],
      width: viewport.width,
      height: viewport.height,
      previewUrl: previewUrl
    });

    onProgress((i / numPages) * 100);
  }

  return results;
};
