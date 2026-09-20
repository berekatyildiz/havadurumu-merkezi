'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { globalCities, CityData } from '@/lib/cities';

const getCountryFlag = (countryCode: string) => {
  if (!countryCode) return '';
  return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

export default function Navbar() {
  const router = useRouter();
  
  const [searchInput, setSearchInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<CityData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim().length >= 2) {
      const matches = globalCities.filter(cityObj => 
        cityObj.name.toLocaleLowerCase('tr-TR').startsWith(value.toLocaleLowerCase('tr-TR'))
      ).slice(0, 5);
      setFilteredSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const navigateToCity = (cityName: string) => {
    const trimmed = cityName.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setSearchInput('');
    setIsGuideOpen(false);
    router.push(`/city/${encodeURIComponent(trimmed)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) navigateToCity(searchInput);
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) return alert('Tarayıcınız konum servisini desteklemiyor.');
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
          const data = await res.json();
          if (data && data.length > 0) navigateToCity(data[0].name);
        } catch (err) {
          alert('Konum verisi alınamadı.');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        alert('Konum izni reddedildi.');
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <>
      <style>{`
        @keyframes slide-down { 0% { opacity: 0; transform: translateY(-10px) scaleY(0.95); } 100% { opacity: 1; transform: translateY(0) scaleY(1); } }
        .anim-slide-down { animation: slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top; }
      `}</style>

      <nav className="w-full bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-[90] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 relative">
          
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-full sm:w-auto" onClick={() => router.push('/')}>
            <span className="text-3xl">🌤️</span> 
            <span className="text-xl font-bold tracking-tight">Hava Durumu Merkezi</span>
          </div>
          
          <div className="w-full sm:w-auto flex flex-1 max-w-[500px] items-center gap-2 relative justify-end">
            
            <button 
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 border px-3 sm:px-4 py-1.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium whitespace-nowrap z-50 flex-shrink-0 ${isGuideOpen ? 'bg-white/20 border-white/30 shadow-inner' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
            >
              <span className="text-base sm:text-lg">📖</span> 
              <span className="hidden min-[380px]:block">Kılavuz</span>
            </button>

            <form onSubmit={handleFormSubmit} className="flex-1 max-w-[250px] bg-black/50 p-1 rounded-xl border border-white/20 flex focus-within:border-blue-400 transition-colors z-50">
              <input type="text" value={searchInput} onChange={handleInputChange} onFocus={() => { if (searchInput.trim().length >= 2) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="Şehir ara..." className="flex-1 w-full min-w-[80px] bg-transparent outline-none px-2 sm:px-4 text-white placeholder-gray-400 text-sm" />
              <button type="submit" className="bg-blue-600/80 px-3 sm:px-4 py-1.5 rounded-lg hover:bg-blue-500 transition-colors font-medium text-sm">Bul</button>
            </form>

            <button onClick={handleLocationClick} disabled={locationLoading} title="Konumumu Bul" className="bg-black/50 border border-white/20 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center flex-shrink-0 disabled:opacity-50 z-50">
              {locationLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="text-lg">📍</span>}
            </button>

            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute top-full right-0 mt-2 w-full max-w-[250px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[110]">
                {filteredSuggestions.map((cityObj, index) => (
                  <li key={index} onMouseDown={(e) => { e.preventDefault(); navigateToCity(cityObj.name); }} className="px-4 py-3 hover:bg-blue-600/50 cursor-pointer transition-colors border-b border-slate-800 last:border-0 text-sm flex justify-between items-center">
                    <div><span className="font-bold text-blue-300">{cityObj.name.substring(0, searchInput.length)}</span><span>{cityObj.name.substring(searchInput.length)}</span></div>
                    <span className="text-white/50 text-xs tracking-wider">{cityObj.country} {getCountryFlag(cityObj.country)}</span>
                  </li>
                ))}
              </ul>
            )}

            {isGuideOpen && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-3 w-full sm:w-[32rem] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-[100] anim-slide-down flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
                  <h2 className="text-lg font-bold flex items-center gap-2">📖 Meteoroloji Kılavuzu</h2>
                  <button onClick={() => setIsGuideOpen(false)} className="text-white/60 hover:text-white bg-black/20 hover:bg-red-500/80 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-4 text-white/80 text-sm">
                  <section className="bg-black/20 p-3 sm:p-4 rounded-xl border border-white/5">
                    <h3 className="text-base font-semibold text-green-400 mb-1">🍃 Hava Kalitesi İndeksi (AQI)</h3>
                    <p className="leading-relaxed">Havadaki kirletici partiküllerin oranını ölçer. <strong>1/5 değeri (Yeşil) en temiz havayı</strong>, 5/5 değeri ise zehirli havayı temsil eder.</p>
                  </section>
                  <section className="bg-black/20 p-3 sm:p-4 rounded-xl border border-white/5">
                    <h3 className="text-base font-semibold text-orange-300 mb-1">🌡️ Hissedilen Sıcaklık</h3>
                    <p className="leading-relaxed">Termometrenin ölçtüğü sıcaklık ile derinin hissettiği aynı değildir. Rüzgar hızı ve nem oranı hesaba katılarak termodinamik olarak hesaplanır.</p>
                  </section>
                  <section className="bg-black/20 p-3 sm:p-4 rounded-xl border border-white/5">
                    <h3 className="text-base font-semibold text-yellow-300 mb-1">☀️ Güneş Yörüngesi ve Psikoloji</h3>
                    <p className="leading-relaxed">Sirkadiyen Ritim doğrudan ışık döngüsüne bağlıdır. Yörünge grafiği, gün ışığından ne kadar faydalanabileceğinizi ve psikolojik enerjinizi planlamanıza yardımcı olur.</p>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}