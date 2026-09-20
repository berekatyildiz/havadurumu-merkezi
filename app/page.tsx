'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWeatherByCity } from '@/lib/weatherApi';
import WeatherBackground from '@/components/WeatherBackground';

// --- MİKRO-ANİMASYONLU İKON MOTORU ---
const AnimatedWeatherIcon = ({ condition, className = "w-8 h-8" }: { condition: string, className?: string }) => {
  let iconContent;
  switch (condition) {
    case 'Clear':
      iconContent = (<svg className={`${className} text-yellow-400 animate-[spin_12s_linear_infinite]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" fill="currentColor" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>); break;
    case 'Clouds':
      iconContent = (<svg className={`${className} text-white/90 anim-float`} viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,19c1.9,0,3.5-1.6,3.5-3.5c0-1.9-1.6-3.5-3.5-3.5h-0.1c-0.2-2.3-2.1-4-4.4-4c-1.8,0-3.3,1.1-4,2.6 C8.6,10.2,8.1,10,7.5,10C5.6,10,4,11.6,4,13.5C4,15.4,5.6,17,7.5,17h0.1C7.8,18.1,8.8,19,10,19H17.5z" /></svg>); break;
    case 'Rain': case 'Drizzle':
      iconContent = (<svg className={`${className} text-blue-300 overflow-visible`} viewBox="0 0 24 24" fill="currentColor"><path className="anim-float text-slate-300" d="M17.5,19c1.9,0,3.5-1.6,3.5-3.5c0-1.9-1.6-3.5-3.5-3.5h-0.1c-0.2-2.3-2.1-4-4.4-4c-1.8,0-3.3,1.1-4,2.6 C8.6,10.2,8.1,10,7.5,10C5.6,10,4,11.6,4,13.5C4,15.4,5.6,17,7.5,17h0.1C7.8,18.1,8.8,19,10,19H17.5z" /><line x1="8" y1="18" x2="8" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="anim-rain-1" /><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="anim-rain-2" /><line x1="16" y1="18" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="anim-rain-3" /></svg>); break;
    case 'Snow':
      iconContent = (<svg className={`${className} text-blue-100 animate-[spin_6s_linear_infinite]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" /></svg>); break;
    default:
      iconContent = (<svg className={`${className} text-white/50`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>); break;
  }
  return (
    <>
      <style>{`
        @keyframes icon-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes icon-rain { 0% { transform: translateY(0px); opacity: 0; } 20% { opacity: 1; } 80% { transform: translateY(6px); opacity: 1; } 100% { transform: translateY(8px); opacity: 0; } }
        .anim-float { animation: icon-float 4s ease-in-out infinite; }
        .anim-rain-1 { animation: icon-rain 1s linear infinite; }
        .anim-rain-2 { animation: icon-rain 1s linear infinite 0.3s; }
        .anim-rain-3 { animation: icon-rain 1s linear infinite 0.6s; }
      `}</style>
      {iconContent}
    </>
  );
};

const getCountryFlag = (countryCode: string) => {
  if (!countryCode) return '';
  return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

export default function Home() {
  const router = useRouter();
  const [defaultCities, setDefaultCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [hasLocalCity, setHasLocalCity] = useState(false);

  

  useEffect(() => {
    let isMounted = true;
    
    const baseCities = ['İzmir', 'İstanbul', 'Ankara', 'London', 'Tokyo', 'New York', 'Paris', 'Berlin', 'Sydney'];

    const loadData = async (citiesToFetch: string[]) => {
      try {
        setLoading(true);
        const results = await Promise.all(citiesToFetch.map(city => getWeatherByCity(city)));
        
        const formattedData = results.map((data, index) => ({
          id: index,
          city: data.name,
          country: data.sys.country,
          temp: Math.round(data.main.temp),
          temp_min: Math.round(data.main.temp_min),
          temp_max: Math.round(data.main.temp_max),
          status: data.weather[0].description,
          mainCondition: data.weather[0].main,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          raw: data 
        }));

        if (isMounted) setDefaultCities(formattedData);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Veriler çekilirken bir hata oluştu.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const initApp = () => {
      if (!navigator.geolocation) {
        setHasLocalCity(false);
        loadData(baseCities);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
            const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
            const data = await res.json();
            
            if (data && data.length > 0) {
              setHasLocalCity(true);
              const filteredBase = baseCities.filter(c => c.toLocaleLowerCase('tr-TR') !== data[0].name.toLocaleLowerCase('tr-TR'));
              // Slice değerini 6'dan 9'a çıkardık ki 9 kartımız olsun
              loadData([data[0].name, ...filteredBase].slice(0, 9)); 
            } else {
              setHasLocalCity(false);
              loadData(baseCities);
            }
          } catch (err) {
            setHasLocalCity(false);
            loadData(baseCities);
          }
        },
        (err) => {
          setHasLocalCity(false); 
          loadData(baseCities);
        },
        { timeout: 5000 } 
      );
    };

    initApp();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 md:px-8 py-10 flex-grow flex flex-col justify-center animate-pulse mx-auto">
        <div className="h-10 w-64 bg-white/10 rounded-xl mb-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
             <div key={i} className="h-48 bg-white/10 rounded-[2rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  
  if (error || defaultCities.length === 0) {
    return (
      <div className="flex-grow flex justify-center items-center">
        <div className="bg-red-500/80 backdrop-blur-sm border border-red-400 text-white p-6 rounded-2xl text-center shadow-xl">
          {error || 'Şehir verileri yüklenemedi.'}
        </div>
      </div>
    );
  }

  const primaryCity = defaultCities[0];
  const isDay = primaryCity.raw.dt >= primaryCity.raw.sys.sunrise && primaryCity.raw.dt < primaryCity.raw.sys.sunset;
  const glassBoxClass = isDay 
    ? 'bg-black/30 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-black/40' 
    : 'bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl hover:bg-white/15';

  return (
    <>
      <WeatherBackground 
        weatherId={primaryCity.raw.weather[0].id} 
        currentTime={primaryCity.raw.dt} 
        sunrise={primaryCity.raw.sys.sunrise} 
        sunset={primaryCity.raw.sys.sunset} 
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 flex-grow z-10 flex flex-col">
        
        
        <div className="flex justify-between items-end mb-8 border-b border-white/20 pb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
               {hasLocalCity ? "Yerel Merkez ve Küresel İstasyonlar" : "Küresel Gözlem Ağı"}
            </h2>
            <p className="text-white/70 mt-1">
               {hasLocalCity ? "Konumunuza göre optimize edildi" : "Standart meteoroloji istasyonları"}
            </p>
          </div>
        </div>

        
        <div className={`grid grid-cols-1 md:grid-cols-2 ${hasLocalCity ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 w-full mb-16`}>
          
          {defaultCities.map((data, index) => {
            if (hasLocalCity && index === 0) {
              return (
                <article 
                  key={data.id} onClick={() => router.push(`/city/${encodeURIComponent(data.city)}`)} 
                  className={`md:col-span-2 md:row-span-2 ${glassBoxClass} rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-500 cursor-pointer group`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-4xl md:text-5xl font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-3">
                        {data.city} <span className="text-3xl">{getCountryFlag(data.country)}</span>
                      </h3>
                      <p className="text-xl text-white/80 mt-2 capitalize">{data.status}</p>
                    </div>
                    <AnimatedWeatherIcon condition={data.mainCondition} className="w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl" />
                  </div>
                  <div className="flex justify-between items-end mt-12">
                    <div className="text-[5rem] md:text-[7rem] font-light tracking-tighter leading-none text-white drop-shadow-2xl">{data.temp}°</div>
                    <div className="text-right text-white/70 space-y-1 mb-2">
                      <p className="text-lg font-medium text-white/90">H: {data.temp_max}° L: {data.temp_min}°</p>
                      <p>Nem: %{data.humidity}</p>
                      <p>Rüzgar: {data.wind} m/s</p>
                    </div>
                  </div>
                </article>
              );
            }

            
            return (
              <article 
                key={data.id} onClick={() => router.push(`/city/${encodeURIComponent(data.city)}`)} 
                className={`${glassBoxClass} rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:-translate-y-1 group min-h-[160px]`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {data.city} <span className="text-lg ml-1">{getCountryFlag(data.country)}</span>
                  </h3>
                  <AnimatedWeatherIcon condition={data.mainCondition} className="w-10 h-10 drop-shadow-lg" />
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">{data.temp}°</p>
                    <p className="text-sm text-white/70 capitalize mt-1 line-clamp-1">{data.status}</p>
                  </div>
                  <div className="text-right text-xs text-white/50">
                    <p>H:{data.temp_max}° L:{data.temp_min}°</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        
        <div className="mt-8 border-t border-white/20 pt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md mb-8">
            Atmosferik Analiz ve İnsan Algısı
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-white/90 shadow-xl">
              <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">☀️ Sirkadiyen Senkronizasyon</h3>
              <p className="text-sm leading-relaxed text-white/70">
                Güneşin doğuşu ve batışı sadece meteorolojik bir döngü değildir. Işığın şiddeti, beynimizdeki melatonin (uyku) ve kortizol (uyanıklık) salınımını doğrudan kontrol eder. Detay sayfalarımızdaki "Güneş Yörüngesi" paneli, biyolojik saatinizi optimize etmeniz için tasarlandı.
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-white/90 shadow-xl">
              <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">🌫️ Sis, Gri Gökyüzü ve Tekinsizlik</h3>
              <p className="text-sm leading-relaxed text-white/70">
                Ağır bulutlu ve sisli havalar, derinlik algısını bozarak çevreyi izole edilmiş, tekinsiz bir mekana dönüştürür. Bu atmosfer, insan psikolojisinde hem yoğun bir melankoli hem de tanıdık olmayan bir tekinsizlik hissi yaratır.
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-white/90 shadow-xl md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">🍃 AQI ve Bilişsel Performans</h3>
              <p className="text-sm leading-relaxed text-white/70">
                Hava Kalitesi İndeksinin (AQI) 3'ün (Orta) üzerine çıkması sadece fiziksel sağlığı değil, kandaki oksijen yoğunluğunu düşürerek odaklanma ve karar verme yetilerini de yavaşlatır. Kapalı alanlarda çalışırken AQI verisini takip etmek, mental berraklık için kritik bir öneme sahiptir.
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}