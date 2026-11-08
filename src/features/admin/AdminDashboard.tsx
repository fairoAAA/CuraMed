import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminService } from '@/services';
import { bannerService } from '@/services/mock/bannerService';
import type { KpiSnapshot, FeatureFlags, AdBanner } from '@/types';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/States';
import { format, subDays } from 'date-fns';
import {
  Clock,
  UserX,
  UserCheck,
  CheckCircle2,
  Sliders,
  FileText,
  Megaphone,
  Shield,
  Activity,
} from 'lucide-react';

const today = format(new Date(), 'yyyy-MM-dd');
const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [kpi, setKpi] = useState<KpiSnapshot[]>([]);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getKpi(weekAgo, today),
      adminService.getFeatureFlags(),
      bannerService.getAllBanners(),
    ]).then(([k, f, b]) => {
      setKpi(k);
      setFlags(f);
      setBanners(b);
    }).finally(() => setLoading(false));
  }, []);

  const handleToggleRatings = async () => {
    if (!flags) return;
    await adminService.setFeatureFlag('publicRatings', !flags.publicRatings);
    setFlags(prev => prev ? { ...prev, publicRatings: !prev.publicRatings } : null);
  };

  const handleToggleBanner = async (id: string) => {
    await bannerService.toggleBanner(id);
    const updated = await bannerService.getAllBanners();
    setBanners(updated);
  };

  if (loading) return <LoadingState message="Boshqaruv paneli yuklanmoqda..." />;

  const latest = kpi[kpi.length - 1];
  const avgWait = kpi.length ? Math.round(kpi.reduce((s, k) => s + k.avgWaitMinutes, 0) / kpi.length) : 0;
  const avgNoShow = kpi.length ? Math.round(kpi.reduce((s, k) => s + k.noShowRate, 0) / kpi.length * 100) : 0;
  const totalCompleted = kpi.reduce((s, k) => s + k.completedCount, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('admin.dashboard')}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Poliklinika qabuli tahlili, navbat intizomi, audit va reklama sozlamalari.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/audit"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4 text-slate-500" /> Audit jurnali
          </Link>
          <Link
            to="/admin/slots"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-xs"
          >
            <Sliders className="w-4 h-4 text-slate-500" /> Slot sozlamalari
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('admin.kpi.avgWait')}
          value={`${avgWait} ${t('common.minutes')}`}
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-50 text-blue-700 border-blue-200"
        />
        <KpiCard
          label={t('admin.kpi.noShowRate')}
          value={`${avgNoShow}%`}
          icon={<UserX className="w-5 h-5 text-red-600" />}
          bg="bg-red-50 text-red-700 border-red-200"
        />
        <KpiCard
          label={t('admin.kpi.patientsPerDoctor')}
          value={`${latest?.patientsPerDoctor ?? '—'}`}
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          bg="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <KpiCard
          label={t('admin.kpi.completed')}
          value={`${totalCompleted}`}
          icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
          bg="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Chart */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" /> Haftalik qabullar dinamikasi (Yakunlangan navbatlar)
          </h2>
          <span className="text-xs text-slate-400">Oxirgi 7 kun</span>
        </div>

        <div className="flex items-end gap-3 h-44 pt-6 pb-2 border-b border-slate-100">
          {kpi.map(day => {
            const maxVal = Math.max(...kpi.map(d => d.completedCount), 1);
            const height = Math.max(8, (day.completedCount / maxVal) * 100);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div
                  className="w-full bg-gradient-to-t from-brand-700 to-brand-500 rounded-t-lg transition-all group-hover:from-brand-600 group-hover:to-brand-400 relative"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                    {day.completedCount} ta qabul
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{day.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Feature Flags & Advertising / Partner Slots Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Feature Flags */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Tizim parametrlari va funksiya bayroqlari</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">{t('admin.publicRatings')}</p>
                <p className="text-[11px] text-slate-500">{t('admin.ratingsNote')}</p>
              </div>

              {flags && (
                <button
                  onClick={handleToggleRatings}
                  className={`relative w-12 h-6 rounded-full transition-colors ${flags.publicRatings ? 'bg-brand-600' : 'bg-slate-300'}`}
                  role="switch"
                  aria-checked={flags.publicRatings}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${flags.publicRatings ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
              ℹ️ <strong>Pilot rejim qoidasi:</strong> Bemorlar fikr-mulohazalari kamida 10 ta to'plangandagina shifokor reytingi hisoblanadi.
            </div>
          </div>
        </Card>

        {/* Reklama va Hamkorlik Bannerlari Boshqaruvi */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-sm">Reklama va e'lon joylari (Slots)</h3>
            </div>
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              {banners.filter(b => b.active).length} faol
            </span>
          </div>

          <div className="space-y-2.5">
            {banners.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
              >
                <div className="space-y-0.5 overflow-hidden pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{b.title}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                      {b.placement}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{b.sponsorName}</p>
                </div>

                <button
                  onClick={() => handleToggleBanner(b.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                    b.active
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {b.active ? 'Yoqilgan' : 'O\'chirilgan'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ label: string; value: string; icon: React.ReactNode; bg: string }> = ({ label, value, icon, bg }) => (
  <Card className="p-5 bg-white border-slate-200 shadow-sm flex items-center gap-3.5">
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-none border ${bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  </Card>
);
