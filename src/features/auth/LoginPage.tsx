import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useNotificationStore } from '@/store/notificationStore';
import type { UserRole } from '@/types';
import {
  ShieldCheck,
  Clock,
  QrCode,
  HeartHandshake,
  UserCheck,
  Stethoscope,
  ClipboardList,
  Sparkles,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

type Step = 'phone' | 'otp';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, requestOtp, verifyOtp, quickLogin, loading, error } = useAuthStore();
  const fetchNotifications = useNotificationStore(s => s.fetch);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+998 ');
  const [otp, setOtp] = useState('123456');
  const [localError, setLocalError] = useState('');
  const [activeRoleLogging, setActiveRoleLogging] = useState<UserRole | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'doctor') navigate('/doctor', { replace: true });
      else if (user.role === 'registrar') navigate('/registrar', { replace: true });
      else if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handlePhoneChange = (val: string) => {
    if (!val.startsWith('+998')) {
      const digits = val.replace(/\D/g, '');
      setPhone(`+998 ${digits.slice(3)}`.trim());
    } else {
      setPhone(val);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setLocalError('Iltimos, to\'liq telefon raqamingizni kiriting');
      return;
    }
    try {
      await requestOtp(cleanPhone);
      setStep('otp');
    } catch {
      setLocalError(t('common.error'));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!otp.trim()) {
      setLocalError('Tasdiqlash kodini kiriting');
      return;
    }
    try {
      await verifyOtp(phone.trim(), otp.trim());
      const loggedUser = useAuthStore.getState().user;
      if (loggedUser) await fetchNotifications(loggedUser.id);

      const role = loggedUser?.role;
      if (role === 'doctor') navigate('/doctor', { replace: true });
      else if (role === 'registrar') navigate('/registrar', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'auth.invalidOtp') setLocalError(t('auth.invalidOtp'));
      else setLocalError(t('common.error'));
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setActiveRoleLogging(role);
    setLocalError('');
    try {
      await quickLogin(role);
      const loggedUser = useAuthStore.getState().user;
      if (loggedUser) await fetchNotifications(loggedUser.id);

      if (role === 'doctor') navigate('/doctor', { replace: true });
      else if (role === 'registrar') navigate('/registrar', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    } catch {
      setLocalError('Avtorizatsiyada xatolik yuz berdi');
    } finally {
      setActiveRoleLogging(null);
    }
  };

  const langs = [
    { code: 'uz', label: "O'zbekcha" },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-brand-500/20">
            🏥
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg leading-tight block">CuraMed</span>
            <span className="text-xs text-gray-500">Tuman poliklinikasi onlayn navbat tizimi</span>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => i18n.changeLanguage(l.code)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                i18n.language === l.code
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main dual pane */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero & Features (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Raqamlashtirilgan poliklinika navbat tizimi
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Poliklinikada navbatsiz, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                aniq va qulay qabul
              </span>
            </h1>

            <p className="text-gray-600 text-base sm:text-lg max-w-xl leading-relaxed">
              Shifokor qabuliga uydan turib yoziling, navbatingizni real-vaqtda kuzating va vaqtingizni tejang.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-brand-600 flex-none">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Jonli kutish hisobi</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Navbatning taxminiy chaqiruv vaqti doimiy yangilanib boradi.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 flex-none">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">30s QR e-chipta</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Xavfsiz, bir martalik dinamik kod bilan qabulga kiring.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 flex-none">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Raqamli qulaylik</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Yoshi kattalar va bolali onalar uchun sodda, katta shriftlar.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 flex-none">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Shaffof nazorat</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Barcha navbat harakatlari audit jurnalida qayd etiladi.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/90 p-6 sm:p-8 relative">
              {/* Neutral notification badge */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-500">
                  SMS-OTP avtorizatsiya portali
                </span>
              </div>

              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} noValidate className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {t('auth.title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Telefon raqamingizni kiriting va 6-xonali kod orqali kiring.
                    </p>
                  </div>

                  <Input
                    label="Telefon raqami"
                    type="tel"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    autoComplete="tel"
                    autoFocus
                    error={localError || (error?.includes('phone') ? error : undefined)}
                  />

                  <Button type="submit" className="w-full py-3.5 text-base shadow-sm" loading={loading}>
                    {loading ? t('auth.sending') : t('auth.sendOtp')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} noValidate className="space-y-4">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setLocalError(''); }}
                    className="text-brand-600 hover:text-brand-800 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    ← {t('auth.changePhone')}
                  </button>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('auth.otpTitle')}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-semibold text-gray-700">{phone}</span> raqamiga yuborilgan kodni kiriting.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs text-blue-800">
                    <span>💡 Demo tasdiqlash kodi: <strong>123456</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp('123456')}
                      className="text-brand-700 font-bold underline hover:text-brand-900"
                    >
                      Kiritish
                    </button>
                  </div>

                  <Input
                    label="SMS kod"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    autoFocus
                    error={localError || undefined}
                  />

                  <Button type="submit" className="w-full py-3.5 text-base" loading={loading}>
                    {loading ? t('auth.verifying') : t('auth.verifyOtp')}
                  </Button>
                </form>
              )}

              {/* 1-Click Fast Role Switcher */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Tezkor kirish (1-klik):
                  </span>
                  <span className="text-[11px] text-gray-400">Parolsiz demo</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('patient')}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100/80 text-left transition flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-none shadow-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-900 truncate group-hover:text-brand-700">Bemor</p>
                      <p className="text-[11px] text-gray-500 truncate">Aziz Karimov</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('doctor')}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-bold flex-none shadow-xs">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-700">Shifokor</p>
                      <p className="text-[11px] text-gray-500 truncate">Dr. Ravshan</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('registrar')}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/60 hover:bg-purple-100/80 text-left transition flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-none shadow-xs">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-700">Registratura</p>
                      <p className="text-[11px] text-gray-500 truncate">Nodira X.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/60 hover:bg-amber-100/80 text-left transition flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-bold flex-none shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-700">Admin</p>
                      <p className="text-[11px] text-gray-500 truncate">Jamshid U.</p>
                    </div>
                  </button>
                </div>

                {activeRoleLogging && (
                  <p className="text-xs text-brand-600 text-center mt-2 font-medium animate-pulse">
                    {activeRoleLogging} sifatida tizimga kirilmoqda...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 CuraMed. Tuman poliklinikasi onlayn qabul va navbat nazorati tizimi.</span>
          <span className="flex items-center gap-1 text-gray-400">
            <PhoneCall className="w-3.5 h-3.5" /> Call-markaz: <strong>1003</strong>
          </span>
        </div>
      </footer>
    </div>
  );
};
