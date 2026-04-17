'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '🏠', label: 'Главная' },
  { href: '/news', icon: '📰', label: 'Новости' },
  { href: '/learn', icon: '📚', label: 'Обучение' },
  { href: '/tests', icon: '🏋️', label: 'Тренинги' },
  { href: '/admin', icon: '👤', label: 'Кабинет' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-sky-900/40 bg-sky-950/95 backdrop-blur-md">
      <div className="flex items-stretch justify-around">
        {navItems.map(({ href, icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                active ? 'text-sky-300' : 'text-sky-500 hover:text-sky-300'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className={`text-[10px] ${active ? 'text-sky-300' : 'text-sky-500'}`}>{label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-sky-400 rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
