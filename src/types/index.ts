// ─── Domain Types ──────────────────────────────────────────────────────────

export type UserRole = 'patient' | 'doctor' | 'registrar' | 'admin';
export type Locale = 'uz' | 'ru' | 'en';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  locale: Locale;
}

// ─── Doctor / Specialty ────────────────────────────────────────────────────

export type Specialty =
  | 'therapist'
  | 'cardiologist'
  | 'neurologist'
  | 'pediatrician'
  | 'surgeon'
  | 'ophthalmologist';

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  photoUrl: string;
  slotDurationMin: number;   // specialty default, can be overridden by admin
  district: string;
  polyclinicId: string;
  availableDays: number[];   // 0=Sun … 6=Sat
  startHour: number;         // e.g. 8
  endHour: number;           // e.g. 17
  rating?: number;           // only if publicRatings flag is true
  reviewCount: number;
}

// ─── Slots ─────────────────────────────────────────────────────────────────

export interface Slot {
  id: string;
  doctorId: string;
  startsAt: string;   // ISO-8601
  endsAt: string;
  isAvailable: boolean;
}

// ─── Ticket State Machine ──────────────────────────────────────────────────

export type TicketStatus =
  | 'booked'
  | 'checked_in'
  | 'called'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Ticket {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  slotId: string;
  specialty: Specialty;
  status: TicketStatus;
  qrCode: string;            // rotating, refreshed every 30s
  qrExpiresAt: string;       // ISO-8601
  qrUsed: boolean;
  estimatedCallTime: string; // ISO-8601, recomputed on delay
  queuePosition: number;
  bookedAt: string;
  checkedInAt?: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  noShowAt?: string;
  bookedBy?: string;         // 'self' | registrarId (for audit)
  notes?: string;            // doctor internal notes — never shown in lists
}

// ─── Reviews ───────────────────────────────────────────────────────────────

export type ReviewCriterion = 'punctuality' | 'explanation' | 'communication';

export interface Review {
  id: string;
  ticketId: string;
  doctorId: string;
  // patientId intentionally omitted for anonymity
  scores: Record<ReviewCriterion, number>; // 1-5
  templateKey: string;   // template-based, no free text
  createdAt: string;
}

export interface DoctorRating {
  doctorId: string;
  avgPunctuality: number;
  avgExplanation: number;
  avgCommunication: number;
  overall: number;
  count: number;
  visible: boolean; // false until count >= 10 and publicRatings flag
}

// ─── Audit Log ─────────────────────────────────────────────────────────────

export type AuditAction =
  | 'book'
  | 'cancel'
  | 'check_in'
  | 'call_next'
  | 'priority_insert'
  | 'complete'
  | 'no_show'
  | 'admin_override'
  | 'slot_config_change';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorRole: UserRole;
  targetTicketId?: string;
  targetDoctorId?: string;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export type NotificationType = 'delay' | 'called' | 'reminder' | 'cancelled';

export interface PushNotification {
  id: string;
  type: NotificationType;
  recipientId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

// ─── Admin / KPI ───────────────────────────────────────────────────────────

export interface KpiSnapshot {
  date: string;
  avgWaitMinutes: number;
  noShowRate: number;          // 0-1
  patientsPerDoctor: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
}

export interface SpecialtyConfig {
  specialty: Specialty;
  slotDurationMin: number;
  noShowWaitMin: number;       // default 5
}

// ─── Feature Flags ─────────────────────────────────────────────────────────

export interface FeatureFlags {
  publicRatings: boolean;
  adsEnabled?: boolean;
}

// ─── Ads & Promotional Banners ─────────────────────────────────────────────

export type AdPlacement = 'top_bar' | 'home_hero' | 'sidebar_card' | 'footer_banner';

export interface AdBanner {
  id: string;
  placement: AdPlacement;
  title: string;
  subtitle: string;
  badgeText?: string;
  actionText: string;
  actionUrl?: string;
  imageUrl?: string;
  bgColor?: string;
  sponsorName: string;
  isSponsored: boolean; // "Reklama" or "Ijtimoiy aksiya"
  active: boolean;
}
