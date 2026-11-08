import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { doctorService, appointmentService } from '@/services';
import { useAppointmentStore } from '@/store/appointmentStore';
import type { Doctor, Specialty } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingState } from '@/components/States';
import { format, addDays } from 'date-fns';
import { MOCK_USERS, normalizePhone } from '@/services/mock/mockData';
import QRCode from 'react-qr-code';
import {
  UserPlus,
  Printer,
  CheckCircle2,
  Search,
  RotateCcw,
} from 'lucide-react';

const TODAY = new Date();

export const RegistrarDashboard: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user)!;
  const bookSlot = useAppointmentStore(s => s.bookSlot);

  const [step, setStep] = useState<'find-patient' | 'pick-specialty' | 'pick-doctor' | 'pick-slot' | 'done'>('find-patient');
  const [patientPhone, setPatientPhone] = useState('+998 ');
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(TODAY, 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<{ id: string; startsAt: string; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedTicket, setBookedTicket] = useState<{ id: string; qrCode: string; queuePosition: number; time: string } | null>(null);

  useEffect(() => {
    doctorService.listSpecialties().then(setSpecialties);
  }, []);

  const handleFindPatient = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = patientPhone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('Iltimos, telefon raqamini to\'liq kiriting');
      return;
    }

    const norm = normalizePhone(cleanPhone);
    const found = MOCK_USERS.find(u => normalizePhone(u.phone) === norm);
    if (found) {
      setPatientId(found.id);
      setPatientName(found.name);
    } else {
      setPatientId(`walk-in-${norm.slice(-6) || Math.random().toString(36).slice(2, 6)}`);
      setPatientName(`Keksa/Mehmon bemor (${norm.slice(-4)})`);
    }
    setStep('pick-specialty');
  };

  const handlePickSpecialty = async (sp: Specialty) => {
    setSelectedSpecialty(sp);
    setLoading(true);
    const docs = await doctorService.listBySpecialty(sp);
    setDoctors(docs);
    setLoading(false);
    setStep('pick-doctor');
  };

  const handlePickDoctor = async (doc: Doctor) => {
    setSelectedDoctor(doc);
    setLoading(true);
    const s = await appointmentService.listSlots(doc.id, selectedDate);
    setSlots(s);
    setLoading(false);
    setStep('pick-slot');
  };

  const handleBook = async () => {
    if (!selectedSlot || !selectedDoctor) return;
    setLoading(true);
    setError('');
    try {
      const ticket = await bookSlot({ slotId: selectedSlot, patientId, bookedBy: user.id });
      setBookedTicket({
        id: ticket.id,
        qrCode: ticket.qrCode,
        queuePosition: ticket.queuePosition,
        time: format(new Date(ticket.estimatedCallTime), 'HH:mm'),
      });
      setStep('done');
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg === 'appointment.slotUnavailable' ? 'Ushbu vaqt band' : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('find-patient');
    setPatientPhone('+998 ');
    setPatientId('');
    setPatientName('');
    setSelectedSpecialty(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSlots([]);
    setDoctors([]);
    setBookedTicket(null);
    setError('');
  };

  if (loading) return <LoadingState message="Bemor ma'lumotlari yangilanmoqda..." />;

  const stepLabels = [
    { key: 'find-patient', label: '1. Bemor' },
    { key: 'pick-specialty', label: '2. Mutaxassislik' },
    { key: 'pick-doctor', label: '3. Shifokor' },
    { key: 'pick-slot', label: '4. Vaqt' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('registrar.bookForPatient')}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Poliklinikaga bevosita kelgan (yoki yoshi katta) bemorlar uchun navbat berish kioski.
          </p>
        </div>
        <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
          Registratura oynasi
        </span>
      </div>

      {/* Wizard Steps indicator */}
      {step !== 'done' && (
        <div className="grid grid-cols-4 gap-2">
          {stepLabels.map((s, idx) => {
            const currentIdx = stepLabels.findIndex(x => x.key === step);
            const isDone = currentIdx > idx;
            const isCurrent = step === s.key;
            return (
              <div
                key={s.key}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-xs'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <span className="text-xs">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 1: Find Patient */}
      {step === 'find-patient' && (
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('registrar.walkIn')}</h2>
              <p className="text-xs text-slate-500">Bemorning telefon raqamini kiriting yoki bazadan toping.</p>
            </div>
          </div>

          <form onSubmit={handleFindPatient} className="space-y-4">
            <Input
              label={t('registrar.patientPhone')}
              type="tel"
              value={patientPhone}
              onChange={e => setPatientPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              error={error}
              autoFocus
            />

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">💡 Tezkor sinov uchun bemorlar:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPatientPhone('+998901234567')}
                  className="px-2.5 py-1 bg-white border rounded-lg text-brand-700 font-medium hover:bg-brand-50"
                >
                  Aziz Karimov (+998901234567)
                </button>
                <button
                  type="button"
                  onClick={() => setPatientPhone('+998907654321')}
                  className="px-2.5 py-1 bg-white border rounded-lg text-brand-700 font-medium hover:bg-brand-50"
                >
                  Malika Yusupova (+998907654321)
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> {t('registrar.findPatient')}
            </Button>
          </form>
        </Card>
      )}

      {/* Step 2: Pick Specialty */}
      {step === 'pick-specialty' && (
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bemor: {patientName} ({patientPhone})
            </span>
            <button onClick={() => setStep('find-patient')} className="underline text-emerald-700 hover:text-emerald-900">
              O'zgartirish
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-900">{t('patient.pickSpecialty')}</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specialties.map(sp => (
              <button
                key={sp}
                onClick={() => handlePickSpecialty(sp)}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition group"
              >
                <p className="font-bold text-slate-900 text-sm group-hover:text-brand-600 capitalize">
                  {t(`specialty.${sp}`)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Shifokor tanlash →</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 3: Pick Doctor */}
      {step === 'pick-doctor' && (
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-sm space-y-5">
          <button onClick={() => setStep('pick-specialty')} className="text-xs font-semibold text-brand-600 hover:underline">
            ← Mutaxassislikka qaytish
          </button>

          <h2 className="text-lg font-bold text-slate-900">
            {t('patient.pickDoctor')} {selectedSpecialty ? `(${t(`specialty.${selectedSpecialty}`)})` : ''}
          </h2>

          <div className="space-y-3">
            {doctors.map(doc => (
              <div
                key={doc.id}
                onClick={() => handlePickDoctor(doc)}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <img src={doc.photoUrl} alt={doc.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.startHour}:00 - {doc.endHour}:00 ({doc.slotDurationMin} min)</p>
                  </div>
                </div>

                <Button size="sm" variant="secondary">
                  Vaqtni tanlash
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step 4: Pick Slot */}
      {step === 'pick-slot' && selectedDoctor && (
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-sm space-y-5">
          <button onClick={() => setStep('pick-doctor')} className="text-xs font-semibold text-brand-600 hover:underline">
            ← Shifokorga qaytish
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{selectedDoctor.name}</h2>
            <p className="text-xs text-slate-500 capitalize">{t(`specialty.${selectedDoctor.specialty}`)} • Qabul vaqtini tasdiqlang</p>
          </div>

          {/* Date selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 5 }, (_, i) => {
              const d = addDays(TODAY, i);
              const val = format(d, 'yyyy-MM-dd');
              return (
                <button
                  key={val}
                  onClick={async () => {
                    setSelectedDate(val);
                    const s = await appointmentService.listSlots(selectedDoctor.id, val);
                    setSlots(s);
                  }}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition ${
                    selectedDate === val ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white'
                  }`}
                >
                  {format(d, 'dd.MM')}
                </button>
              );
            })}
          </div>

          {/* Slot buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {slots.map(slot => {
              const time = format(new Date(slot.startsAt), 'HH:mm');
              return (
                <button
                  key={slot.id}
                  disabled={!slot.isAvailable}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold transition ${
                    !slot.isAvailable
                      ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                      : selectedSlot === slot.id
                        ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>

          {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}

          <Button onClick={handleBook} disabled={!selectedSlot} size="lg" className="w-full">
            {t('registrar.bookOnBehalf')}
          </Button>
        </Card>
      )}

      {/* Done / Printed Ticket Voucher for elderly patient */}
      {step === 'done' && bookedTicket && (
        <Card className="p-6 sm:p-8 bg-white border-2 border-emerald-400 shadow-xl rounded-3xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Muvaffaqiyatli band qilindi
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Navbat raqami: #{bookedTicket.queuePosition}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Bemor: <strong>{patientName}</strong> • Qabul vaqti: <strong>{bookedTicket.time}</strong>
            </p>
          </div>

          {/* Printable Ticket Card */}
          <div className="max-w-xs mx-auto p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 space-y-3">
            <QRCode value={bookedTicket.qrCode} size={150} className="mx-auto" />
            <p className="text-[11px] font-mono text-slate-500">Chipta ID: {bookedTicket.id}</p>
            <p className="text-xs font-semibold text-slate-700">
              Registratura tomonidan chiqarilgan qog'oz chipta
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button onClick={() => window.print()} variant="secondary" className="flex items-center justify-center gap-1.5">
              <Printer className="w-4 h-4" /> Chiptani chop etish
            </Button>
            <Button onClick={reset} className="flex items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Boshqa bemor uchun
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
