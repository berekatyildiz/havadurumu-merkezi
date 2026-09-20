'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { globalCities, CityData } from '@/lib/cities';

const getCountryFlag = (countryCode: string) => {
  if (!countryCode) return '';
  return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

export default function Navbar() {
  const router = useRouter();
  const { name } = useParams();
  const decodedCity = name ? decodeURIComponent(name as string) : null;
  
  const [searchInput, setSearchInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<CityData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // CTO DOKUNUŞU: DİNAMİK İZLANDA (MORPHING) STATE'LERİ
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGuideOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isGuideOpen]);

  // Arama aktifleşince input'a odaklan
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

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
    setIsExpanded(false); // Kapat
    setIsSearchActive(false); // Arama modunu kapat
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
        
        /* DİNAMİK İZLANDA GEÇİŞ EFEKTLERİ */
        .island-transition { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      {/* CTO DOKUNUŞU: YÜZEN DİNAMİK İZLANDA (PILL) KONTEYNERİ */}
      <nav className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4">
        <div 
          className={`island-transition bg-black/80 backdrop-blur-lg border border-white/20 rounded-full shadow-2xl flex items-center overflow-hidden h-14 ${isExpanded ? 'w-full max-w-[600px] px-2' : 'w-[250px] px-3'}`}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => { if (!isSearchActive && !isGuideOpen) setIsExpanded(false); }}
          onClick={() => setIsExpanded(true)}
        >
          
          {/* İZLANDA İÇERİĞİ: MORPHING DÜZEN */}
          <div className="flex items-center justify-between w-full relative">

            {/* SOL KISIM: Logo veya Şehir Adı (Context Awareness) */}
            <div className={`island-transition flex items-center gap-2 ${isExpanded ? 'opacity-100' : 'opacity-100'}`}>
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => router.push('/')}>
                <span className="text-2xl">🌤️</span> 
                {/* Genişleyince tam adı göster, kapalıyken context ismini göster */}
                {isExpanded ? (
                  <span className="text-sm font-bold tracking-tight text-white/90">Merkez</span>
                ) : (
                  <span className="text-sm font-bold tracking-tight text-white/90">
                    {decodedCity ? decodedCity.substring(0, 15) + (decodedCity.length > 15 ? '...' : '') : 'Hava Durumu'}
                  </span>
                )}
              </div>
            </div>

            {/* ORTA KISIM: Arama/Kontroller (Genişleyince Belirir) */}
            <div className={`island-transition flex-1 flex items-center justify-center gap-2 ${isExpanded ? 'opacity-100 scale-100 px-3' : 'opacity-0 scale-90 w-0'}`}>
              
              {/* Kılavuz Butonu */}
              <button 
                onClick={() => { setIsGuideOpen(!isGuideOpen); setIsSearchActive(false); }}
                className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-medium whitespace-nowrap z-50 ${isGuideOpen ? 'bg-white/20 border-white/30 shadow-inner' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
              >
                <span className="text-base">📖</span> 
                <span className="hidden min-[450px]:block">Kılavuz</span>
              </button>

              {/* Arama Formu - Tıklayınca Genişlesin */}
              <form onSubmit={handleFormSubmit} className={`island-transition flex items-center bg-black/50 rounded-full border border-white/20 ${isSearchActive ? 'flex-1 focus-within:border-blue-400 px-1 py-1' : 'w-10 h-10 border-none'}`}>
                {isSearchActive ? (
                  <>
                    <input ref={searchInputRef} type="text" value={searchInput} onChange={handleInputChange} onFocus={() => { if (searchInput.trim().length >= 2) setShowSuggestions(true); }} placeholder="Şehir ara..." className="flex-1 w-full min-w-[80px] bg-transparent outline-none px-3 text-white placeholder-gray-400 text-xs" />
                    <button type="submit" className="bg-blue-600/80 px-4 py-1.5 rounded-full hover:bg-blue-500 transition-colors font-medium text-xs text-white">Bul</button>
                    <button type="button" onClick={() => { setIsSearchActive(false); setSearchInput(''); setShowSuggestions(false); }} className="text-white/50 hover:text-white px-2">✕</button>
                  </>
                ) : (
                  <button type="button" onClick={() => setIsSearchActive(true)} className="w-10 h-10 flex items-center justify-center text-lg hover:animate-pulse">🔍</button>
                )}
              </form>
            </div>

            {/* SAĞ KISIM: Konum Butonu */}
            <div className={`island-transition ${isExpanded ? 'opacity-100' : 'opacity-100'}`}>
              <button onClick={handleLocationClick} disabled={locationLoading} title="Konumumu Bul" className={`island-transition bg-black/50 border rounded-full transition-colors flex items-center justify-center flex-shrink-0 disabled:opacity-50 ${isExpanded ? 'border-white/20 w-10 h-10' : 'border-none w-8 h-8'}`}>
                {locationLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="text-lg">📍</span>}
              </button>
            </div>

            {/* Arama Önerileri - Dinamik İzlanda'nın Altına Yapışık */}
            {showSuggestions && filteredSuggestions.length > 0 && isExpanded && isSearchActive && (
              <ul className="absolute top-[120%] right-0 mt-2 w-full max-w-[250px] bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-[110] anim-slide-down">
                {filteredSuggestions.map((cityObj, index) => (
                  <li key={index} onMouseDown={(e) => { e.preventDefault(); navigateToCity(cityObj.name); }} className="px-5 py-3.5 hover:bg-blue-600/50 cursor-pointer transition-colors border-b border-slate-800 last:border-0 text-xs flex justify-between items-center text-white/90">
                    <div><span className="font-bold text-blue-300">{cityObj.name.substring(0, searchInput.length)}</span><span>{cityObj.name.substring(searchInput.length)}</span></div>
                    <span className="text-white/50 text-xs tracking-wider">{cityObj.country} {getCountryFlag(cityObj.country)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Kılavuz Menüsü - Ekranın Ortasında Ayrı Bir Modal Olarak */}
      {isGuideOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsGuideOpen(false)}>
          <div className="w-full sm:w-[32rem] bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col anim-slide-down text-white" onClick={(e) => e.stopPropagation()}>
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
        </div>
      )}
    </>
  );
}