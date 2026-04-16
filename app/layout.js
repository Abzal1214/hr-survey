import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserMenu from "./components/UserMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hawaii&Miami / SanRemo Portal",
  description: "Портал аквапарков Hawaii&Miami и SanRemo: регистрация, обучение, новости, тесты и отчеты.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌴</text></svg>",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900 w-full">
        {/* Background fixed for desktop, scroll for mobile (iOS Safari fix) */}
        <div className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/bg.jpg')"}} aria-hidden="true" />
        <header className="no-print sticky top-0 z-50 border-b border-sky-900/40 bg-sky-950/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase tracking-widest text-sky-300 font-medium">🌊 Hawaii&amp;Miami · SanRemo</span>
              <h1 className="text-xl font-bold text-white">Академия сети Аквапарков</h1>
            </div>

            <nav className="hidden flex-1 items-center justify-center gap-3 text-sm text-sky-100 lg:flex">
              <Link href="/" className="nav-link rounded-full px-4 py-2 transition hover:bg-sky-500 hover:text-white">
                Главная страница
              </Link>
              <Link href="/news" className="rounded-full px-4 py-2 transition hover:bg-sky-500 hover:text-white">
                Новости
              </Link>
              <Link href="/learn" className="rounded-full px-4 py-2 transition hover:bg-sky-500 hover:text-white">
                Обучение
              </Link>
              <Link href="/tests" className="rounded-full px-4 py-2 transition hover:bg-sky-500 hover:text-white">
                Тренинги
              </Link>
              <Link href="/surveys" className="rounded-full px-4 py-2 transition hover:bg-sky-500 hover:text-white">
                Опрос
              </Link>
              <Link href="/rewards" className="rounded-full px-4 py-2 transition hover:bg-sky-500 hover:text-white">
                Награды
              </Link>
              <Link href="/mentors" className="rounded-full px-4 py-2 transition hover:bg-sky-500 hover:text-white">
                Наставники
              </Link>
            </nav>
            <UserMenu />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
