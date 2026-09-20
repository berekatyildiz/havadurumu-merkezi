// src/lib/cities.ts

export interface CityData {
  name: string;
  country: string;
}

export const globalCities: CityData[] = [
  // TÜRKİYE'NİN 81 İLİ
  { name: "Adana", country: "TR" }, { name: "Adıyaman", country: "TR" }, { name: "Afyonkarahisar", country: "TR" }, { name: "Ağrı", country: "TR" }, { name: "Amasya", country: "TR" }, { name: "Ankara", country: "TR" }, { name: "Antalya", country: "TR" }, { name: "Artvin", country: "TR" }, { name: "Aydın", country: "TR" }, { name: "Balıkesir", country: "TR" }, { name: "Bilecik", country: "TR" }, { name: "Bingöl", country: "TR" }, { name: "Bitlis", country: "TR" }, { name: "Bolu", country: "TR" }, { name: "Burdur", country: "TR" }, { name: "Bursa", country: "TR" }, { name: "Çanakkale", country: "TR" }, { name: "Çankırı", country: "TR" }, { name: "Çorum", country: "TR" }, { name: "Denizli", country: "TR" }, { name: "Diyarbakır", country: "TR" }, { name: "Edirne", country: "TR" }, { name: "Elazığ", country: "TR" }, { name: "Erzincan", country: "TR" }, { name: "Erzurum", country: "TR" }, { name: "Eskişehir", country: "TR" }, { name: "Gaziantep", country: "TR" }, { name: "Giresun", country: "TR" }, { name: "Gümüşhane", country: "TR" }, { name: "Hakkari", country: "TR" }, { name: "Hatay", country: "TR" }, { name: "Isparta", country: "TR" }, { name: "Mersin", country: "TR" }, { name: "İstanbul", country: "TR" }, { name: "İzmir", country: "TR" }, { name: "Kars", country: "TR" }, { name: "Kastamonu", country: "TR" }, { name: "Kayseri", country: "TR" }, { name: "Kırklareli", country: "TR" }, { name: "Kırşehir", country: "TR" }, { name: "Kocaeli", country: "TR" }, { name: "Konya", country: "TR" }, { name: "Kütahya", country: "TR" }, { name: "Malatya", country: "TR" }, { name: "Manisa", country: "TR" }, { name: "Kahramanmaraş", country: "TR" }, { name: "Mardin", country: "TR" }, { name: "Muğla", country: "TR" }, { name: "Muş", country: "TR" }, { name: "Nevşehir", country: "TR" }, { name: "Niğde", country: "TR" }, { name: "Ordu", country: "TR" }, { name: "Rize", country: "TR" }, { name: "Sakarya", country: "TR" }, { name: "Samsun", country: "TR" }, { name: "Siirt", country: "TR" }, { name: "Sinop", country: "TR" }, { name: "Sivas", country: "TR" }, { name: "Tekirdağ", country: "TR" }, { name: "Tokat", country: "TR" }, { name: "Trabzon", country: "TR" }, { name: "Tunceli", country: "TR" }, { name: "Şanlıurfa", country: "TR" }, { name: "Uşak", country: "TR" }, { name: "Van", country: "TR" }, { name: "Yozgat", country: "TR" }, { name: "Zonguldak", country: "TR" }, { name: "Aksaray", country: "TR" }, { name: "Bayburt", country: "TR" }, { name: "Karaman", country: "TR" }, { name: "Kırıkkale", country: "TR" }, { name: "Batman", country: "TR" }, { name: "Şırnak", country: "TR" }, { name: "Bartın", country: "TR" }, { name: "Ardahan", country: "TR" }, { name: "Iğdır", country: "TR" }, { name: "Yalova", country: "TR" }, { name: "Karabük", country: "TR" }, { name: "Kilis", country: "TR" }, { name: "Osmaniye", country: "TR" }, { name: "Düzce", country: "TR" },
  
  // DÜNYA METROPOLLERİ
  { name: "London", country: "GB" }, { name: "Los Angeles", country: "US" }, { name: "Las Vegas", country: "US" },
  { name: "Tokyo", country: "JP" }, { name: "Toronto", country: "CA" }, { name: "Paris", country: "FR" },
  { name: "Berlin", country: "DE" }, { name: "Madrid", country: "ES" }, { name: "Rome", country: "IT" },
  { name: "New York", country: "US" }, { name: "Seoul", country: "KR" }, { name: "Beijing", country: "CN" },
  { name: "Moscow", country: "RU" }, { name: "Dubai", country: "AE" }, { name: "Sydney", country: "AU" },
  { name: "Amsterdam", country: "NL" }, { name: "Singapore", country: "SG" }, { name: "Bangkok", country: "TH" },
  { name: "Vienna", country: "AT" }, { name: "Prague", country: "CZ" }, { name: "Budapest", country: "HU" },
  { name: "Athens", country: "GR" }, { name: "Lisbon", country: "PT" }, { name: "Stockholm", country: "SE" },
  { name: "Oslo", country: "NO" }, { name: "Copenhagen", country: "DK" }, { name: "Helsinki", country: "FI" },
  { name: "Baku", country: "AZ" }, { name: "Kiev", country: "UA" }, { name: "Warsaw", country: "PL" }
];