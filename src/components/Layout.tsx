import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Mic, Route, Settings, BookOpen, MessageSquare, GraduationCap, Menu, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useStore } from '@/src/store/useStore';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { progress } = useStore();

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Khám phá', path: '/', icon: Home },
    { name: 'Bài học', path: '/lessons', icon: BookOpen },
    { name: 'Lộ trình', path: '/path', icon: Route },
    { name: 'Khóa học', path: '/teacher', icon: GraduationCap },
    { name: 'Trợ lý', path: '/assistant', icon: MessageSquare },
    { name: 'Hồ sơ', path: '/profile', icon: Settings },
  ];

  // Các mục hiển thị trên taskbar mobile
  const taskbarItems = [
    { name: 'Khám phá', path: '/', icon: Home },
    { name: 'Bài học', path: '/lessons', icon: BookOpen },
    { name: 'Khóa học', path: '/teacher', icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f5f5f0] text-[#2d2d2a] font-sans">
      {/* Sidebar for Desktop */}
      <aside className="w-64 border-r border-[#5a5a40]/10 bg-white/40 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 font-serif font-bold inset-0 text-xl text-[#5a5a40] mb-8">
            <div className="w-8 h-8 bg-[#5a5a40] rounded-xl flex items-center justify-center">
              <span className="text-white font-serif text-lg italic">L</span>
            </div>
            LinguaAI
          </div>
          <nav className="space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-medium border-l-4",
                  location.pathname === item.path 
                    ? "bg-white border-[#5a5a40] text-[#5a5a40] shadow-sm" 
                    : "border-transparent text-[#5a5a40]/60 hover:bg-[#5a5a40]/5 hover:text-[#5a5a40]"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-[#5a5a40]/10">
          <div className="bg-[#faedcd] rounded-2xl p-4 border border-[#d4a373]/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#d4a373] font-bold uppercase tracking-wider">Level {progress.level}</p>
              <p className="text-sm font-medium text-[#5a5a40]">{progress.xp} XP</p>
            </div>
            <div className="text-xl">🔥 {progress.streak}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 relative">
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#f5f5f0]/80 backdrop-blur-md border-b border-[#5a5a40]/10 z-10 flex items-center justify-between px-6 md:hidden">
          <div className="font-bold text-lg font-serif text-[#5a5a40] flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5a5a40] rounded-xl flex items-center justify-center">
              <span className="text-white font-serif text-lg italic">L</span>
            </div>
            LinguaAI
          </div>
          <div className="text-sm font-bold bg-[#d4a373]/20 text-[#d4a373] px-3 py-1.5 rounded-full flex items-center gap-1">
            🔥 {progress.streak}
          </div>
        </header>
        <div className={cn("max-w-4xl mx-auto p-4 md:p-8 mt-16 md:mt-0")}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-[#f5f5f0] z-40 transition-transform duration-300 md:hidden flex flex-col pt-16",
          mobileMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
         <div className="p-6 flex-1 overflow-auto">
           <h3 className="font-serif text-2xl font-bold text-[#5a5a40] mb-6">Menu mở rộng</h3>
           <nav className="space-y-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors font-medium text-lg",
                    location.pathname === item.path 
                      ? "bg-white border border-[#5a5a40]/20 text-[#5a5a40] shadow-sm" 
                      : "text-[#5a5a40]/70 hover:bg-white/50"
                  )}
                >
                  <item.icon className={cn("w-6 h-6", location.pathname === item.path ? "text-[#d4a373]" : "")} />
                  {item.name}
                </Link>
              ))}
           </nav>
         </div>
         {/* Space for bottom nav */}
         <div className="h-20 shrink-0"></div>
      </div>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-[#5a5a40]/10 flex items-center justify-around z-50 md:hidden pb-safe">
          {taskbarItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                location.pathname === item.path && !mobileMenuOpen
                  ? "text-[#5a5a40]" 
                  : "text-[#5a5a40]/40"
              )}
            >
              {location.pathname === item.path && !mobileMenuOpen && (
                <div className="absolute top-0 w-8 h-1 bg-[#5a5a40] rounded-b-full"></div>
              )}
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          ))}
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
              mobileMenuOpen ? "text-[#5a5a40]" : "text-[#5a5a40]/40"
            )}
          >
            {mobileMenuOpen && (
              <div className="absolute top-0 w-8 h-1 bg-[#5a5a40] rounded-b-full"></div>
            )}
            {mobileMenuOpen ? <X className="w-6 h-6 mb-1" /> : <Menu className="w-6 h-6 mb-1" />}
            <span className="text-[10px] font-medium">{mobileMenuOpen ? 'Đóng' : 'Menu'}</span>
          </button>
        </nav>
    </div>
  );
}
