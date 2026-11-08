import type { IAuditService } from '@/services/interfaces';
import type { AuditEntry } from '@/types';
import { MOCK_AUDIT_LOG } from './mockData';
import { timeService } from './timeService';

let log: AuditEntry[] = [...MOCK_AUDIT_LOG];

class MockAuditService implements IAuditService {
  async log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
    const record: AuditEntry = {
      ...entry,
      id: `audit-${timeService.now().getTime()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: timeService.now().toISOString(),
    };
    log.push(record);
    console.info('[Audit]', record);
  }

  async list(filters?: {
    actorId?: string;
    targetDoctorId?: string;
    from?: string;
    to?: string;
  }): Promise<AuditEntry[]> {
    await delay(300);
    let result = [...log];
    if (filters?.actorId)       result = result.filter(e => e.actorId === filters.actorId);
    if (filters?.targetDoctorId) result = result.filter(e => e.targetDoctorId === filters.targetDoctorId);
    if (filters?.from)           result = result.filter(e => e.timestamp >= filters.from!);
    if (filters?.to)             result = result.filter(e => e.timestamp <= filters.to!);
    return result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const auditService: IAuditService = new MockAuditService();
