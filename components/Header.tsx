
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 text-center">
      <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-4">
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
        PDF to スライド変換くん <span className="text-blue-600">Pro</span>
      </h1>
      <p className="text-slate-500 text-lg max-w-2xl mx-auto">
        PDFから画像とテキストを分離・抽出し、AIが最適化した編集可能なPowerPointスライドを瞬時に作成します。
      </p>
    </header>
  );
};

export default Header;
