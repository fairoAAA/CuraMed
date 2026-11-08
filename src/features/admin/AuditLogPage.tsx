import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { auditService } from '@/services';
import type { AuditEntry } from '@/types';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingState, EmptyState } from '@/components/States';
import { format, parseISO } from 'date-fns';

export const AuditLogPage: React.FC = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    auditService.list().then(setEntries).finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? entries.filter(e =>
        e.action.includes(filter) ||
        e.actorId.includes(filter) ||
        e.actorRole.includes(filter) ||
        (e.reason?.toLowerCase().includes(filter.toLowerCase()) ?? false)
      )
    : entries;

  const actionBadge: Record<string, 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'gray' | 'purple'> = {
    book: 'blue', cancel: 'red', check_in: 'purple', call_next: 'orange',
    priority_insert: 'red', complete: 'green', no_show: 'red', admin_override: 'yellow', slot_config_change: 'gray',
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-brand-600 hover:text-brand-800 text-sm">← {t('common.back')}</Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('admin.auditLog')}</h1>

      <div className="mb-4">
        <input
          type="search"
          placeholder={`${t('common.search')}...`}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('common.noData')} icon="📋" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 text-left text-gray-500 font-medium">Vaqt</th>
                <th className="py-3 px-4 text-left text-gray-500 font-medium">Harakat</th>
                <th className="py-3 px-4 text-left text-gray-500 font-medium">Kim</th>
                <th className="py-3 px-4 text-left text-gray-500 font-medium">Rol</th>
                <th className="py-3 px-4 text-left text-gray-500 font-medium">Sabab</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {format(parseISO(entry.timestamp), 'dd.MM HH:mm:ss')}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={actionBadge[entry.action] ?? 'gray'}>
                      {entry.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">{entry.actorId}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{t(`auth.roles.${entry.actorRole}`)}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">{entry.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
