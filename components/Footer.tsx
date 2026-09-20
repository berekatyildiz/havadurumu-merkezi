export default function Footer() {
  return (
    <footer className="w-full bg-black/40 backdrop-blur-md border-t border-white/10 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-white/60">
        <p>© 2026 Hava Durumu Merkezi. Tüm hakları saklıdır.</p>
        <p className="flex items-center gap-2">
          Ege Üniversitesi Projesi <span className="text-blue-400">|</span> <span className="font-semibold text-white/80">Berekat Yıldız</span>
        </p>
      </div>
    </footer>
  );
}