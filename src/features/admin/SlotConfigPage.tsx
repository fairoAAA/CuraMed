import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminService } from '@/services';
import type { SpecialtyConfig } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingState } from '@/components/States';

export const SlotConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<SpecialtyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    adminService.getSpecialtyConfigs().then(setConfigs).finally(() => setLoading(false));
  }, []);

  const handleChange = (specialty: string, field: keyof SpecialtyConfig, value: number) => {
    setConfigs(prev =>
      prev.map(c => c.specialty === specialty ? { ...c, [field]: value } : c)
    );
  };

  const handleSave = async (config: SpecialtyConfig) => {
    setSaving(config.specialty);
    await adminService.updateSpecialtyConfig(config);
    setSaving(null);
    setSaved(config.specialty);
    setTimeout(() => setSaved(null), 2000);
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-brand-600 hover:text-brand-800 text-sm">← {t('common.back')}</Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.slotConfig')}</h1>
      <p className="text-gray-500 mb-8">Har bir mutaxassislik uchun navbat muddatini sozlang</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {configs.map(config => (
          <Card key={config.specialty}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t(`specialty.${config.specialty}`)}</h2>
            <div className="space-y-4">
              <Input
                label={t('admin.slotDuration')}
                type="number"
                min={5}
                max={60}
                step={5}
                value={config.slotDurationMin}
                onChange={e => handleChange(config.specialty, 'slotDurationMin', Number(e.target.value))}
              />
              <Input
                label={t('admin.noShowWait')}
                type="number"
                min={1}
                max={30}
                value={config.noShowWaitMin}
                onChange={e => handleChange(config.specialty, 'noShowWaitMin', Number(e.target.value))}
              />
            </div>
            <Button
              className="w-full mt-4"
              loading={saving === config.specialty}
              onClick={() => handleSave(config)}
              variant={saved === config.specialty ? 'secondary' : 'primary'}
            >
              {saved === config.specialty ? '✅ Saqlandi' : t('admin.saveConfig')}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
