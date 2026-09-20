'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFullCityData } from '@/lib/weatherApi';
import WeatherBackground from '@/components/WeatherBackground';

const getCountryFlag = (countryCode: string) => {
  if (!countryCode) return '';
  return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

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

const getAqiInfo = (aqi: number) => {
  switch (aqi) {
    case 1: return { text: 'Mükemmel', desc: 'Hava kalitesi tertemiz.', color: 'text-green-400', stroke: 'stroke-green-400', percent: 100 };
    case 2: return { text: 'İyi', desc: 'Genel olarak kabul edilebilir.', color: 'text-blue-400', stroke: 'stroke-blue-400', percent: 80 }; 
    case 3: return { text: 'Orta', desc: 'Hassas gruplar etkilenebilir.', color: 'text-yellow-400', stroke: 'stroke-yellow-400', percent: 60 }; 
    case 4: return { text: 'Kötü', desc: 'Herkes sağlık etkileri yaşayabilir.', color: 'text-orange-400', stroke: 'stroke-orange-400', percent: 40 }; 
    case 5: return { text: 'Tehlikeli', desc: 'Acil sağlık uyarıları.', color: 'text-red-500', stroke: 'stroke-red-500', percent: 20 }; 
    default: return { text: 'Bilinmiyor', desc: 'Veri yok.', color: 'text-gray-400', stroke: 'stroke-gray-400', percent: 0 };
  }
};

const getAtmosphericIntel = (current: any, aqi: number) => {
  const temp = current.main.temp;
  const condition = current.weather[0].main; 
  const humidity = current.main.humidity;
  const isNight = current.dt > current.sys.sunset || current.dt < current.sys.sunrise;

  if (['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(condition)) {
    return {
      title: "Derin Odaklanma İçin Harika",
      icon: "☕",
      color: "text-blue-300",
      desc: `Dışarıda ${condition === 'Snow' ? 'kar' : 'yağış'} var. Saatlerce kod yazmak, kitap okumak veya kahve eşliğinde projelere odaklanmak için mükemmel bir atmosfer. Dış uyaranlar minimumda.`
    };
  }
  
  if (['Mist', 'Smoke', 'Haze', 'Dust', 'Fog'].includes(condition) || (humidity > 85 && isNight)) {
    return {
      title: "Tekinsiz Atmosfer & Estetik",
      icon: "📸",
      color: "text-purple-400",
      desc: "Havadaki yüksek nem ve görüş mesafesindeki düşüş, çevreyi tekinsiz bir mekana dönüştürüyor. Kameranla gece atmosferi veya sis fotoğrafları yakalamak için kusursuz bir zaman."
    };
  }

  if (aqi <= 2 && temp >= 15 && temp <= 28) {
    return {
      title: "Açık Hava Aktiviteleri İçin Mükemmel",
      icon: "🏃‍♂️",
      color: "text-green-400",
      desc: "Hava kalitesi temiz ve sıcaklık optimum seviyede. Tempolu bir koşu rutini başlatmak veya açık yüzme havuzu antrenmanları için vücut termodinamiğine en uygun koşullar mevcut."
    };
  }

  return {
    title: "Günlük Rutin & Nötr Atmosfer",
    icon: "🏙️",
    color: "text-yellow-300",
    desc: "Hava koşulları ekstrem bir durum sunmuyor. Derslere katılmak veya günlük rutinleri uygulamak için stabil, sakin ve nötr bir gün."
  };
};

export default function CityWeatherPage() {
  const { name } = useParams();
  const router = useRouter();
  const decodedCity = decodeURIComponent(name as string);

  const [cityData, setCityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveLocalTime, setLiveLocalTime] = useState<string>('--:--');
  const [tempDiffText, setTempDiffText] = useState<string | null>(null);

  useEffect(() => {
    if (!cityData) return; 
    const updateClock = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const targetCityDate = new Date(utc + (1000 * cityData.current.timezone));
      const timeStr = `${targetCityDate.getHours().toString().padStart(2, '0')}:${targetCityDate.getMinutes().toString().padStart(2, '0')}`;
      setLiveLocalTime(timeStr);
    };
    updateClock(); 
    const timer = setInterval(updateClock, 1000); 
    return () => clearInterval(timer);
  }, [cityData]);

  useEffect(() => {
    if (!cityData) return;
    import('@/lib/weatherApi').then(({ getYesterdayTempDiff }) => {
      getYesterdayTempDiff(cityData.current.coord.lat, cityData.current.coord.lon, cityData.current.main.temp)
        .then(setTempDiffText);
    });
  }, [cityData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getFullCityData(decodedCity);
        setCityData(data);
      } catch (err: any) {
        setError(err.message || 'Atmosferik veriler alınırken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [decodedCity]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 md:px-8 mt-10 animate-pulse mx-auto flex-grow">
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <div className="h-32 w-48 bg-white/10 rounded-[3rem]"></div>
          <div className="h-6 w-64 bg-white/10 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <div className="h-40 bg-white/10 rounded-[2rem]"></div>
          <div className="h-40 bg-white/10 rounded-[2rem]"></div>
          <div className="lg:col-span-2 h-40 bg-white/10 rounded-[2rem]"></div>
          <div className="lg:col-span-2 h-64 bg-white/10 rounded-[2rem]"></div>
          <div className="lg:col-span-2 h-64 bg-white/10 rounded-[2rem]"></div>
          <div className="lg:col-span-4 h-32 bg-white/10 rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  if (error || !cityData) {
    return (
      <div className="flex flex-col justify-center items-center text-white gap-4 p-4 text-center mt-20 flex-grow">
        <p className="text-xl text-red-400">{error}</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 px-6 py-2 rounded-lg">Ana Sayfaya Dön</button>
      </div>
    );
  }

  const { current, forecast, airQuality } = cityData;
  const aqiInfo = getAqiInfo(airQuality);
  const atmosphericIntel = getAtmosphericIntel(current, airQuality);

  const formatTime = (unixDt: number) => {
    const localUnix = unixDt + current.timezone; 
    const date = new Date(localUnix * 1000);
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
  };

  const isDay = current.dt >= current.sys.sunrise && current.dt < current.sys.sunset;
  const glassBoxClass = isDay 
    ? 'bg-black/30 backdrop-blur-2xl border border-white/10 shadow-2xl transition-colors duration-1000' 
    : 'bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl transition-colors duration-1000';

  const hourlyForecast = forecast.list.slice(0, 8);
  const dailyForecast = forecast.list.filter((item: any) => item.dt_txt.includes('12:00:00')).slice(0, 5);

  let celestialPos = 0.5;
  const nightDuration = 86400 - (current.sys.sunset - current.sys.sunrise);

  if (isDay) {
    celestialPos = (current.dt - current.sys.sunrise) / (current.sys.sunset - current.sys.sunrise);
  } else {
    if (current.dt >= current.sys.sunset) {
        celestialPos = (current.dt - current.sys.sunset) / nightDuration;
    } else if (current.dt < current.sys.sunrise) {
        const yesterdaySunset = current.sys.sunset - 86400; 
        celestialPos = (current.dt - yesterdaySunset) / nightDuration;
    }
  }
  
  if (celestialPos < 0) celestialPos = 0; 
  if (celestialPos > 1) celestialPos = 1; 

  const rad = Math.PI - (celestialPos * Math.PI); 
  const orbitX = 100 + 80 * Math.cos(rad); 
  const orbitY = 90 - 80 * Math.sin(rad);  

  return (
    <div className="w-full text-white relative overflow-hidden flex flex-col items-center">
      <WeatherBackground 
        weatherId={current.weather[0].id} 
        currentTime={current.dt} 
        sunrise={current.sys.sunrise} 
        sunset={current.sys.sunset}
        celestialPosition={celestialPos}
        celestialType={isDay ? 'sun' : 'moon'}
      />

      {/* CTO DOKUNUŞU: pt-28 yerine pt-24 kullanıldı. Kutu milimetrik hizalandı. */}
      <div className="w-full max-w-7xl px-4 md:px-8 pt-24 pb-8 flex-grow z-10 overflow-visible">
        
        <div className="text-center mb-12 animate-fade-in mt-4 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-shadow-premium drop-shadow-xl flex items-center gap-3">
            {current.name} <span className="text-3xl">{getCountryFlag(current.sys.country)}</span>
          </h2>
          
          <div className="bg-white/10 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/20 mb-4 flex items-center gap-2 shadow-lg text-shadow-premium">
            <span className="text-sm font-medium text-white/80">Yerel Saat:</span>
            <span className="text-lg font-bold tracking-widest text-blue-200">{liveLocalTime}</span>
          </div>

          <div className="text-[7rem] md:text-[9rem] font-light tracking-tighter leading-none text-shadow-premium drop-shadow-2xl">
            {Math.round(current.main.temp)}°
          </div>

          {tempDiffText && (
            <div className="mt-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 animate-fade-in text-shadow-premium shadow-md">
              <span className="text-sm font-medium text-white/80">📈 {tempDiffText}</span>
            </div>
          )}

          <div className="flex justify-center items-center gap-3 mt-4 text-shadow-premium">
             <AnimatedWeatherIcon condition={current.weather[0].main} className="w-10 h-10 md:w-12 md:h-12" />
             <p className="text-xl md:text-2xl font-medium drop-shadow-lg capitalize">
               {current.weather[0].description} {Math.round(current.main.temp_min)}° / {Math.round(current.main.temp_max)}°
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
          
          <div className={`lg:col-span-1 ${glassBoxClass} rounded-[2rem] p-6 flex flex-col justify-between transition-colors duration-1000`}>
            <div className="mb-4">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${aqiInfo.color}`}>🍃 {aqiInfo.text}</h3>
              <p className="text-sm text-white/80 mt-1 leading-relaxed">{aqiInfo.desc}</p>
            </div>
            <div className="relative w-full flex justify-center mt-auto">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" className={`${aqiInfo.stroke}`} strokeWidth="3" strokeDasharray={`${aqiInfo.percent}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex justify-center items-center">
                  <span className="text-3xl font-bold">{airQuality}<span className="text-sm text-white/40 ml-1">/5</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-1 ${glassBoxClass} rounded-[2rem] p-6 flex flex-col justify-center gap-6 transition-colors duration-1000`}>
            <div className="flex flex-col border-b border-white/10 pb-3">
              <span className="text-white/60 text-sm uppercase tracking-wider mb-1">Hissedilen</span><span className="text-2xl font-semibold">{Math.round(current.main.feels_like)}°</span>
            </div>
            <div className="flex flex-col border-b border-white/10 pb-3">
              <span className="text-white/60 text-sm uppercase tracking-wider mb-1">Nem Oranı</span><span className="text-2xl font-semibold">%{current.main.humidity}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-sm uppercase tracking-wider mb-1">Rüzgar</span><span className="text-2xl font-semibold">{current.wind.speed} m/s</span>
            </div>
          </div>

          <div className={`lg:col-span-2 ${glassBoxClass} rounded-[2rem] p-6 transition-colors duration-1000 flex flex-col items-center justify-between`}>
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider w-full border-b border-white/10 pb-2">
              {isDay ? "Güneş Yörüngesi" : "Gece Döngüsü"}
            </h3>
            <div className="relative w-full h-32 flex justify-center items-end mt-4">
              <svg viewBox="0 0 200 100" className="w-full max-w-[280px] overflow-visible">
                <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                <path d={`M 20 90 A 80 80 0 0 1 ${orbitX} ${orbitY}`} fill="none" stroke={isDay ? "rgba(250,204,21,0.6)" : "rgba(226,232,240,0.6)"} strokeWidth="3" />
                <circle cx={orbitX} cy={orbitY} r="7" fill={isDay ? "#facc15" : "#e2e8f0"} className="animate-pulse shadow-lg" />
              </svg>
              <div className="absolute w-full max-w-[320px] flex justify-between bottom-[-25px] text-sm font-medium text-white/70">
                <span className="flex flex-col items-center">
                  {isDay ? "🌅" : "🌇"} 
                  <span>{isDay ? formatTime(current.sys.sunrise) : formatTime(current.sys.sunset)}</span>
                </span>
                <span className="flex flex-col items-center">
                  {isDay ? "🌇" : "🌅"} 
                  <span>{isDay ? formatTime(current.sys.sunset) : formatTime(current.sys.sunrise)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-2 ${glassBoxClass} rounded-[2rem] p-6 transition-colors duration-1000 flex flex-col`}>
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex-shrink-0">
              Bugün Saatlik
            </h3>
            <div className="flex-grow flex flex-col justify-center">
              <div className="flex overflow-x-auto gap-6 pb-2 snap-x snap-mandatory scrollbar-hide w-full items-center">
                <div className="flex flex-col items-center justify-between min-w-[60px] snap-center">
                  <span className="text-sm font-medium text-blue-300">Şimdi</span>
                  <div className="my-3"><AnimatedWeatherIcon condition={current.weather[0].main} className="w-8 h-8" /></div>
                  <span className="text-lg font-bold">{Math.round(current.main.temp)}°</span>
                </div>
                {hourlyForecast.map((hour: any, i: number) => (
                  <div key={i} className="flex flex-col items-center justify-between min-w-[60px] snap-center">
                    <span className="text-sm text-white/80">{formatTime(hour.dt)}</span>
                    <div className="my-3"><AnimatedWeatherIcon condition={hour.weather[0].main} className="w-8 h-8" /></div>
                    <span className="text-lg font-bold">{Math.round(hour.main.temp)}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`lg:col-span-2 ${glassBoxClass} rounded-[2rem] p-6 transition-colors duration-1000`}>
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Birkaç Günlük Tahmin</h3>
            <div className="flex flex-col gap-3">
              {dailyForecast.map((day: any, i: number) => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
                const dayNum = date.getDate();
                const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
                return (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 last:border-0 pb-2 last:pb-0">
                    <span className="w-1/3 text-base md:text-lg font-medium">{dayNum} {monthName} {i === 0 ? 'Bugün' : dayName}</span>
                    <span className="w-1/3 flex justify-center"><AnimatedWeatherIcon condition={day.weather[0].main} className="w-6 h-6 md:w-8 md:h-8" /></span>
                    <span className="w-1/3 text-right text-base md:text-lg font-bold">{Math.round(day.main.temp_min)}° / {Math.round(day.main.temp_max)}°</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`lg:col-span-4 ${glassBoxClass} rounded-[2rem] p-6 md:p-8 transition-colors duration-1000 flex flex-col md:flex-row items-center gap-6 group`}>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
              <span className="text-5xl">{atmosphericIntel.icon}</span>
            </div>
            <div className="flex flex-col text-center md:text-left">
              <h3 className={`text-xl md:text-2xl font-bold mb-2 ${atmosphericIntel.color}`}>
                {atmosphericIntel.title}
              </h3>
              <p className="text-white/80 leading-relaxed text-sm md:text-base max-w-4xl">
                {atmosphericIntel.desc}
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}