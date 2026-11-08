import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { Card } from '@/components/Card';
import { AdBannerSlot } from '@/components/AdBannerSlot';
import {
  Calendar,
  Ticket as TicketIcon,
  Bell,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  Heart,
  Stethoscope,
  Eye,
  Baby,
} from 'lucide-react';

export const PatientHome: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user)!;
  const { tickets, fetchPatientTickets } = useAppointmentStore();

  useEffect(() => {
    if (user?.id) {
      fetchPatientTickets(user.id);
    }
  }, [user?.id, fetchPatientTickets]);

  const activeTicket = tickets.find(
    t => !['completed', 'cancelled', 'no_show'].includes(t.status)
  );

  return (
    <div className="space-y-8">
      {/* ── Welcome & Active Queue Alert (if any) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-brand-200 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Onlayn qabul tizimi faol
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assalomu alaykum, {user.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-blue-200/90 max-w-xl">
            Tuman poliklinikasi xizmatlaridan navbatsiz foydalaning. Mutaxassis tanlang va qulay vaqtni band qiling.
          </p>
        </div>

        {activeTicket ? (
          <div className="relative z-10 flex-none bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
              <Clock className="w-3.5 h-3.5" /> Faol navbatingiz mavjud
            </div>
            <p className="text-sm font-bold text-white capitalize">
              {t(`specialty.${activeTicket.specialty}`)}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              Navbat raqami: <strong>#{activeTicket.queuePosition}</strong>
            </p>
            <Link
              to={`/tickets/${activeTicket.id}/qr`}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-900 hover:bg-brand-50 text-xs font-bold transition shadow-sm w-full justify-center"
            >
              <QrCode className="w-4 h-4 text-brand-700" /> QR-chiptani ko'rish
            </Link>
          </div>
        ) : (
          <div className="relative z-10 flex-none">
            <Link
              to="/specialties"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-brand-900 hover:bg-brand-50 text-sm font-bold transition shadow-lg hover:shadow-xl active:scale-95"
            >
              <Calendar className="w-4.5 h-4.5 text-brand-600" />
              Yangi navbat olish
            </Link>
          </div>
        )}
      </div>

      {/* ── Featured Advertisement / Promo Slot ── */}
      <section aria-label="Reklama va aksiyalar">
        <AdBannerSlot placement="home_hero" />
      </section>

      {/* ── Main Service Action Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Asosiy xizmatlar</h2>
          <span className="text-xs text-slate-500">Tezkor o'tish</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link to="/specialties" className="group">
            <Card className="h-full hover:border-brand-300 hover:shadow-md transition-all relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                {t('patient.bookSlot')}
              </h3>
              <p className="text-slate-500 text-sm mt-1 mb-4 leading-relaxed">
                Terapevt, kardiolog, pediatr va boshqa tuman shifokorlari qabuliga yoziling.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:gap-2 transition-all">
                Shifokor tanlash <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link to="/tickets" className="group">
            <Card className="h-full hover:border-indigo-300 hover:shadow-md transition-all relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                <TicketIcon className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {t('patient.myTickets')}
                </h3>
                {tickets.length > 0 && (
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {tickets.length} ta
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-1 mb-4 leading-relaxed">
                Faol QR chiptalar, qabul vaqti hisobi va o'tgan qabullarni baholash.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-2 transition-all">
                Chiptalarni ko'rish <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link to="/notifications" className="group">
            <Card className="h-full hover:border-amber-300 hover:shadow-md transition-all relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Xabarnomalar
              </h3>
              <p className="text-slate-500 text-sm mt-1 mb-4 leading-relaxed">
                Shifokor qabuli kechikishi yoki navbatingiz yetib kelgani haqida tezkor xabarlar.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:gap-2 transition-all">
                Xabarlarni ochish <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Quick Specialty Shortcuts + Sidebar Ad Slot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Popular Specialties (8 cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Ommabop mutaxassisliklar</h2>
            <Link to="/specialties" className="text-xs font-semibold text-brand-600 hover:underline">
              Barchasini ko'rish →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'therapist', name: 'Terapevt', icon: <Stethoscope className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
              { id: 'cardiologist', name: 'Kardiolog', icon: <Heart className="w-5 h-5 text-red-600" />, bg: 'bg-red-50' },
              { id: 'pediatrician', name: 'Pediatr', icon: <Baby className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
              { id: 'ophthalmologist', name: 'Ko\'z shifokori', icon: <Eye className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
            ].map(item => (
              <Link
                key={item.id}
                to={`/specialties/${item.id}/doctors`}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-brand-400 hover:shadow-sm text-center transition group flex flex-col items-center gap-2"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-400">Bo'sh navbatlar</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar / Partner Ad Slot (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hamkor takliflari
            </span>
          </div>
          <AdBannerSlot placement="sidebar_card" />
        </div>
      </div>
    </div>
  );
};
