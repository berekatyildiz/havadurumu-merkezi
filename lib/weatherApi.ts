// src/lib/weatherApi.ts
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Hızlı arama ve Dashboard için basit fonksiyonumuz 
export const getWeatherByCity = async (city: string) => {
  if (!API_KEY) throw new Error("API Anahtarı eksik!");
  const res = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&lang=tr&appid=${API_KEY}`);
  if (!res.ok) throw new Error(`${city} verisi alınamadı.`);
  return res.json();
};

// Detay sayfası için tüm verileri çeken asenkron toplayıcı
export const getFullCityData = async (city: string) => {
  if (!API_KEY) throw new Error("API Anahtarı eksik!");

  // 1. Önce şehrin anlık durumunu ve Koordinatlarını (lat, lon) alıyoruz
  const currentRes = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&lang=tr&appid=${API_KEY}`);
  if (!currentRes.ok) throw new Error('Şehir bulunamadı.');
  const currentData = await currentRes.json();

  const { lat, lon } = currentData.coord;

  // 2. Koordinatları kullanarak Hava Kalitesi (AQI) ve 5 Günlük/Saatlik Tahmini paralel (Promise.all) çekiyoruz. 
  // Paralel çekmek uygulamanın bekleme süresini (Latency) yarı yarıya düşürür.
  const [forecastRes, airRes] = await Promise.all([
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${API_KEY}`),
    fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
  ]);

  const forecastData = await forecastRes.json();
  const airData = await airRes.json();

  // Verileri parçalanmış olarak değil, tek bir temiz obje (Object) halinde bileşenlere gönderiyoruz
  return {
    current: currentData,
    forecast: forecastData,
    airQuality: airData.list[0].main.aqi // 1(İyi) ile 5(Kötü) arası bir değer döner
  };
};
// CTO DOKUNUŞU: Open-Meteo ile Dünün Verisini Çekme (API Key Gerektirmez)
export const getYesterdayTempDiff = async (lat: number, lon: number, currentTemp: number) => {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&past_days=1&forecast_days=1&hourly=temperature_2m`);
    const data = await res.json();
    
    // Şu anki saati bul (0-23 arası)
    const currentHour = new Date().getHours();
    // API dünün 24 saatinin verisini ilk 24 elemanda verir
    const yesterdayTemp = data.hourly.temperature_2m[currentHour];
    
    const diff = Math.round(currentTemp - yesterdayTemp);
    
    if (diff > 0) return `Düne göre ${diff}° daha sıcak`;
    if (diff < 0) return `Düne göre ${Math.abs(diff)}° daha serin`;
    return 'Dün ile aynı sıcaklıkta';
  } catch (error) {
    return null; // Hata olursa sistemi çökertme, sessizce gizle
  }
};