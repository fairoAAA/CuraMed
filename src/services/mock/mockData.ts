// Mock data — all in one place, never imported by UI directly.
// UI uses services only.

import type { User, Doctor, Ticket, AuditEntry, Review, SpecialtyConfig } from '@/types';

// ─── Users ─────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: 'u1', role: 'patient',   name: 'Aziz Karimov',    phone: '+998901234567', locale: 'uz' },
  { id: 'u2', role: 'patient',   name: 'Malika Yusupova', phone: '+998907654321', locale: 'uz' },
  { id: 'doc1', role: 'doctor',  name: 'Dr. Ravshan Toshmatov', phone: '+998901111111', locale: 'uz' },
  { id: 'doc2', role: 'doctor',  name: 'Dr. Nigora Abdullayeva', phone: '+998902222222', locale: 'uz' },
  { id: 'doc3', role: 'doctor',  name: 'Dr. Bobur Mirzayev', phone: '+998903333333', locale: 'uz' },
  { id: 'u6', role: 'registrar', name: 'Nodira Xasanova', phone: '+998904444444', locale: 'uz' },
  { id: 'u7', role: 'admin',     name: 'Jamshid Umarov',  phone: '+998905555555', locale: 'uz' },
  { id: 'u8', role: 'patient',   name: 'Гульнара Ибрагимова', phone: '+998906666666', locale: 'ru' },
];

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return digits ? `+${digits}` : '';
}

export function resolveUserByPhone(phone: string): User {
  const norm = normalizePhone(phone);
  const found = MOCK_USERS.find(u => normalizePhone(u.phone) === norm);
  if (found) return found;

  // Create ad-hoc patient for any unknown phone
  return {
    id: `u-${norm.slice(-6) || Math.random().toString(36).slice(2, 6)}`,
    role: 'patient',
    name: `Patient ${norm.slice(-4) || 'Mehmon'}`,
    phone: norm,
    locale: 'uz',
  };
}

// ─── Doctors ───────────────────────────────────────────────────────────────

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Ravshan Toshmatov',
    specialty: 'therapist',
    photoUrl: 'https://i.pravatar.cc/150?img=11',
    slotDurationMin: 10,
    district: 'Yunusobod',
    polyclinicId: 'pc1',
    availableDays: [1, 2, 3, 4, 5],
    startHour: 8,
    endHour: 17,
    reviewCount: 14,
    rating: 4.3,
  },
  {
    id: 'doc2',
    name: 'Dr. Nigora Abdullayeva',
    specialty: 'therapist',
    photoUrl: 'https://i.pravatar.cc/150?img=5',
    slotDurationMin: 10,
    district: 'Yunusobod',
    polyclinicId: 'pc1',
    availableDays: [1, 2, 3, 4, 5],
    startHour: 8,
    endHour: 17,
    reviewCount: 7,
  },
  {
    id: 'doc3',
    name: 'Dr. Bobur Mirzayev',
    specialty: 'cardiologist',
    photoUrl: 'https://i.pravatar.cc/150?img=12',
    slotDurationMin: 20,
    district: 'Yunusobod',
    polyclinicId: 'pc1',
    availableDays: [1, 3, 5],
    startHour: 9,
    endHour: 16,
    reviewCount: 22,
    rating: 4.7,
  },
  {
    id: 'doc4',
    name: 'Dr. Saodat Nazarova',
    specialty: 'pediatrician',
    photoUrl: 'https://i.pravatar.cc/150?img=9',
    slotDurationMin: 10,
    district: 'Yunusobod',
    polyclinicId: 'pc1',
    availableDays: [1, 2, 3, 4, 5],
    startHour: 8,
    endHour: 13,
    reviewCount: 31,
    rating: 4.9,
  },
  {
    id: 'doc5',
    name: 'Dr. Ulugbek Xoliqov',
    specialty: 'neurologist',
    photoUrl: 'https://i.pravatar.cc/150?img=14',
    slotDurationMin: 20,
    district: 'Yunusobod',
    polyclinicId: 'pc1',
    availableDays: [2, 4],
    startHour: 10,
    endHour: 16,
    reviewCount: 5,
  },
  {
    id: 'doc6',
    name: 'Dr. Dilnoza Yusupova',
    specialty: 'ophthalmologist',
    photoUrl: 'https://i.pravatar.cc/150?img=47',
    slotDurationMin: 15,
    district: 'Yunusobod',
    polyclinicId: 'pc1',
    availableDays: [1, 2, 3, 4, 5],
    startHour: 8,
    endHour: 15,
    reviewCount: 18,
    rating: 4.5,
  },
];

