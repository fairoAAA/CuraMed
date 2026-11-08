import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';

export const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <div className="text-6xl">🚫</div>
      <h1 className="text-2xl font-bold text-gray-800">Ruxsat yo'q</h1>
      <p className="text-gray-500">Bu sahifaga kirishingiz uchun ruxsat yo'q.</p>
      <Link to="/">
        <Button variant="secondary">{t('common.back')}</Button>
      </Link>
    </div>
  );
};
