import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Card } from '@/components/Card';
import { LoadingState, EmptyState } from '@/components/States';
import { format, parseISO } from 'date-fns';
import {
  Bell,
  Clock,
  Volume2,
  XCircle,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const user = useAuthStore(s => s.user)!;
  const { notifications, fetch, markRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user?.id) fetch(user.id);
  }, [user?.id, fetch]);

  if (notifications === undefined) return <LoadingState message="Xabarnomalar yuklanmoqda..." />;

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'delay':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'called':
        return <Volume2 className="w-5 h-5 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Xabarnomalar
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Navbat holati, chaqiruvlar va tizim bildirishnomalari.
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition ${filter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg font-bold transition ${filter === 'unread' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Yangi
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-16 bg-white border-slate-200 shadow-sm">
          <EmptyState message="Xabarnomalar yo'q" icon="🔔" />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-all border p-4.5 ${
                n.read
                  ? 'border-slate-200 bg-white opacity-85 hover:opacity-100'
                  : 'border-brand-300 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 shadow-sm'
              }`}
              onClick={() => { if (!n.read) markRead(n.id); }}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-none ${
                  n.read ? 'bg-slate-100' : 'bg-white shadow-xs'
                }`}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm font-bold ${n.read ? 'text-slate-800' : 'text-slate-950'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="text-[10px] font-extrabold uppercase bg-brand-600 text-white px-2 py-0.5 rounded-full">
                        Yangi
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                    {format(parseISO(n.createdAt), 'dd.MM.yyyy, HH:mm')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
