
import pptxgen from "pptxgenjs";
import { ExtractedPage, OptimizedSlideContent } from "../types";

export const generatePptx = async (
  pages: ExtractedPage[],
  optimizations: OptimizedSlideContent[]
): Promise<Blob> => {
  const pptx = new pptxgen();
  
  // Set layout to Widescreen (16x9)
  pptx.layout = 'LAYOUT_16x9';

  pages.forEach((page, index) => {
    const slide = pptx.addSlide();
    const opt = optimizations[index];

    // 1. Add Background Image (the extracted page visual)
    // We set it as the slide background to make it stay at the bottom
    if (page.images.length > 0) {
      slide.addImage({
        data: page.images[0].dataUrl,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%'
      });
    }

    // 2. Add an editable Text Box at the side (as per Python app behavior)
    // This allows users to easily copy-paste or refer to the extracted text
    slide.addText("【抽出・要約テキスト】", {
      x: 7.5,
      y: 0.5,
      w: 5.5,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: '0078D4',
      fill: { color: 'F3F3F3', transparency: 20 }
    });

    slide.addText(opt.bullets.join('\n'), {
      x: 7.5,
      y: 1.0,
      w: 5.5,
      h: 6.0,
      fontSize: 12,
      color: '333333',
      bullet: true,
      valign: 'top',
      fill: { color: 'FFFFFF', transparency: 10 },
      line: { color: 'E1E1E1', width: 1 }
    });

    // 3. Add original full text to Speaker Notes (essential for recovery)
    slide.addNotes(page.text);

    // 4. Add a Title overlay if AI suggested one
    if (opt.title) {
        slide.addText(opt.title, {
            x: 0.5,
            y: 0.2,
            w: 7.0,
            h: 0.8,
            fontSize: 24,
            bold: true,
            color: '000000',
            fill: { color: 'FFFFFF', transparency: 50 }
        });
    }
  });

  const buffer = await pptx.write('arraybuffer');
  return new Blob([buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
};
