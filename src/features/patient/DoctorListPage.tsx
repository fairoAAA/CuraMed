import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doctorService } from '@/services';
import type { Doctor } from '@/types';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingState, ErrorState } from '@/components/States';
import { Button } from '@/components/Button';
import { AdBannerSlot } from '@/components/AdBannerSlot';
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
} from 'lucide-react';

export const DoctorListPage: React.FC = () => {
  const { t } = useTranslation();
  const { specialty } = useParams<{ specialty: string }>();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!specialty) return;
    doctorService.listBySpecialty(specialty as never)
      .then(setDoctors)
      .catch(() => setError('Xatolik'))
      .finally(() => setLoading(false));
  }, [specialty]);

  if (loading) return <LoadingState message="Shifokorlar ro'yxati yuklanmoqda..." />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  const today = new Date().getDay();

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/specialties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Mutaxassisliklarga qaytish
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
            {t(`specialty.${specialty}`)} shifokorlari
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Poliklinika hududi bo'yicha shifokorni tanlang va qabul vaqtini belgilang.
          </p>
        </div>
        <span className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200 self-start sm:self-auto">
          {doctors.length} nafar shifokor
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {doctors.map(doc => {
          const isToday = doc.availableDays.includes(today);
          return (
            <Card key={doc.id} className="flex flex-col justify-between hover:shadow-md transition-all border-slate-200/90">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isToday ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h2 className="text-lg font-bold text-slate-900 truncate">{doc.name}</h2>
                    </div>
                    <p className="text-xs font-semibold text-brand-600 capitalize">
                      {t(`specialty.${doc.specialty}`)}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {doc.district} tumani
                    </p>
                  </div>

                  <Badge variant={isToday ? 'green' : 'gray'} className="text-[11px] font-bold">
                    {isToday ? 'Bugun qabul bor' : 'Boshqa kunlar'}
                  </Badge>
                </div>

                {/* Details row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100 text-xs text-slate-600">
                  <div>
                    <span className="block text-[10px] text-slate-400">Qabul davomiyligi</span>
                    <span className="font-bold text-slate-800">{doc.slotDurationMin} daqiqa</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Ish vaqti</span>
                    <span className="font-bold text-slate-800">{doc.startHour}:00 - {doc.endHour}:00</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Bemorlar bahosi</span>
                    {doc.rating && doc.reviewCount >= 10 ? (
                      <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {doc.rating}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-400">Pilot rejim</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Button
                  onClick={() => navigate(`/doctors/${doc.id}/book`)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {t('patient.bookSlot')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Ad slot */}
      <div className="pt-2">
        <AdBannerSlot placement="sidebar_card" />
      </div>
    </div>
  );
};
