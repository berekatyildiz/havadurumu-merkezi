'use client';

import { useEffect, useState, JSX } from 'react';

// Saf SVG Bulut İkonu
const CloudSVG = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5,19c1.9,0,3.5-1.6,3.5-3.5c0-1.9-1.6-3.5-3.5-3.5h-0.1c-0.2-2.3-2.1-4-4.4-4c-1.8,0-3.3,1.1-4,2.6 C8.6,10.2,8.1,10,7.5,10C5.6,10,4,11.6,4,13.5C4,15.4,5.6,17,7.5,17h0.1C7.8,18.1,8.8,19,10,19H17.5z" />
  </svg>
);

interface SkyProps {
  weatherId: number; 
  currentTime: number; 
  sunrise: number; 
  sunset: number; 
  celestialPosition?: number; // 0 ile 1 arası gökyüzü konumu (Soldan sağa)
  celestialType?: 'sun' | 'moon'; 
}

export default function WeatherBackground({ weatherId, currentTime, sunrise, sunset, celestialPosition = 0.5, celestialType = 'sun' }: SkyProps) {
  const [gradient, setGradient] = useState('from-slate-900 to-black');
  const [elements, setElements] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const isDay = currentTime >= sunrise && currentTime < sunset;
    const isSunset = currentTime >= sunset - 3600 && currentTime <= sunset + 3600; // Batıma 1 saat kala/geçe
    const isSunrise = currentTime >= sunrise - 3600 && currentTime <= sunrise + 3600; // Doğuma 1 saat kala/geçe

    // --- GÖKYÜZÜ CİSMİ MATEMATİĞİ (Güneş veya Ay) ---
    // CSS Viewport değerlerine göre (0vw'den 100vw'ye soldan sağa)
    const cx = celestialPosition * 100; 
    // Parabolik Yay (Math.sin). 100vh'den (aşağıdan) başlar, 20vh'a (tepeye) kadar çıkar ve iner.
    const cy = 100 - (Math.sin(celestialPosition * Math.PI) * 80); 

    const celestialBody = celestialType === 'sun' ? (
      <div 
        className="absolute rounded-full pointer-events-none transition-all duration-1000 z-0"
        style={{
          left: `${cx}vw`, top: `${cy}vh`,
          width: '150px', height: '150px',
          background: 'radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(253,224,71,0) 70%)',
          boxShadow: '0 0 120px 60px rgba(250, 204, 21, 0.3)',
          transform: 'translate(-50%, -50%)'
        }}
      />
    ) : (
      <div 
        className="absolute rounded-full pointer-events-none transition-all duration-1000 z-0"
        style={{
          left: `${cx}vw`, top: `${cy}vh`,
          width: '100px', height: '100px',
          background: 'radial-gradient(circle, rgba(226,232,240,0.9) 0%, rgba(226,232,240,0) 70%)',
          boxShadow: '0 0 80px 30px rgba(226, 232, 240, 0.15)',
          transform: 'translate(-50%, -50%)'
        }}
      />
    );

    if (weatherId >= 200 && weatherId < 600) {
      setGradient(isDay ? 'from-slate-600 to-slate-800' : 'from-slate-900 to-black');
      setElements(<div className="absolute inset-0 overflow-hidden opacity-40 z-10">{/* Yağmur Kodları... */}{[...Array(15)].map((_, i) => (<div key={`rain-${i}`} className="absolute bg-blue-200/50 w-[2px] h-20 blur-[1px]" style={{left: `${Math.random() * 100}%`, top: `-${Math.random() * 20 + 10}%`, animation: `fall ${Math.random() * 0.5 + 0.5}s linear infinite`}}/>))}</div>);
    } else if (weatherId >= 600 && weatherId < 700) {
      setGradient(isDay ? 'from-blue-100 to-slate-300' : 'from-slate-800 to-slate-950');
      setElements(<div className="absolute inset-0 overflow-hidden opacity-60 z-10">{/* Kar Kodları... */}{[...Array(20)].map((_, i) => (<div key={`snow-${i}`} className="absolute bg-white w-2 h-2 rounded-full blur-[1px]" style={{left: `${Math.random() * 100}%`, top: `-${Math.random() * 20 + 10}%`, animation: `fall ${Math.random() * 2 + 2}s linear infinite`}}/>))}</div>);
    } else if (weatherId >= 801 && weatherId <= 804) {
      setGradient(isDay ? 'from-slate-400 to-slate-600' : 'from-slate-800 to-slate-950');
      setElements(
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {celestialBody} {/* Bulutlu havada güneş/ay arkada kalır */}
          {[...Array(6)].map((_, i) => (<CloudSVG key={`cloud-bg-${i}`} className={`absolute ${isDay ? 'text-white/30' : 'text-slate-500/20'} blur-[2px]`} style={{top: `${Math.random() * 50}%`, left: `-20vw`, width: `${Math.random() * 200 + 150}px`, animation: `drift ${Math.random() * 60 + 80}s linear infinite`, animationDelay: `-${Math.random() * 80}s`}} />))}
          {[...Array(4)].map((_, i) => (<CloudSVG key={`cloud-fg-${i}`} className={`absolute ${isDay ? 'text-white/60' : 'text-slate-400/30'} blur-[1px]`} style={{top: `${Math.random() * 30}%`, left: `-30vw`, width: `${Math.random() * 300 + 200}px`, animation: `drift ${Math.random() * 40 + 50}s linear infinite`, animationDelay: `-${Math.random() * 50}s`}} />))}
        </div>
      );
    } else {
      // AÇIK HAVA RENK PALETLERİ
      let currentGradient = 'from-blue-400 to-blue-200'; // Varsayılan Gündüz
      
      if (isSunrise) currentGradient = 'from-indigo-400 via-pink-400 to-orange-300'; // Gün Doğumu
      else if (isSunset) currentGradient = 'from-orange-400 via-red-500 to-purple-900'; // Gün Batımı
      else if (!isDay) currentGradient = 'from-slate-900 via-indigo-950 to-black'; // Gece

      setGradient(currentGradient);
      setElements(
        <div className="absolute inset-0 overflow-hidden z-10">
          {celestialBody} {/* Açık havada kabak gibi parlar */}
          {!isDay && [...Array(40)].map((_, i) => (
            <div key={`star-${i}`} className="absolute bg-white rounded-full" style={{width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`}}/>
          ))}
        </div>
      );
    }
  }, [weatherId, currentTime, sunrise, sunset, celestialPosition, celestialType]);

  return (
    <div className={`fixed inset-0 z-[-1] bg-gradient-to-br transition-colors duration-1000 ${gradient}`}>
      <style>{`
        @keyframes fall { 0% { transform: translateY(0vh); opacity: 1; } 100% { transform: translateY(120vh); opacity: 0; } }
        @keyframes twinkle { 0% { opacity: 0.1; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.2); } }
        @keyframes drift { 0% { transform: translateX(-20vw); } 100% { transform: translateX(120vw); } }
      `}</style>
      {elements}
    </div>
  );
}