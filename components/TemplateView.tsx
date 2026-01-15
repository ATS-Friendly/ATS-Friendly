
import React from 'react';

const TemplateView = ({ onSelectTemplate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">Profesyonel Bir Şablon Seçin</h1>
        <p className="mt-2 text-gray-600">CV'niz için bir başlangıç noktası seçin.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 mt-12 md:grid-cols-2 max-w-4xl">
        <div 
            className="overflow-hidden bg-white border-4 border-transparent rounded-lg shadow-lg cursor-pointer hover:border-blue-500 hover:scale-105 transform transition-all duration-300 group"
            onClick={() => onSelectTemplate('tpl-classic')}
        >
          <div className="overflow-hidden aspect-[210/297] bg-gray-100">
            <img src="https://picsum.photos/seed/classicCV/420/594" alt="Klasik Şablon Önizleme" className="object-cover object-top w-full h-full transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold">Klasik</h3>
            <p className="text-sm text-gray-500">🏛️ Geleneksel & Akademik</p>
          </div>
        </div>
        <div 
            className="overflow-hidden bg-white border-4 border-transparent rounded-lg shadow-lg cursor-pointer hover:border-blue-500 hover:scale-105 transform transition-all duration-300 group"
            onClick={() => onSelectTemplate('tpl-compact')}
        >
          <div className="overflow-hidden aspect-[210/297] bg-gray-100">
             <img src="https://picsum.photos/seed/compactCV/420/594" alt="Kompakt Şablon Önizleme" className="object-cover object-top w-full h-full transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold">Kompakt</h3>
            <p className="text-sm text-gray-500">📄 Minimal & Tek Sayfa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

window.TemplateView = TemplateView;
