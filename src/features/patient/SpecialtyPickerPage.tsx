import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { doctorService } from '@/services';
import type { Specialty } from '@/types';
import { Card } from '@/components/Card';
import { LoadingState, ErrorState } from '@/components/States';
import { AdBannerSlot } from '@/components/AdBannerSlot';
import {
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Activity,
  Eye,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

const SPECIALTY_META: Record<Specialty, { icon: React.ReactNode; bg: string; color: string; duration: string; desc: string }> = {
  therapist: {
    icon: <Stethoscope className="w-7 h-7" />,
    bg: 'bg-blue-50 border-blue-200',
    color: 'text-blue-700',
    duration: '10 min',
    desc: 'Umumiy tekshiruv, shamollash, qon bosimi va profilaktika',
  },
  cardiologist: {
    icon: <Heart className="w-7 h-7" />,
    bg: 'bg-red-50 border-red-200',
    color: 'text-red-700',
    duration: '20 min',
    desc: 'Yurak faoliyati, EKG tahlillari va qon bosimi nazorati',
  },
  neurologist: {
    icon: <Brain className="w-7 h-7" />,
    bg: 'bg-purple-50 border-purple-200',
    color: 'text-purple-700',
    duration: '20 min',
    desc: 'Bosh og\'riqlari, asab tizimi va uyqu buzilishlari',
  },
  pediatrician: {
    icon: <Baby className="w-7 h-7" />,
    bg: 'bg-emerald-50 border-emerald-200',
    color: 'text-emerald-700',
    duration: '10 min',
    desc: 'Bolalar salomatligi, o\'sish dinamikasi va emlashlar',
  },
  surgeon: {
    icon: <Activity className="w-7 h-7" />,
    bg: 'bg-amber-50 border-amber-200',
    color: 'text-amber-700',
    duration: '30 min',
    desc: 'Yaralar, travmalar va birlamchi jarrohlik maslahati',
  },
  ophthalmologist: {
    icon: <Eye className="w-7 h-7" />,
    bg: 'bg-cyan-50 border-cyan-200',
    color: 'text-cyan-700',
    duration: '15 min',
    desc: 'Ko\'rish o\'tkirligi, ko\'z bosimi va ko\'zoynak tanlash',
  },
};

export const SpecialtyPickerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    doctorService.listSpecialties()
      .then(setSpecialties)
      .catch(() => setError('Xatolik'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Mutaxassisliklar ro'yxati yuklanmoqda..." />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600 transition">Bosh sahifa</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Mutaxassisliklar</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('patient.pickSpecialty')}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Qabulga yozilish uchun kerakli poliklinika yo'nalishini tanlang.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {specialties.map(sp => {
          const meta = SPECIALTY_META[sp];
          return (
            <Card
              key={sp}
              onClick={() => navigate(`/specialties/${sp}/doctors`)}
              className="cursor-pointer hover:border-brand-400 hover:shadow-md transition-all group flex flex-col justify-between"
              role="button"
              tabIndex={0}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${meta.bg} ${meta.color} group-hover:scale-105 transition-transform shadow-xs`}>
                    {meta.icon}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {meta.duration}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {t(`specialty.${sp}`)}
                </h2>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  {meta.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
                <span>Shifokorlar ro'yxati</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Advertisement / Announcement Placement */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hamkorlik va E'lonlar
        </div>
        <AdBannerSlot placement="sidebar_card" />
      </div>
    </div>
  );
};
