import type { IAppointmentService } from '@/services/interfaces';
import type { Slot, Ticket, TicketStatus, Specialty } from '@/types';
import { MOCK_DOCTORS, MOCK_SPECIALTY_CONFIGS, MOCK_TICKETS, MOCK_USERS } from './mockData';
import { assertValidTransition } from '@/utils/ticketStateMachine';
import { timeService } from './timeService';
import { auditService } from './auditService';
import { notificationService } from './notificationService';
import { parseISO, format, addMinutes, isBefore } from 'date-fns';

// In-memory mutable store (swap for API later)
let tickets: Ticket[] = [...MOCK_TICKETS];

function generateQr(): string {
  const t = timeService.now().getTime();
  return `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${t}`;
}

function getSlotDuration(specialty: Specialty): number {
  const cfg = MOCK_SPECIALTY_CONFIGS.find(c => c.specialty === specialty);
  return cfg?.slotDurationMin ?? 10;
}

function generateSlots(doctorId: string, date: string): Slot[] {
  const doc = MOCK_DOCTORS.find(d => d.id === doctorId);
  if (!doc) return [];

  const duration = getSlotDuration(doc.specialty);
  const slots: Slot[] = [];
  const dayOfWeek = parseISO(date).getDay();

  if (!doc.availableDays.includes(dayOfWeek)) return [];

  let cursor = parseISO(`${date}T${String(doc.startHour).padStart(2, '0')}:00:00`);
  const endTime = parseISO(`${date}T${String(doc.endHour).padStart(2, '0')}:00:00`);
  let idx = 0;

  while (isBefore(cursor, endTime)) {
    const slotEnd = addMinutes(cursor, duration);
    if (!isBefore(slotEnd, endTime) && slotEnd > endTime) break;

    const slotId = `${doctorId}-${date}-${idx}`;
    const booked = tickets.some(t =>
      t.slotId === slotId &&
      !['cancelled', 'no_show'].includes(t.status)
    );

    slots.push({
      id: slotId,
      doctorId,
      startsAt: cursor.toISOString(),
      endsAt: slotEnd.toISOString(),
      isAvailable: !booked,
    });

    cursor = slotEnd;
    idx++;
  }

  return slots;
}

function recomputeEstimates(doctorId: string): void {
  const now = timeService.now();
  const todayStr = format(now, 'yyyy-MM-dd');

  const pending = tickets.filter(
    t => t.doctorId === doctorId &&
         !['completed', 'cancelled', 'no_show'].includes(t.status) &&
         t.slotId.includes(todayStr)
  ).sort((a, b) => new Date(a.slotId.split('-').slice(2).join('-')).getTime() -
                   new Date(b.slotId.split('-').slice(2).join('-')).getTime());

  let cursor = now;
  pending.forEach((ticket, i) => {
    const doc = MOCK_DOCTORS.find(d => d.id === doctorId);
    const duration = getSlotDuration(doc?.specialty ?? 'therapist');
    ticket.estimatedCallTime = addMinutes(cursor, i * duration).toISOString();
    ticket.queuePosition = i + 1;
  });
}

class MockAppointmentService implements IAppointmentService {
  async listSlots(doctorId: string, date: string): Promise<Slot[]> {
    await delay(500);
    return generateSlots(doctorId, date);
  }

  async bookSlot(params: {
    slotId: string;
    patientId: string;
    bookedBy: string;
  }): Promise<Ticket> {
    await delay(700);

    // Validate slot exists and is available
    const [doctorId, date] = [params.slotId.split('-')[0], params.slotId.split('-').slice(1, 4).join('-')];
    const slots = generateSlots(doctorId, date);
    const slot = slots.find(s => s.id === params.slotId);
    if (!slot) throw new Error('appointment.slotNotFound');
    if (!slot.isAvailable) throw new Error('appointment.slotUnavailable');

    // Max one active ticket per patient per specialty
    const doc = MOCK_DOCTORS.find(d => d.id === doctorId)!;
    const existingActive = tickets.find(
      t => t.patientId === params.patientId &&
           t.specialty === doc.specialty &&
           !['completed', 'cancelled', 'no_show'].includes(t.status)
    );
    if (existingActive) throw new Error('appointment.duplicateActiveTicket');

    const now = timeService.now();
    const existingToday = tickets.filter(
      t => t.doctorId === doctorId &&
           !['cancelled', 'no_show'].includes(t.status) &&
           t.slotId.includes(date)
    ).length;

    const qrCode = generateQr();
    const patientObj = MOCK_USERS.find(u => u.id === params.patientId);
    const patientName = patientObj ? patientObj.name : `Bemor (${params.patientId.slice(-4)})`;
    const tNow = timeService.now().getTime();

    const newTicket: Ticket = {
      id: `tk-${tNow}-${Math.random().toString(36).slice(2, 6)}`,
      patientId: params.patientId,
      patientName,
      doctorId,
      slotId: params.slotId,
      specialty: doc.specialty,
      status: 'booked',
      qrCode,
      qrExpiresAt: addMinutes(now, 0.5).toISOString(), // 30s
      qrUsed: false,
      estimatedCallTime: slot.startsAt,
      queuePosition: existingToday + 1,
      bookedAt: now.toISOString(),
      bookedBy: params.bookedBy,
    };

    tickets.push(newTicket);

    await auditService.log({
      action: 'book',
      actorId: params.bookedBy,
      actorRole: params.bookedBy === params.patientId ? 'patient' : 'registrar',
      targetTicketId: newTicket.id,
      targetDoctorId: doctorId,
    });

    return newTicket;
  }

