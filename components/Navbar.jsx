'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, LayoutDashboard, DollarSign, ChefHat, BarChart3 } from 'lucide-react';
import Image from 'next/image';

const NAV_ITEMS = [
  { href: '/order', label: 'Orders', icon: Utensils },
  { href: '/dashboard', label: 'Kitchen', icon: ChefHat },
  { href: '/update-price', label: 'Menu', icon: DollarSign },
  { href: '/reports', label: 'Dashboard', icon: BarChart3 },
];

export default function Navbar({ pendingCount }) {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex fixed left-0 top-0 bottom-0 w-56 bg-gradient-to-b from-[#7E060C] to-[#5E0409] text-white flex-col z-50">
        <div className="px-4 pt-5 pb-4 text-center border-b border-white/10">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-white p-1 shadow-lg">
            <Image src="/logo.png" alt="Nandanam" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="font-['Playfair_Display'] text-xl font-bold mt-2">Nandanam</h1>
          <small className="text-[11px] opacity-70">Restaurant</small>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition ${
                isActive(href)
                  ? 'bg-white text-[#B00911] font-semibold'
                  : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {href === '/dashboard' && pendingCount > 0 && (
                <span className="bg-[#BE5911] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="bg-kerala-red sm:hidden sticky top-0 z-50 border-b-2 border-kerala-gold">
        <div className="px-3 py-2 flex items-center">
          <Link href="/order" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-md bg-white">
              <Image src="/logo.png" alt="Nandanam" width={36} height={36} className="object-contain" />
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
              isActive(href) ? 'text-kerala-red font-bold' : 'text-gray-400'
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
