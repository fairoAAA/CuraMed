import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useNotificationStore } from '@/store/notificationStore';
import { timeService } from '@/services';
import { AdBannerSlot } from './AdBannerSlot';
import type { UserRole } from '@/types';
import {
  Bell,
  LogOut,
  Clock,
  User,
  Shield,
  Stethoscope,
  ClipboardList,
  PhoneCall,
  Calendar,
  Ticket as TicketIcon,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, quickLogin } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(timeService.format(timeService.now(), 'HH:mm:ss'));
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(timeService.format(timeService.now(), 'HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchRole = async (role: UserRole) => {
    setShowRoleMenu(false);
    await quickLogin(role);
    if (role === 'doctor') navigate('/doctor');
    else if (role === 'registrar') navigate('/registrar');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  const langs = [
    { code: 'uz', label: "O'z" },
    { code: 'ru', label: 'Ру' },
    { code: 'en', label: 'En' },
  ];

  // Role badges and config
  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    patient: { label: 'Bemor', icon: <User className="w-3.5 h-3.5" />, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    doctor: { label: 'Shifokor', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    registrar: { label: 'Registratura', icon: <ClipboardList className="w-3.5 h-3.5" />, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    admin: { label: 'Admin', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* ── Top Announcement / Advertisement Bar ── */}
      <AdBannerSlot placement="top_bar" />

      {/* ── Main Header ── */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo & Polyclinic info */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                🏥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                    {t('app.name')}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                    № 7 Poliklinika
                  </span>
                </div>
                <span className="hidden md:block text-xs text-slate-500 leading-none mt-0.5">
                  Toshkent shahar Yunusobod tumani
                </span>
              </div>
            </Link>

            {/* Navigation based on role */}
            {user && (
              <nav className="hidden lg:flex items-center gap-1">
                {user.role === 'patient' && (
                  <>
                    <Link
                      to="/"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                        location.pathname === '/' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Bosh sahifa
                    </Link>
                    <Link
                      to="/specialties"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        location.pathname.startsWith('/specialties') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-brand-500" />
                      Qabulga yozilish
                    </Link>
                    <Link
                      to="/tickets"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        location.pathname.startsWith('/tickets') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <TicketIcon className="w-4 h-4 text-brand-500" />
                      Mening navbatlarim
                    </Link>
                  </>
                )}

                {user.role === 'doctor' && (
                  <>
                    <Link
                      to="/doctor"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        location.pathname === '/doctor' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Bugungi navbat
                    </Link>
                  </>
                )}

                {user.role === 'registrar' && (
                  <>
                    <Link
                      to="/registrar"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        location.pathname === '/registrar' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-purple-600" />
                      Bemor ro'yxatga olish
                    </Link>
                    <Link
                      to="/specialties"
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    >
                      Mutaxassislar
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        location.pathname === '/admin' ? 'bg-amber-50 text-amber-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-amber-600" />
                      KPI Dashboard
                    </Link>
                    <Link
                      to="/admin/audit"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                        location.pathname === '/admin/audit' ? 'bg-amber-50 text-amber-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Audit jurnali
                    </Link>
                    <Link
                      to="/admin/slots"
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                        location.pathname === '/admin/slots' ? 'bg-amber-50 text-amber-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Slot sozlamalari
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-3">
            {/* Live Clock (Mock timeService) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span className="font-mono font-medium">{currentTime}</span>
            </div>

            {/* Language Switcher */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-0.5 text-xs">
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => i18n.changeLanguage(l.code)}
                  className={`px-2 py-1 rounded font-semibold transition ${
                    i18n.language === l.code ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Notifications */}
            {user && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                aria-label="Xabarnomalar"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute 1 top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile & Quick Role Switcher */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${roleConfig[user.role].bg} ${roleConfig[user.role].color} font-bold`}>
                    {roleConfig[user.role].icon}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.name}</p>
                    <p className={`text-[10px] font-semibold ${roleConfig[user.role].color}`}>
                      {roleConfig[user.role].label}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Role Switcher Dropdown */}
                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-500">Tizimga kirilgan:</p>
                      <p className="font-bold text-sm text-slate-900">{user.name}</p>
                      <p className="text-xs text-brand-600 font-medium">{user.phone}</p>
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Rolni almashtirish (Demo):
                    </p>

                    {(['patient', 'doctor', 'registrar', 'admin'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => handleSwitchRole(r)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
                          user.role === r ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${roleConfig[r].bg} ${roleConfig[r].color}`}>
                          {roleConfig[r].icon}
                        </div>
                        <span className="flex-1 text-left">{roleConfig[r].label}</span>
                        {user.role === r && <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">Hozirgi</span>}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 mt-2 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Tizimdan chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              >
                Kirish
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6" id="main-content">
        {children}
      </main>

      {/* ── Footer with Advertisement slot and Polyclinic details ── */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Footer Ad banner */}
          <div className="mb-6">
            <AdBannerSlot placement="footer_banner" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100 text-sm">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏥</span>
                <span className="font-extrabold text-slate-900 text-base">CuraMed Poliklinika Tizimi</span>
              </div>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Aholiga qulay, shaffof va navbatsiz tibbiy xizmat ko'rsatish maqsadida yaratilgan raqamli qabul portali.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                * Tizim rasmiy davlat OneID tizimi emas, tuman poliklinikasi ichki navbat tartibini boshqarish uchun mo'ljallangan.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Ish vaqti</h5>
              <p className="text-xs text-slate-600">Dushanba – Juma: 08:00 – 18:00</p>
              <p className="text-xs text-slate-600">Shanba: 08:00 – 14:00</p>
              <p className="text-xs text-slate-400">Yakshanba: Navbatchi shifokor</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Aloqa va Yordam</h5>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-brand-600" /> Poliklinika registratura: (71) 200-07-07
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Tez yordam chaqiruvi: <strong>103</strong>
              </p>
              <p className="text-xs text-slate-600 mt-1">
                SSV ishonch telefoni: <strong>1003</strong>
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>© 2026 CuraMed. Barcha huquqlar himoyalangan.</span>
            <span>Raqamli Sog'liqni Saqlash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
