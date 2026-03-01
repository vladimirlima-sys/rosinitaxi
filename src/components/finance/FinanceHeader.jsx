import React from 'react';
import { Download } from 'lucide-react';

export default function FinanceHeader({ onDownloadPDF }) {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
        <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-2">RAPPORT FINANCIER</p>
        <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3" />
      </div>

      {/* Download Button */}
      <div className="mb-8">
        <button
          onClick={onDownloadPDF}
          className="flex items-center gap-2 bg-black text-white font-bold px-5 py-2.5 rounded-lg hover:bg-black/80 transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          Télécharger PDF
        </button>
      </div>
    </div>
  );
}