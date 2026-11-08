import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { timeService } from '@/services';
import { Card } from '@/components/Card';
import { Badge, ticketStatusVariant } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { AdBannerSlot } from '@/components/AdBannerSlot';
import { format, parseISO } from 'date-fns';
import type { Ticket } from '@/types';
import {
  Calendar,
  Clock,
  QrCode,
  Star,
} from 'lucide-react';

const ACTIVE_STATUSES = ['booked', 'checked_in', 'called', 'in_progress'];

export const MyTicketsPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user)!;
  const { tickets, loading, error, fetchPatientTickets, cancel } = useAppointmentStore();

  useEffect(() => {
    fetchPatientTickets(user.id);
  }, [user.id, fetchPatientTickets]);

  if (loading) return <LoadingState message="Navbatlaringiz yuklanmoqda..." />;
  if (error) return <ErrorState message={error} onRetry={() => fetchPatientTickets(user.id)} />;

  const active = tickets.filter(t => ACTIVE_STATUSES.includes(t.status));
  const past = tickets.filter(t => !ACTIVE_STATUSES.includes(t.status));

  const handleCancel = async (ticket: Ticket) => {
    if (!window.confirm(t('patient.confirmCancel'))) return;
    await cancel(ticket.id, 'Bemor tomonidan bekor qilindi', user.id);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('patient.myTickets')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Poliklinikadagi faol va oldingi navbatlaringiz ro'yxati.
          </p>
        </div>
        <Link to="/specialties">
          <Button className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Calendar className="w-4 h-4" /> Yangi navbat olish
          </Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card className="text-center py-16 bg-white border-slate-200">
          <EmptyState message={t('patient.noTickets')} icon="🎫" />
          <Link to="/specialties" className="mt-4 inline-block">
            <Button>{t('patient.bookSlot')}</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Tickets */}
          {active.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('patient.activeTicket')} ({active.length})
                </h2>
                <span className="text-xs text-slate-500">
                  QR-chiptani shifokor qabulida ko'rsating
                </span>
              </div>

              <div className="space-y-4">
                {active.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onCancel={() => handleCancel(ticket)}
                    showQr
                    t={t}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Tickets */}
          {past.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-700">
                O'tgan navbatlar tarixi ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} t={t} />
                ))}
              </div>
            </section>
          )}

          {/* Ad slot */}
          <div className="pt-4">
            <AdBannerSlot placement="sidebar_card" />
          </div>
        </div>
      )}
    </div>
  );
};

interface TicketCardProps {
  ticket: Ticket;
  onCancel?: () => void;
  showQr?: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onCancel, showQr, t }) => {
  const isActive = ACTIVE_STATUSES.includes(ticket.status);
  const nowMs = timeService.now().getTime();
  const estimatedMs = new Date(ticket.estimatedCallTime).getTime();
  const waitMin = Math.max(0, Math.round((estimatedMs - nowMs) / 60000));

  return (
    <Card className={`transition-all ${
      isActive
        ? 'border-brand-300 bg-gradient-to-r from-blue-50/50 via-white to-white shadow-md'
        : 'border-slate-200 bg-white opacity-90'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={ticketStatusVariant(ticket.status)} className="font-bold text-xs">
              {t(`ticket.status.${ticket.status}`)}
            </Badge>
            {ticket.queuePosition > 0 && isActive && (
              <span className="text-xs font-extrabold text-brand-700 bg-brand-100/80 px-2.5 py-0.5 rounded-full border border-brand-200">
                Navbat raqami: #{ticket.queuePosition}
              </span>
            )}
          </div>

          <p className="text-lg font-extrabold text-slate-900 capitalize">
            {t(`specialty.${ticket.specialty}`)} qabuli
          </p>

          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>Sana: <strong>{format(parseISO(ticket.bookedAt), 'dd.MM.yyyy')}</strong></span>
            <span>•</span>
            <span>Taxminiy chaqiruv: <strong>{format(parseISO(ticket.estimatedCallTime), 'HH:mm')}</strong></span>
          </p>

          {isActive && (
            <p className="text-xs text-brand-700 font-semibold flex items-center gap-1.5 bg-brand-50 px-2.5 py-1 rounded-lg w-fit border border-brand-200">
              <Clock className="w-3.5 h-3.5" />
              {t('patient.waitEstimate')}: ~{waitMin} {t('common.minutes')}
            </p>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {showQr && isActive && (
            <Link to={`/tickets/${ticket.id}/qr`} className="w-full sm:w-auto">
              <Button size="sm" className="w-full flex items-center justify-center gap-1.5 shadow-sm">
                <QrCode className="w-4 h-4" /> QR Chipta
              </Button>
            </Link>
          )}
          {onCancel && ['booked', 'checked_in'].includes(ticket.status) && (
            <Button size="sm" variant="danger" onClick={onCancel} className="w-full sm:w-auto">
              {t('patient.cancel')}
            </Button>
          )}
          {ticket.status === 'completed' && (
            <Link to={`/tickets/${ticket.id}/review`} className="w-full sm:w-auto">
              <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                {t('patient.reviewDoctor')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};
