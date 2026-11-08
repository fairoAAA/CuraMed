import React, { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppointmentStore } from '@/store/appointmentStore';
import { timeService } from '@/services';
import { Card } from '@/components/Card';
import { Badge, ticketStatusVariant } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/States';
import QRCode from 'react-qr-code';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const QR_REFRESH_INTERVAL = 30_000; // 30 seconds

export const QrTicketPage: React.FC = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { tickets, rotateQr, loading } = useAppointmentStore();

  const ticket = tickets.find(t => t.id === ticketId);

  const rotate = useCallback(async () => {
    if (ticketId) await rotateQr(ticketId);
  }, [ticketId, rotateQr]);

  // Rotate QR every 30s
  useEffect(() => {
    const interval = setInterval(rotate, QR_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [rotate]);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(30);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          rotate();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rotate]);

  if (loading && !ticket) return <LoadingState message="QR Chipta yuklanmoqda..." />;

  if (!ticket) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-3xl">
          🎫
        </div>
        <p className="text-slate-600 font-bold">Chipta topilmadi yoki eskirgan</p>
        <Button onClick={() => navigate('/tickets')}>Navbatlar ro'yxatiga qaytish</Button>
      </div>
    );
  }

  const isTerminal = ['completed', 'cancelled', 'no_show'].includes(ticket.status);
  const nowMs = timeService.now().getTime();
  const estimatedMs = new Date(ticket.estimatedCallTime).getTime();
  const waitMin = Math.max(0, Math.round((estimatedMs - nowMs) / 60000));

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Barcha navbatlarim
        </Link>
        <span className="text-xs text-slate-400 font-mono">ID: {ticket.id.slice(0, 10)}</span>
      </div>

      <Card className="text-center p-6 sm:p-8 rounded-3xl shadow-xl border-slate-200/90 relative overflow-hidden bg-white">
        {/* Top badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏥</span>
            <div className="text-left">
              <span className="text-xs font-extrabold text-slate-900 block leading-tight">CuraMed E-Chipta</span>
              <span className="text-[10px] text-slate-400">Tuman Poliklinikasi</span>
            </div>
          </div>
          <Badge variant={ticketStatusVariant(ticket.status)} className="font-bold text-xs">
            {t(`ticket.status.${ticket.status}`)}
          </Badge>
        </div>

        {!isTerminal ? (
          <div className="space-y-5">
            {/* Specialty title */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {t(`specialty.${ticket.specialty}`)} qabuli
              </p>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Navbat raqami: #{ticket.queuePosition}
              </h2>
            </div>

            {/* QR Code container */}
            <div className="relative inline-block p-4 rounded-3xl bg-slate-50 border-4 border-brand-100 shadow-inner">
              <QRCode
                value={ticket.qrCode}
                size={210}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox="0 0 256 256"
              />
            </div>

            {/* Rotating Timer Ring */}
            <div className="flex items-center justify-center gap-2.5 py-1">
              <div className="relative w-10 h-10 flex-none">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeDasharray={`${(secondsLeft / 30) * 94} 94`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-brand-700">
                  {secondsLeft}
                </span>
              </div>
              <div className="text-left text-xs text-slate-500">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-brand-600 animate-spin" /> {t('patient.qrRefreshes')}
                </p>
                <p className="text-[11px] text-slate-400">Xavfsiz dinamik bir martalik kod</p>
              </div>
            </div>

            {/* Queue info table */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">{t('patient.waitEstimate')}</span>
                <span className="font-extrabold text-brand-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{waitMin} {t('common.minutes')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Kutilayotgan vaqt</span>
                <span className="font-bold text-slate-900">
                  {format(parseISO(ticket.estimatedCallTime), 'HH:mm')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/70 text-left text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-none mt-0.5" />
              <span>
                Ushbu kodni poliklinika kirishidagi skanerga yoki shifokor xonasiga kirayotganda ko'rsating.
              </span>
            </div>
          </div>
        ) : (
          <div className="py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-3xl">
              {ticket.status === 'completed' ? '✅' : '❌'}
            </div>
            <h3 className="text-xl font-black text-slate-800">
              {t(`ticket.status.${ticket.status}`)}
            </h3>
            <p className="text-xs text-slate-400">Ushbu chiptaning amal qilish muddati tugagan.</p>

            {ticket.status === 'completed' && (
              <div className="pt-4">
                <Link to={`/tickets/${ticket.id}/review`}>
                  <Button className="w-full">Shifokorni baholash</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
