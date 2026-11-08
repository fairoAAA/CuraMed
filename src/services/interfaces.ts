// ─── Service Interfaces ────────────────────────────────────────────────────
// All UI code must go through these interfaces — never import mock data directly.

import type {
  User, UserRole, Doctor, Specialty, Slot, Ticket, TicketStatus,
  Review, ReviewCriterion, AuditEntry, PushNotification,
  KpiSnapshot, SpecialtyConfig, FeatureFlags,
} from '@/types';

// ── Auth ──────────────────────────────────────────────────────────────────

export interface IAuthService {
  /** Send OTP to phone. Mock always succeeds. */
  requestOtp(phone: string): Promise<void>;
  /** Verify OTP. Mock code is "123456". Returns session user. */
  verifyOtp(phone: string, otp: string): Promise<User>;
  /** Direct login with predefined demo role */
  quickLogin(role: UserRole): Promise<User>;
  /** Returns current session user or null. */
  getSession(): Promise<User | null>;
  /** Clear session. */
  logout(): Promise<void>;
}

// ── Doctor ────────────────────────────────────────────────────────────────

export interface IDoctorService {
  listBySpecialty(specialty: Specialty): Promise<Doctor[]>;
  getById(doctorId: string): Promise<Doctor>;
  listSpecialties(): Promise<Specialty[]>;
}

// ── Appointment / Ticket ──────────────────────────────────────────────────

export interface IAppointmentService {
  /** Available slots for a doctor on a given date (YYYY-MM-DD). */
  listSlots(doctorId: string, date: string): Promise<Slot[]>;
  /** Book a slot. Registrar can pass patientId of another patient. */
  bookSlot(params: {
    slotId: string;
    patientId: string;
    bookedBy: string; // 'self' or registrarId
  }): Promise<Ticket>;
  /** Fetch all tickets for a patient. */
  getPatientTickets(patientId: string): Promise<Ticket[]>;
  /** Fetch today's tickets for a doctor. */
  getDoctorQueue(doctorId: string): Promise<Ticket[]>;
  /** Transition ticket status. Throws on invalid transition. */
  transition(ticketId: string, to: TicketStatus, reason?: string): Promise<Ticket>;
  /** Rotate QR code (called every 30 s by client). */
  rotateQr(ticketId: string): Promise<Pick<Ticket, 'qrCode' | 'qrExpiresAt'>>;
  /** Priority insert (emergency). Requires reason. */
  priorityInsert(params: {
    doctorId: string;
    patientId: string;
    reason: string;
    actorId: string;
  }): Promise<Ticket>;
  /** Cancel a ticket. */
  cancel(ticketId: string, reason: string, actorId: string): Promise<Ticket>;
}

// ── Review ────────────────────────────────────────────────────────────────

export interface IReviewService {
  /** Only allowed for completed tickets. Throws otherwise. */
  submitReview(params: {
    ticketId: string;
    doctorId: string;
    scores: Record<ReviewCriterion, number>;
    templateKey: string;
  }): Promise<Review>;
  /** Returns rating only if count >= 10 and publicRatings flag allows. */
  getDoctorRating(doctorId: string): Promise<{ visible: boolean; avgOverall?: number; count: number }>;
  getReviewTemplates(): Promise<Array<{ key: string; labelKey: string }>>;
}

// ── Notification ──────────────────────────────────────────────────────────

export interface INotificationService {
  /** Emit a push notification (mock logs to console + stores in state). */
  emit(notification: Omit<PushNotification, 'id' | 'createdAt' | 'read'>): Promise<void>;
  /** List notifications for a recipient. */
  list(recipientId: string): Promise<PushNotification[]>;
  markRead(notificationId: string): Promise<void>;
}

// ── Audit ─────────────────────────────────────────────────────────────────

export interface IAuditService {
  log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void>;
  list(filters?: {
    actorId?: string;
    targetDoctorId?: string;
    from?: string;
    to?: string;
  }): Promise<AuditEntry[]>;
}

// ── Time ──────────────────────────────────────────────────────────────────

export interface ITimeService {
  /** Single source of "now" — never use Date.now() in components. */
  now(): Date;
  /** Format for display (locale-aware). */
  format(date: Date | string, fmt: string): string;
  /** Add minutes to a date. */
  addMinutes(date: Date | string, minutes: number): Date;
}

// ── Admin ─────────────────────────────────────────────────────────────────

export interface IAdminService {
  getSpecialtyConfigs(): Promise<SpecialtyConfig[]>;
  updateSpecialtyConfig(config: SpecialtyConfig): Promise<void>;
  getKpi(from: string, to: string): Promise<KpiSnapshot[]>;
  getFeatureFlags(): Promise<FeatureFlags>;
  setFeatureFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]): Promise<void>;
}
