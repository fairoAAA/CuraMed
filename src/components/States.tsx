import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center" role="alert">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">⚠️</div>
      <p className="text-lg font-medium text-gray-800">{t('common.error')}</p>
      {message && <p className="text-gray-500 max-w-sm">{message}</p>}
      {onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4" aria-busy="true" aria-label={t('common.loading')}>
      <svg className="animate-spin h-10 w-10 text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p className="text-gray-600">{message || t('common.loading')}</p>
    </div>
  );
};

export const EmptyState: React.FC<{ message?: string; icon?: string }> = ({ message, icon = '📭' }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-5xl">{icon}</div>
      <p className="text-gray-500 text-lg">{message || t('common.noData')}</p>
    </div>
  );
};
