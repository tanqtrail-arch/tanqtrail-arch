
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import { parsePdf } from './services/pdfService';
import { optimizeSlideContent } from './services/geminiService';
import { generatePptx } from './services/pptxService';
import { ExtractedPage, ConversionStatus, OptimizedSlideContent } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConversionStatus>({
    step: 'idle',
    progress: 0,
    message: ''
  });
  const [pages, setPages] = useState<ExtractedPage[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const reset = () => {
    setStatus({ step: 'idle', progress: 0, message: '' });
    setPages([]);
    setDownloadUrl(null);
  };

  const handleFileSelect = async (file: File) => {
    try {
      setDownloadUrl(null);
      setPages([]);
      
      // Step 1: Parsing
      setStatus({ step: 'parsing', progress: 0, message: 'PDFを読み込んでいます...' });
      const extractedPages = await parsePdf(file, (p) => {
        setStatus(prev => ({ ...prev, progress: p }));
      });
      setPages(extractedPages);

      // Step 2: Optimizing with Gemini
      setStatus({ step: 'optimizing', progress: 0, message: 'AIがスライド構成を考案中...' });
      const optimizations: OptimizedSlideContent[] = [];
      for (let i = 0; i < extractedPages.length; i++) {
        const opt = await optimizeSlideContent(extractedPages[i]);
        optimizations.push(opt);
        setStatus(prev => ({ 
          ...prev, 
          progress: ((i + 1) / extractedPages.length) * 100 
        }));
      }

      // Step 3: Generating PPTX
      setStatus({ step: 'generating', progress: 50, message: 'PowerPointを書き出し中...' });
      const blob = await generatePptx(extractedPages, optimizations);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      setStatus({ 
        step: 'completed', 
        progress: 100, 
        message: 'スライドの準備ができました！' 
      });
    } catch (error) {
      console.error(error);
      setStatus({ 
        step: 'error', 
        progress: 0, 
        message: '変換に失敗しました。ファイルが壊れているか、大きすぎる可能性があります。' 
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4">
        {status.step === 'idle' || status.step === 'error' ? (
          <FileUpload 
            onFileSelect={handleFileSelect} 
            isProcessing={false} 
          />
        ) : null}

        {status.step !== 'idle' && (
          <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                {status.step === 'completed' ? (
                  <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-lg">✓</span>
                ) : status.step === 'error' ? (
                  <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-lg">!</span>
                ) : (
                  <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
                {status.message}
              </h3>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {Math.round(status.progress)}%
              </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${status.step === 'error' ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>

            {status.step === 'completed' && downloadUrl && (
              <div className="mt-10 flex flex-col items-center space-y-4 animate-in slide-in-from-bottom-6 duration-500">
                <a 
                  href={downloadUrl} 
                  download="editable_slides.pptx"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-12 rounded-2xl shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:translate-y-0 text-center text-lg"
                >
                  PowerPoint (.pptx) をダウンロード
                </a>
                <button 
                  onClick={reset}
                  className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                >
                  別のファイルを変換する
                </button>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 mt-4 max-w-md">
                  <p className="text-amber-800 text-sm leading-relaxed">
                    <strong>ヒント:</strong> ダウンロードしたファイルを <strong>Googleドライブ</strong> にアップロードして開くと、ブラウザ上で直接編集できます。画像は背景として、テキストは編集可能なボックスとして配置されています。
                  </p>
                </div>
              </div>
            )}

            {status.step === 'error' && (
              <div className="mt-6 text-center">
                <button 
                  onClick={reset}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-xl transition-all"
                >
                  やり直す
                </button>
              </div>
            )}
          </div>
        )}

        {pages.length > 0 && status.step !== 'parsing' && (
          <div className="mt-16 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xl font-bold text-slate-800">抽出内容のプレビュー</h3>
              <span className="text-sm text-slate-400">{pages.length} ページ検出</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {pages.map((page) => (
                <div key={page.pageNumber} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                  <div className="aspect-video relative overflow-hidden bg-slate-50 border-b border-slate-50">
                    <img src={page.previewUrl} alt={`Page ${page.pageNumber}`} className="object-contain w-full h-full p-2" />
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md uppercase tracking-wider">
                      Slide {page.pageNumber}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                       <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                       <span className="text-xs font-bold text-slate-500 uppercase">Extracted Text</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {page.text || 'テキストが検出されませんでした。'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 text-center border-t border-slate-100 pt-12">
        <p className="text-slate-400 text-sm">&copy; 2024 PDF to スライド変換くん Pro - Powered by Gemini AI</p>
        <p className="text-slate-300 text-[10px] mt-2 tracking-widest uppercase">Privacy First • Client-side Processing</p>
      </footer>
    </div>
  );
};

export default App;
