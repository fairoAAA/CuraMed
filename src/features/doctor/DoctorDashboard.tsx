import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { appointmentService, timeService } from '@/services';
import type { Ticket } from '@/types';
import { Card } from '@/components/Card';
import { Badge, ticketStatusVariant } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/States';
import { Input } from '@/components/Input';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  Volume2,
  Play,
  RotateCcw,
} from 'lucide-react';

const AUTO_COMPLETE_SECONDS = 180; // 3 minutes after "in_progress"

export const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user)!;
  const { tickets, loading, fetchDoctorQueue, transition } = useAppointmentStore();

  const [priorityReason, setPriorityReason] = useState('');
  const [priorityPatientPhone, setPriorityPatientPhone] = useState('');
  const [showPriorityForm, setShowPriorityForm] = useState(false);
  const [autoCompleteCountdown, setAutoCompleteCountdown] = useState<number | null>(null);
  const [priorityError, setPriorityError] = useState('');

  const refresh = useCallback(() => fetchDoctorQueue(user.id), [user.id, fetchDoctorQueue]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000); // refresh every 15s
    return () => clearInterval(id);
  }, [refresh]);

  // Auto-complete timer
  const inProgress = tickets.find(t => t.status === 'in_progress');
  useEffect(() => {
    if (!inProgress?.startedAt) {
      setAutoCompleteCountdown(null);
      return;
    }
    const startedMs = new Date(inProgress.startedAt).getTime();

    const tick = () => {
      const nowMs = timeService.now().getTime();
      const elapsed = (nowMs - startedMs) / 1000;
      const left = Math.max(0, AUTO_COMPLETE_SECONDS - elapsed);
      setAutoCompleteCountdown(Math.round(left));
      if (left <= 0) {
        transition(inProgress.id, 'completed').then(refresh);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [inProgress?.id, inProgress?.startedAt, transition, refresh]);

  const waiting = tickets.filter(t => t.status === 'checked_in');
  const called = tickets.find(t => t.status === 'called');
  const current = tickets.find(t => t.status === 'in_progress');
  const nowMs = timeService.now().getTime();

  const handleCallNext = async () => {
    const next = waiting[0] || called;
    if (!next) return;
    if (next.status === 'checked_in') await transition(next.id, 'called');
    else if (next.status === 'called') await transition(next.id, 'in_progress');
    refresh();
  };

  const handleComplete = async () => {
    if (!current) return;
    await transition(current.id, 'completed');
    refresh();
  };

  const handleNoShow = async (ticket: Ticket) => {
    await transition(ticket.id, 'no_show', '5 daqiqa kutish vaqti tugadi');
    refresh();
  };

  const handlePriorityInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    setPriorityError('');
    if (!priorityReason.trim()) {
      setPriorityError(t('doctor.priorityReason'));
      return;
    }
    try {
      const nowTime = timeService.now().getTime();
      await appointmentService.priorityInsert({
        doctorId: user.id,
        patientId: priorityPatientPhone.trim() || `favqulodda-${nowTime}`,
        reason: priorityReason,
        actorId: user.id,
      });
      setPriorityReason('');
      setPriorityPatientPhone('');
      setShowPriorityForm(false);
      refresh();
    } catch {
      setPriorityError(t('common.error'));
    }
  };

  if (loading && tickets.length === 0) return <LoadingState message="Navbat ro'yxati yuklanmoqda..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Doctor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl shadow-inner">
            🩺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{t('doctor.todayQueue')}</h1>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Kabinet ochiq
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.name} • Navbat boshqaruv paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowPriorityForm(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            {t('doctor.priorityInsert')}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            className="flex items-center gap-1.5"
            title="Yangilash"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Emergency Priority Insert Form */}
      {showPriorityForm && (
        <Card className="border-red-300 bg-red-50/80 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-red-200 mb-4">
            <h2 className="text-base font-extrabold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {t('doctor.priorityInsert')} (Audit jurnalida qayd etiladi)
            </h2>
            <button
              onClick={() => setShowPriorityForm(false)}
              className="text-red-700 hover:text-red-900 text-xs font-bold"
            >
              Yopish ✕
            </button>
          </div>

          <form onSubmit={handlePriorityInsert} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bemor ismi yoki telefoni (ixtiyoriy)"
                value={priorityPatientPhone}
                onChange={e => setPriorityPatientPhone(e.target.value)}
                placeholder="+998..."
              />
              <Input
                label={t('doctor.priorityReason')}
                value={priorityReason}
                onChange={e => setPriorityReason(e.target.value)}
                placeholder="Masalan: Yuqori isitma, hushdan ketish xavfi..."
                error={priorityError}
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowPriorityForm(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="danger">
                Navbat boshiga qo'shish
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Consultation In Progress */}
      {current && (
        <Card className="border-2 border-emerald-400 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl flex-none shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                  🟢 Hozir kabinetda
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {current.patientName || current.patientId}
                </h3>
                <p className="text-xs text-slate-500">
                  Chipta ID: {current.id} • Qabul boshlangan: {current.startedAt ? current.startedAt.slice(11, 16) : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              {autoCompleteCountdown !== null && (
                <div className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {t('doctor.autoComplete', { sec: autoCompleteCountdown })}
                </div>
              )}
              <Button onClick={handleComplete} size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t('doctor.completeVisit')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Called Patient Notice */}
      {called && !current && (
        <Card className="border-2 border-amber-400 bg-amber-50/90 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl flex-none shadow-sm animate-bounce">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                  🔔 Chaqirilgan bemor
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {called.patientName || called.patientId}
                </h3>
                <p className="text-xs text-amber-900 mt-0.5">
                  Bemor kabinetga kirishini kuting va qabulni boshlang.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => transition(called.id, 'in_progress').then(refresh)}
                className="bg-brand-600 hover:bg-brand-700 flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Qabulni boshlash
              </Button>
              <Button
                variant="danger"
                onClick={() => handleNoShow(called)}
                className="text-xs"
              >
                <UserX className="w-4 h-4" /> Kelmadi
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Waiting Queue List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Kutayotgan bemorlar</span>
            <span className="text-xs font-extrabold bg-blue-100 text-brand-700 px-2.5 py-0.5 rounded-full">
              {waiting.length} ta
            </span>
          </h2>

          {!current && !called && waiting.length > 0 && (
            <Button onClick={handleCallNext} size="lg" className="flex items-center gap-2 shadow-md">
              <Volume2 className="w-5 h-5" /> {t('doctor.callNext')}
            </Button>
          )}
        </div>

        {waiting.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 bg-white">
            <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Hozirda kutish zalida bemorlar yo'q</p>
            <p className="text-xs text-slate-400 mt-1">Yangi bemorlar ro'yxatdan o'tganda bu yerda ko'rinadi.</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {waiting.map((ticket, idx) => {
              const estimatedMs = new Date(ticket.estimatedCallTime).getTime();
              const waitMin = Math.max(0, Math.round((estimatedMs - nowMs) / 60000));
              return (
                <div
                  key={ticket.id}
                  className={`flex items-center justify-between p-4 rounded-2xl bg-white border transition-all ${
                    idx === 0 ? 'border-brand-400 shadow-sm ring-1 ring-brand-400/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                      idx === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{ticket.queuePosition}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {ticket.patientName || ticket.patientId}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Kutilayotgan vaqt: ~{waitMin} {t('common.minutes')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={ticketStatusVariant(ticket.status)} className="text-xs">
                      {t(`ticket.status.${ticket.status}`)}
                    </Badge>
                    {idx === 0 && !current && !called && (
                      <Button onClick={handleCallNext} size="sm">
                        Chaqirish
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Full Queue History */}
      {tickets.length > 0 && (
        <Card className="bg-white border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Bugungi barcha navbatlar holati ({tickets.length})
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {tickets.map(tk => (
              <div key={tk.id} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  #{tk.queuePosition} — {tk.patientName || tk.patientId}
                </span>
                <Badge variant={ticketStatusVariant(tk.status)} className="text-[11px]">
                  {t(`ticket.status.${tk.status}`)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
