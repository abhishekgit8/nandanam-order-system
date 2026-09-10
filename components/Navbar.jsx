import Link from 'next/link';
import { Utensils, LayoutDashboard } from 'lucide-react';

export default function Navbar({ pendingCount }) {
  return (
    <header className="bg-kerala-red text-kerala-cream shadow-md sticky top-0 z-50 border-b-2 border-kerala-gold">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/order" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-kerala-gold rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <svg viewBox="0 0 48 48" className="w-7 h-7">
              <ellipse cx="24" cy="14" rx="8" ry="10" fill="#FFD700" opacity="0.3"/>
              <rect x="20" y="38" width="8" height="4" rx="1" fill="#8B6914"/>
              <rect x="18" y="42" width="12" height="3" rx="1.5" fill="#8B6914"/>
              <rect x="22" y="22" width="4" height="16" rx="1" fill="#D4AF37"/>
              <path d="M17 24 Q17 20 24 18 Q31 20 31 24 Q31 28 24 28 Q17 28 17 24Z" fill="#D4AF37"/>
              <path d="M24 8 Q28 14 26 17 Q24 20 22 17 Q20 14 24 8Z" fill="url(#glow)"/>
              <path d="M24 10 Q26 14 25 16 Q24 18 23 16 Q22 14 24 10Z" fill="#FFF8DC"/>
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide text-white">NANDANAM</h1>
            <p className="text-[10px] text-kerala-gold tracking-widest uppercase">Nostalgic Taste of Kerala</p>
          </div>
        </Link>

        <nav className="flex gap-2">
          <Link 
            href="/order" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-sm font-semibold border border-kerala-gold/30 transition"
          >
            <Utensils size={16} /> Take Order
          </Link>
          <Link 
            href="/dashboard" 
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-kerala-gold text-kerala-charcoal rounded-lg text-sm font-bold shadow hover:bg-yellow-400 transition"
          >
            <LayoutDashboard size={16} /> Dashboard
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {pendingCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}