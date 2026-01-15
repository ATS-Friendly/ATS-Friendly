
import React from 'react';
import type { View } from '../App';

interface LandingViewProps {
  setView: (view: View) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ setView }) => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white shadow-sm md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 text-xl font-bold text-white bg-gray-800 rounded-md">AF</div>
          <div className="text-lg font-bold text-gray-800">ATS-Friendly</div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-gray-700 hover:text-blue-600" onClick={() => setView('auth')}>Giriş Yap</button>
          <button className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700" onClick={() => setView('auth')}>Kayıt Ol</button>
        </div>
      </header>

      <main className="grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 mx-auto md:grid-cols-2 md:py-24 lg:py-32 md:px-10">
        <div className="flex flex-col justify-center text-center md:text-left">
          <h1 className="text-4xl font-extrabold leading-tight text-gray-800 md:text-5xl lg:text-6xl">
            İşe Alım Robotlarını<br />
            <span className="text-blue-600">Yenecek CV'nizi Oluşturun</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 md:text-xl">
            Modern işe alım sistemleri (ATS) ile %100 uyumlu, profesyonel ve sade CV'ler hazırlayın. Üstelik tamamen ücretsiz.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 mt-8 sm:flex-row md:justify-start">
            <button className="w-full px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700" onClick={() => setView('auth')}>Hemen Ücretsiz Başla</button>
            <button className="w-full px-8 py-4 text-lg font-bold text-gray-700 bg-gray-200 rounded-lg sm:w-auto hover:bg-gray-300" onClick={scrollToFeatures}>Nasıl Çalışır?</button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm p-2 transition-transform duration-500 transform bg-white border border-gray-200 rounded-xl shadow-2xl hover:scale-105 hover:rotate-[-1deg]">
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
            <div className="p-6">
              <div className="w-3/5 h-6 mb-4 bg-gray-200 rounded-md"></div>
              <div className="w-4/5 h-4 mb-6 bg-gray-200 rounded-md"></div>
              <div className="w-full h-4 mb-2 bg-gray-200 rounded-md"></div>
              <div className="w-full h-4 mb-2 bg-gray-200 rounded-md"></div>
              <div className="w-2/3 h-4 bg-gray-200 rounded-md"></div>
              <div className="inline-block px-4 py-2 mt-6 font-bold text-white bg-green-500 rounded-full">ATS Score: 98/100</div>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="py-20 bg-gray-50">
        <div className="grid max-w-6xl grid-cols-1 gap-8 px-6 mx-auto md:grid-cols-3 md:px-10">
          <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="mb-4 text-5xl">🤖</div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">ATS Dostu Format</h3>
            <p className="text-gray-600">Karmaşık grafikler yok. İnsan kaynakları yazılımlarının (ATS) kolayca okuyabileceği temiz kod yapısı.</p>
          </div>
          <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="mb-4 text-5xl">💸</div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">%100 Ücretsiz</h3>
            <p className="text-gray-600">Gizli ödeme yok, filigran yok. Sınırsız düzenleme ve PDF indirme hakkı.</p>
          </div>
          <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="mb-4 text-5xl">☁️</div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">Bulut Kayıt</h3>
            <p className="text-gray-600">CV'niz bulutta güvende. İstediğiniz cihazdan (PC veya Mobil) kaldığınız yerden devam edin.</p>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center bg-white border-t border-gray-200">
        <p className="text-sm text-gray-500">&copy; 2024 ATS-Friendly CV Maker. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default LandingView;
