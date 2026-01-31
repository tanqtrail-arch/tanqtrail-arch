
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedPage, OptimizedSlideContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const optimizeSlideContent = async (
  page: ExtractedPage
): Promise<OptimizedSlideContent> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this text extracted from a PDF page and structure it for a professional presentation slide.
        Identify a catchy title and key bullet points. 
        Categorize the layout as 'title-only', 'image-text', 'text-only', or 'complex'.
        
        Text: ${page.text.substring(0, 2000)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bullets: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            suggestedLayout: { 
              type: Type.STRING,
              description: "One of: title-only, image-text, text-only, complex"
            }
          },
          required: ["title", "bullets", "suggestedLayout"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      title: result.title || "Slide " + page.pageNumber,
      bullets: result.bullets || [],
      suggestedLayout: result.suggestedLayout || 'image-text'
    };
  } catch (error) {
    console.error("Gemini optimization failed:", error);
    return {
      title: "Slide " + page.pageNumber,
      bullets: [page.text.substring(0, 500)],
      suggestedLayout: 'image-text'
    };
  }
};