  async getPatientTickets(patientId: string): Promise<Ticket[]> {
    await delay(300);
    return tickets.filter(t => t.patientId === patientId);
  }

  async getDoctorQueue(doctorId: string): Promise<Ticket[]> {
    await delay(300);
    const now = timeService.now();
    const todayStr = format(now, 'yyyy-MM-dd');
    return tickets
      .filter(t => t.doctorId === doctorId && t.slotId.includes(todayStr))
      .sort((a, b) => a.queuePosition - b.queuePosition);
  }

  async transition(ticketId: string, to: TicketStatus, reason?: string): Promise<Ticket> {
    await delay(300);
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('appointment.ticketNotFound');

    assertValidTransition(ticket.status, to);

    const now = timeService.now();
    ticket.status = to;

    if (to === 'checked_in') ticket.checkedInAt = now.toISOString();
    if (to === 'called')      ticket.calledAt    = now.toISOString();
    if (to === 'in_progress') ticket.startedAt   = now.toISOString();
    if (to === 'completed')   ticket.completedAt = now.toISOString();
    if (to === 'cancelled')   ticket.cancelledAt = now.toISOString();
    if (to === 'no_show')     ticket.noShowAt    = now.toISOString();

    // Recompute estimates for remaining queue
    recomputeEstimates(ticket.doctorId);

    // Emit delay notification if called is later than estimated
    if (to === 'called' && ticket.calledAt && ticket.estimatedCallTime) {
      const estimated = parseISO(ticket.estimatedCallTime);
      const actual    = parseISO(ticket.calledAt);
      if (actual > estimated) {
        const delayMin = Math.round((actual.getTime() - estimated.getTime()) / 60000);
        // Notify subsequent patients
        const queue = await this.getDoctorQueue(ticket.doctorId);
        for (const t of queue) {
          if (['booked', 'checked_in'].includes(t.status)) {
            await notificationService.emit({
              type: 'delay',
              recipientId: t.patientId,
              title: 'Navbat kechikmoqda',
              body: `Siz taxminan ${delayMin} daqiqa kech chaqirilasiz.`,
            });
          }
        }
      }
    }

    await auditService.log({
      action: to === 'called' ? 'call_next' : to === 'completed' ? 'complete' : to === 'no_show' ? 'no_show' : 'check_in',
      actorId: ticket.doctorId,
      actorRole: 'doctor',
      targetTicketId: ticketId,
      reason,
    });

    return ticket;
  }

  async rotateQr(ticketId: string): Promise<Pick<Ticket, 'qrCode' | 'qrExpiresAt'>> {
    await delay(100);
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('appointment.ticketNotFound');
    if (ticket.qrUsed) throw new Error('appointment.qrAlreadyUsed');

    const now = timeService.now();
    ticket.qrCode = generateQr();
    ticket.qrExpiresAt = addMinutes(now, 0.5).toISOString(); // 30s
    return { qrCode: ticket.qrCode, qrExpiresAt: ticket.qrExpiresAt };
  }

  async priorityInsert(params: {
    doctorId: string;
    patientId: string;
    reason: string;
    actorId: string;
  }): Promise<Ticket> {
    await delay(500);
    if (!params.reason.trim()) throw new Error('appointment.priorityReasonRequired');

    const now = timeService.now();
    const todayStr = format(now, 'yyyy-MM-dd');
    const doc = MOCK_DOCTORS.find(d => d.id === params.doctorId)!;
    const qrCode = generateQr();
    const tNow = timeService.now().getTime();
    const patientObj = MOCK_USERS.find(u => u.id === params.patientId);
    const patientName = patientObj
      ? patientObj.name
      : params.patientId.startsWith('+998')
        ? params.patientId
        : `Favqulodda bemor (#${tNow.toString().slice(-4)})`;

    const ticket: Ticket = {
      id: `tk-prio-${tNow}`,
      patientId: params.patientId,
      patientName,
      doctorId: params.doctorId,
      slotId: `${params.doctorId}-${todayStr}-prio`,
      specialty: doc.specialty,
      status: 'checked_in',
      qrCode,
      qrExpiresAt: addMinutes(now, 0.5).toISOString(),
      qrUsed: false,
      estimatedCallTime: now.toISOString(),
      queuePosition: 0, // top of queue
      bookedAt: now.toISOString(),
      checkedInAt: now.toISOString(),
      bookedBy: params.actorId,
      notes: `PRIORITY: ${params.reason}`,
    };

    tickets.unshift(ticket); // insert at front

    // Push back everyone else
    tickets
      .filter(t => t.doctorId === params.doctorId && t.id !== ticket.id && !['completed','cancelled','no_show'].includes(t.status))
      .forEach((t, i) => { t.queuePosition = i + 2; });

    recomputeEstimates(params.doctorId);

    await auditService.log({
      action: 'priority_insert',
      actorId: params.actorId,
      actorRole: 'doctor',
      targetTicketId: ticket.id,
      targetDoctorId: params.doctorId,
      reason: params.reason,
    });

    return ticket;
  }

  async cancel(ticketId: string, reason: string, actorId: string): Promise<Ticket> {
    await delay(300);
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('appointment.ticketNotFound');
    assertValidTransition(ticket.status, 'cancelled');

    ticket.status = 'cancelled';
    ticket.cancelledAt = timeService.now().toISOString();

    recomputeEstimates(ticket.doctorId);

    await auditService.log({
      action: 'cancel',
      actorId,
      actorRole: 'patient',
      targetTicketId: ticketId,
      reason,
    });

    return ticket;
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const appointmentService: IAppointmentService = new MockAppointmentService();

// expose for tests
export { tickets as _tickets };
