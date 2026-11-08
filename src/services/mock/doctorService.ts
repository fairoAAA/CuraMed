import type { IDoctorService } from '@/services/interfaces';
import type { Doctor, Specialty } from '@/types';
import { MOCK_DOCTORS } from './mockData';

class MockDoctorService implements IDoctorService {
  async listBySpecialty(specialty: Specialty): Promise<Doctor[]> {
    await delay(400);
    return MOCK_DOCTORS.filter(d => d.specialty === specialty);
  }

  async getById(doctorId: string): Promise<Doctor> {
    await delay(200);
    const doc = MOCK_DOCTORS.find(d => d.id === doctorId);
    if (!doc) throw new Error(`Doctor not found: ${doctorId}`);
    return doc;
  }

  async listSpecialties(): Promise<Specialty[]> {
    await delay(200);
    const all = [...new Set(MOCK_DOCTORS.map(d => d.specialty))];
    return all as Specialty[];
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const doctorService: IDoctorService = new MockDoctorService();
