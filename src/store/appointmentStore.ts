import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Ticket, TicketStatus } from '@/types';
import { appointmentService } from '@/services';

interface AppointmentState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  fetchPatientTickets: (patientId: string) => Promise<void>;
  fetchDoctorQueue: (doctorId: string) => Promise<void>;
  bookSlot: (params: { slotId: string; patientId: string; bookedBy: string }) => Promise<Ticket>;
  transition: (ticketId: string, to: TicketStatus, reason?: string) => Promise<void>;
  rotateQr: (ticketId: string) => Promise<void>;
  cancel: (ticketId: string, reason: string, actorId: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>()(
  devtools(
    (set) => ({
      tickets: [],
      loading: false,
      error: null,

      fetchPatientTickets: async (patientId) => {
        set({ loading: true, error: null });
        try {
          const tickets = await appointmentService.getPatientTickets(patientId);
          set({ tickets });
        } catch (e) {
          set({ error: (e as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      fetchDoctorQueue: async (doctorId) => {
        set({ loading: true, error: null });
        try {
          const tickets = await appointmentService.getDoctorQueue(doctorId);
          set({ tickets });
        } catch (e) {
          set({ error: (e as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      bookSlot: async (params) => {
        set({ loading: true, error: null });
        try {
          const ticket = await appointmentService.bookSlot(params);
          set(state => ({ tickets: [...state.tickets, ticket] }));
          return ticket;
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      transition: async (ticketId, to, reason) => {
        set({ error: null });
        try {
          const updated = await appointmentService.transition(ticketId, to, reason);
          set(state => ({
            tickets: state.tickets.map(t => t.id === ticketId ? updated : t),
          }));
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        }
      },

      rotateQr: async (ticketId) => {
        try {
          const { qrCode, qrExpiresAt } = await appointmentService.rotateQr(ticketId);
          set(state => ({
            tickets: state.tickets.map(t =>
              t.id === ticketId ? { ...t, qrCode, qrExpiresAt } : t
            ),
          }));
        } catch (e) {
          console.error('QR rotate failed', e);
        }
      },

      cancel: async (ticketId, reason, actorId) => {
        set({ loading: true, error: null });
        try {
          const updated = await appointmentService.cancel(ticketId, reason, actorId);
          set(state => ({
            tickets: state.tickets.map(t => t.id === ticketId ? updated : t),
          }));
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'appointments' }
  )
);
