import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doctorService, appointmentService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import type { Doctor, Slot } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingState, ErrorState } from '@/components/States';
import { format, addDays } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const TODAY = new Date();

export const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user)!;
  const bookSlot = useAppointmentStore(s => s.bookSlot);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(TODAY, 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;
    doctorService.getById(doctorId).then(setDoctor).catch(() => setError('Shifokor topilmadi'));
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    appointmentService.listSlots(doctorId, selectedDate)
      .then(setSlots)
      .catch(() => setError('Slotlar yuklanmadi'))
      .finally(() => setLoading(false));
  }, [doctorId, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot || !doctorId) return;
    setBooking(true);
    setError(null);
    try {
      const ticket = await bookSlot({ slotId: selectedSlot, patientId: user.id, bookedBy: user.id });
      navigate(`/tickets/${ticket.id}/qr`);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === 'appointment.duplicateActiveTicket') {
        setError('Bu mutaxassislik bo\'yicha sizda allaqachon faol navbat mavjud. Bir mutaxassisga faqat bitta faol chipta olish mumkin.');
      } else if (msg === 'appointment.slotUnavailable') {
        setError('Kechirasiz, ushbu vaqt allaqachon boshqa bemor tomonidan band qilindi.');
      } else {
        setError(t('common.error'));
      }
    } finally {
      setBooking(false);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(TODAY, i);
    const dayOfWeek = d.getDay();
    const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    return {
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, 'dd.MM'),
      dayLabel: dayNames[dayOfWeek],
      isToday: i === 0,
    };
  });

  const chosenSlotObj = slots.find(s => s.id === selectedSlot);

  if (!doctor && !loading) return <ErrorState message="Shifokor ma'lumotlari topilmadi" />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={`/specialties/${doctor?.specialty}/doctors`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Shifokorlar ro'yxatiga qaytish
        </Link>
      </div>

      {/* Doctor Header Banner */}
      {doctor && (
        <Card className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div className="space-y-1.5 flex-1">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                {t(`specialty.${doctor.specialty}`)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{doctor.name}</h1>
              <p className="text-xs sm:text-sm text-blue-200 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5" /> Yunusobod tumani №7 Poliklinikasi
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-blue-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-300" /> Qabul muddati: <strong>{doctor.slotDurationMin} daqiqa</strong>
                </span>
                <span>•</span>
                <span>Ish soatlari: <strong>{doctor.startHour}:00 - {doctor.endHour}:00</strong></span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Date Picker Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          1. Qabul kunini tanlang
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map(d => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={`flex-none flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[76px] ${
                selectedDate === d.value
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm scale-102 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wide opacity-75">{d.dayLabel}</span>
              <span className="text-base font-extrabold mt-0.5">{d.label}</span>
              {d.isToday && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-1">
                  Bugun
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Qulay vaqtni tanlang
          </label>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600" /> Bo'sh
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Band
            </span>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Vaqt oraliklari yuklanmoqda..." />
        ) : slots.length === 0 ? (
          <Card className="text-center py-12 text-slate-500 bg-white">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">{t('patient.noSlots')}</p>
            <p className="text-xs text-slate-400 mt-1">Iltimos, yuqoridagi sanalardan boshqa kunni tanlab ko'ring.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {slots.map(slot => {
                const time = format(new Date(slot.startsAt), 'HH:mm');
                const isSelected = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      !slot.isAvailable
                        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                        : isSelected
                          ? 'border-brand-600 bg-brand-600 text-white shadow-md scale-105'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50/40'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            {/* Selected Summary Card */}
            {chosenSlotObj && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tanlangan vaqt</p>
                    <p className="text-base font-extrabold text-emerald-950">
                      {selectedDate} soat {format(new Date(chosenSlotObj.startsAt), 'HH:mm')}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-emerald-700 hidden sm:inline">
                  30s dinamik QR-chipta beriladi
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-none mt-0.5" />
                <div>
                  <p className="font-bold">Diqqat!</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleBook}
              disabled={!selectedSlot}
              loading={booking}
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-base shadow-lg hover:shadow-xl"
            >
              {booking ? 'Band qilinmoqda...' : 'Navbatni tasdiqlash va QR-chipta olish'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
