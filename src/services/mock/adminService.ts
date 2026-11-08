import type { IAdminService } from '@/services/interfaces';
import type { SpecialtyConfig, KpiSnapshot, FeatureFlags } from '@/types';
import { MOCK_SPECIALTY_CONFIGS } from './mockData';
import { _tickets } from './appointmentService';
import { format } from 'date-fns';

let specialtyConfigs: SpecialtyConfig[] = [...MOCK_SPECIALTY_CONFIGS];
let flags: FeatureFlags = { publicRatings: false };

// Export for use in other services
export async function featureFlags(): Promise<FeatureFlags> {
  return { ...flags };
}

class MockAdminService implements IAdminService {
  async getSpecialtyConfigs(): Promise<SpecialtyConfig[]> {
    await delay(300);
    return [...specialtyConfigs];
  }

  async updateSpecialtyConfig(config: SpecialtyConfig): Promise<void> {
    await delay(300);
    const idx = specialtyConfigs.findIndex(c => c.specialty === config.specialty);
    if (idx >= 0) specialtyConfigs[idx] = config;
    else specialtyConfigs.push(config);
  }

  async getKpi(from: string, to: string): Promise<KpiSnapshot[]> {
    await delay(500);
    // Generate mock KPI data for the date range
    const snapshots: KpiSnapshot[] = [];
    const start = new Date(from);
    const end   = new Date(to);

    let cursor = new Date(start);
    while (cursor <= end) {
      const dateStr = format(cursor, 'yyyy-MM-dd');
      const dayTickets = _tickets.filter(t => t.bookedAt.startsWith(dateStr));

      const completed = dayTickets.filter(t => t.status === 'completed');
      const noShows   = dayTickets.filter(t => t.status === 'no_show');
      const cancelled = dayTickets.filter(t => t.status === 'cancelled');
      const total = dayTickets.length;

      const avgWait = completed.length > 0
        ? completed.reduce((sum, t) => {
            const booked  = new Date(t.bookedAt).getTime();
            const started = t.startedAt ? new Date(t.startedAt).getTime() : booked;
            return sum + (started - booked) / 60000;
          }, 0) / completed.length
        : Math.floor(Math.random() * 20 + 5); // mock if no data

      snapshots.push({
        date: dateStr,
        avgWaitMinutes: Math.round(avgWait),
        noShowRate: total > 0 ? noShows.length / total : Math.random() * 0.15,
        patientsPerDoctor: Math.floor(Math.random() * 12 + 8),
        completedCount: completed.length || Math.floor(Math.random() * 30 + 10),
        cancelledCount: cancelled.length,
        noShowCount:    noShows.length,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return snapshots;
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    await delay(100);
    return { ...flags };
  }

  async setFeatureFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]): Promise<void> {
    await delay(200);
    flags[key] = value;
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const adminService: IAdminService = new MockAdminService();
