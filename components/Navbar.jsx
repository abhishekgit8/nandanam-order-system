'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, LayoutDashboard, DollarSign, ChefHat } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/order', label: 'Orders', icon: Utensils },
  { href: '/dashboard', label: 'Kitchen', icon: ChefHat },
  { href: '/update-price', label: 'Menu', icon: DollarSign },
  { href: '/reports', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Navbar({ pendingCount }) {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Top navbar — desktop only */}
      <header className="bg-kerala-red text-kerala-cream shadow-md sticky top-0 z-50 border-b-2 border-kerala-gold hidden sm:block">
        <div className="max-w-7xl mx-auto px-3 py-2 flex justify-between items-center">
          <Link href="/order" className="flex items-center gap-1.5 group">
            <div className="w-8 h-8 bg-kerala-gold rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <svg viewBox="0 0 48 48" className="w-6 h-6">
                <ellipse cx="24" cy="14" rx="8" ry="10" fill="#FFD700" opacity="0.3"/>
                <rect x="20" y="38" width="8" height="4" rx="1" fill="#8B6914"/>
                <rect x="18" y="42" width="12" height="3" rx="1.5" fill="#8B6914"/>
                <rect x="22" y="22" width="4" height="16" rx="1" fill="#D4AF37"/>
                <path d="M17 24 Q17 20 24 18 Q31 20 31 24 Q31 28 24 28 Q17 28 17 24Z" fill="#D4AF37"/>
                <path d="M24 8 Q28 14 26 17 Q24 20 22 17 Q20 14 24 8Z" fill="#FFF8DC"/>
                <path d="M24 10 Q26 14 25 16 Q24 18 23 16 Q22 14 24 10Z" fill="#FFF8DC"/>
              </svg>
            </div>
            <h1 className="font-extrabold text-base tracking-wide text-white">NANDANAM</h1>
          </Link>

          <nav className="flex gap-1.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isActive(href)
                    ? 'bg-kerala-gold text-kerala-charcoal border-kerala-gold shadow'
                    : 'bg-black/20 text-white border-kerala-gold/30 hover:bg-black/40'
                }`}
              >
                <Icon size={14} /> {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile top bar — logo only */}
      <header className="bg-kerala-red sm:hidden sticky top-0 z-50 border-b-2 border-kerala-gold">
        <div className="px-3 py-2 flex items-center">
          <Link href="/order" className="flex items-center gap-1.5 group">
            <div className="w-8 h-8 bg-kerala-gold rounded-full flex items-center justify-center shadow-md">
              <svg viewBox="0 0 48 48" className="w-6 h-6">
                <ellipse cx="24" cy="14" rx="8" ry="10" fill="#FFD700" opacity="0.3"/>
                <rect x="20" y="38" width="8" height="4" rx="1" fill="#8B6914"/>
                <rect x="18" y="42" width="12" height="3" rx="1.5" fill="#8B6914"/>
                <rect x="22" y="22" width="4" height="16" rx="1" fill="#D4AF37"/>
                <path d="M17 24 Q17 20 24 18 Q31 20 31 24 Q31 28 24 28 Q17 28 17 24Z" fill="#D4AF37"/>
                <path d="M24 8 Q28 14 26 17 Q24 20 22 17 Q20 14 24 8Z" fill="#FFF8DC"/>
                <path d="M24 10 Q26 14 25 16 Q24 18 23 16 Q22 14 24 10Z" fill="#FFF8DC"/>
              </svg>
            </div>
            <h1 className="font-extrabold text-base tracking-wide text-white">NANDANAM</h1>
          </Link>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center h-14 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition ${
              isActive(href)
                ? 'text-kerala-red font-bold'
                : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <Icon size={20} />
              {href === '/dashboard' && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[8px] font-bold min-w-[14px] h-3.5 rounded-full flex items-center justify-center leading-none">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