// ─── Specialty Configs ─────────────────────────────────────────────────────

export const MOCK_SPECIALTY_CONFIGS: SpecialtyConfig[] = [
  { specialty: 'therapist',      slotDurationMin: 10, noShowWaitMin: 5 },
  { specialty: 'cardiologist',   slotDurationMin: 20, noShowWaitMin: 5 },
  { specialty: 'neurologist',    slotDurationMin: 20, noShowWaitMin: 5 },
  { specialty: 'pediatrician',   slotDurationMin: 10, noShowWaitMin: 5 },
  { specialty: 'surgeon',        slotDurationMin: 30, noShowWaitMin: 5 },
  { specialty: 'ophthalmologist',slotDurationMin: 15, noShowWaitMin: 5 },
];

// ─── Slots (generated dynamically in appointmentService) ──────────────────
// The slot generator lives in mock/appointmentService.ts

// ─── Initial Tickets ───────────────────────────────────────────────────────

const todayStr = new Date().toISOString().split('T')[0];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'tk-demo-1',
    patientId: 'u1',
    patientName: 'Aziz Karimov',
    doctorId: 'doc1',
    slotId: `doc1-${todayStr}-0`,
    specialty: 'therapist',
    status: 'checked_in',
    qrCode: `QR-AZIZ-CHECKEDIN-${Date.now()}`,
    qrExpiresAt: new Date(Date.now() + 30000).toISOString(),
    qrUsed: false,
    estimatedCallTime: new Date(Date.now() + 5 * 60000).toISOString(),
    queuePosition: 1,
    bookedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    checkedInAt: new Date(Date.now() - 10 * 60000).toISOString(),
    bookedBy: 'self',
  },
  {
    id: 'tk-demo-2',
    patientId: 'u2',
    patientName: 'Malika Yusupova',
    doctorId: 'doc1',
    slotId: `doc1-${todayStr}-1`,
    specialty: 'therapist',
    status: 'booked',
    qrCode: `QR-MALIKA-BOOKED-${Date.now()}`,
    qrExpiresAt: new Date(Date.now() + 30000).toISOString(),
    qrUsed: false,
    estimatedCallTime: new Date(Date.now() + 15 * 60000).toISOString(),
    queuePosition: 2,
    bookedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    bookedBy: 'self',
  },
  {
    id: 'tk-demo-3',
    patientId: 'u1',
    patientName: 'Aziz Karimov',
    doctorId: 'doc3',
    slotId: `doc3-${todayStr}-completed`,
    specialty: 'cardiologist',
    status: 'completed',
    qrCode: `QR-AZIZ-COMPLETED-${Date.now()}`,
    qrExpiresAt: new Date(Date.now() - 60000).toISOString(),
    qrUsed: true,
    estimatedCallTime: new Date(Date.now() - 40 * 60000).toISOString(),
    queuePosition: 0,
    bookedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    checkedInAt: new Date(Date.now() - 90 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 60 * 60000).toISOString(),
    startedAt: new Date(Date.now() - 55 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    bookedBy: 'self',
  },
];

// ─── Audit Log ─────────────────────────────────────────────────────────────

export const MOCK_AUDIT_LOG: AuditEntry[] = [];

// ─── Reviews ───────────────────────────────────────────────────────────────

export const MOCK_REVIEWS: Review[] = [];

// ─── Review Templates ──────────────────────────────────────────────────────

export const REVIEW_TEMPLATES = [
  { key: 'satisfied',        labelKey: 'review.template.satisfied' },
  { key: 'punctual',         labelKey: 'review.template.punctual' },
  { key: 'clear_explanation',labelKey: 'review.template.clearExplanation' },
  { key: 'friendly',         labelKey: 'review.template.friendly' },
  { key: 'long_wait',        labelKey: 'review.template.longWait' },
  { key: 'good_overall',     labelKey: 'review.template.goodOverall' },
];
