import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reviewService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import type { ReviewCriterion } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/States';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Heart,
  MessageSquare,
  Clock,
} from 'lucide-react';

const CRITERIA: Array<{ key: ReviewCriterion; labelKey: string; icon: React.ReactNode; desc: string }> = [
  {
    key: 'punctuality',
    labelKey: 'review.punctuality',
    icon: <Clock className="w-5 h-5 text-blue-600" />,
    desc: 'Shifokor belgilangan vaqtda qabul qildimi?',
  },
  {
    key: 'explanation',
    labelKey: 'review.explanation',
    icon: <Heart className="w-5 h-5 text-emerald-600" />,
    desc: 'Tashxis va tavsiyalar sizga tushunarli tarzda yetkazildimi?',
  },
  {
    key: 'communication',
    labelKey: 'review.communication',
    icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
    desc: 'Shifokor va xodimlar muomala madaniyati',
  },
];

export const ReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user)!;
  const { tickets, fetchPatientTickets } = useAppointmentStore();

  const [scores, setScores] = useState<Record<ReviewCriterion, number>>({
    punctuality: 0,
    explanation: 0,
    communication: 0,
  });
  const [template, setTemplate] = useState('');
  const [templates, setTemplates] = useState<Array<{ key: string; labelKey: string }>>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    reviewService.getReviewTemplates().then(setTemplates);
    if (user?.id && tickets.length === 0) {
      fetchPatientTickets(user.id);
    }
  }, [user?.id, tickets.length, fetchPatientTickets]);

  const ticket = tickets.find(tk => tk.id === ticketId);

  if (!ticket || ticket.status !== 'completed') {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-3xl">
          ⭐
        </div>
        <p className="text-slate-700 font-bold">Faqat yakunlangan qabullar uchun sharh qoldirish mumkin.</p>
        <Button onClick={() => navigate('/tickets')}>Navbatlar ro'yxatiga qaytish</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(scores).some(s => s === 0)) {
      setError('Iltimos, barcha mezonlar bo\'yicha yulduzchalarni belgilang');
      return;
    }
    if (!template) {
      setError('Iltimos, xizmat haqida umumiy xulosa andozasini tanlang');
      return;
    }
    setLoading(true);
    try {
      await reviewService.submitReview({
        ticketId: ticket.id,
        doctorId: ticket.doctorId,
        scores,
        templateKey: template,
      });
      setSubmitted(true);
    } catch (e) {
      setError(
        (e as Error).message === 'review.alreadySubmitted'
          ? 'Ushbu qabul uchun allaqachon baho berilgan'
          : t('common.error')
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Bahoyingiz yuborilmoqda..." />;

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto text-center py-12 px-6 rounded-3xl border-2 border-emerald-400 bg-white shadow-xl space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-bold">
          ✓
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('review.submitted')}</h2>
          <p className="text-slate-500 text-xs mt-1">
            Bahoyingiz poliklinika xizmat ko'rsatish sifatini oshirishga yordam beradi.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {t('review.anonymousNote')}
        </div>

        <Button onClick={() => navigate('/tickets')} className="w-full">
          Mening navbatlarimga qaytish
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Chiptalarga qaytish
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('review.title')}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Shifokor qabuli sifatini baholang. Fikr-mulohazalar to'liq anonim saqlanadi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star criteria cards */}
        {CRITERIA.map(item => (
          <Card key={item.key} className="p-5 bg-white border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-none">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{t(item.labelKey)}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setScores(prev => ({ ...prev, [item.key]: star }))}
                  className={`p-1.5 transition-transform hover:scale-125 focus:outline-none rounded-lg ${
                    scores[item.key] >= star ? 'text-amber-400' : 'text-slate-200'
                  }`}
                  aria-label={`${star} yulduz`}
                >
                  <Star className="w-7 h-7 fill-current" />
                </button>
              ))}
            </div>
          </Card>
        ))}

        {/* Template selector */}
        <Card className="p-5 bg-white border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Umumiy taassurot (Andoza)</h3>
            <p className="text-xs text-slate-400">Shaxsiy tashxis va erkin matn saqlanmaydi</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {templates.map(tmpl => (
              <button
                key={tmpl.key}
                type="button"
                onClick={() => setTemplate(tmpl.key)}
                className={`p-3 rounded-xl border-2 text-xs font-semibold text-left transition-all ${
                  template === tmpl.key
                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {t(tmpl.labelKey)}
              </button>
            ))}
          </div>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full py-4 text-base shadow-lg">
          {t('review.submit')}
        </Button>
      </form>
    </div>
  );
};
