
import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div 
      className={`relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
        isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 hover:border-blue-400 bg-white'
      } ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
    >
      <input 
        id="file-input"
        type="file" 
        accept=".pdf" 
        className="hidden" 
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
          <svg className="w-10 h-10 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          PDFファイルをドロップ
        </h3>
        <p className="text-slate-500">
          またはクリックしてファイルを選択
        </p>
        <div className="mt-8 flex gap-3 text-xs font-medium text-slate-400">
          <span className="px-3 py-1 bg-slate-100 rounded-full">最大 50MB</span>
          <span className="px-3 py-1 bg-slate-100 rounded-full">PDFのみ</span>
          <span className="px-3 py-1 bg-slate-100 rounded-full">AI最適化対応</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
