import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuthStore } from '@/store/authStore';
import { LoadingState } from '@/components/States';
import { LoginPage } from '@/features/auth/LoginPage';
import { PatientHome } from '@/features/patient/PatientHome';
import { SpecialtyPickerPage } from '@/features/patient/SpecialtyPickerPage';
import { DoctorListPage } from '@/features/patient/DoctorListPage';
import { BookingPage } from '@/features/patient/BookingPage';
import { MyTicketsPage } from '@/features/patient/MyTicketsPage';
import { QrTicketPage } from '@/features/patient/QrTicketPage';
import { ReviewPage } from '@/features/patient/ReviewPage';
import { DoctorDashboard } from '@/features/doctor/DoctorDashboard';
import { RegistrarDashboard } from '@/features/registrar/RegistrarDashboard';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { AuditLogPage } from '@/features/admin/AuditLogPage';
import { SlotConfigPage } from '@/features/admin/SlotConfigPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { UnauthorizedPage } from '@/features/auth/UnauthorizedPage';

function RoleHomeDispatcher() {
  const { user, initialized, loading } = useAuthStore();
  if (!initialized || loading) return <LoadingState message="Yuklanmoqda..." />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  if (user.role === 'registrar') return <Navigate to="/registrar" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <PatientHome />;
}

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ShellLayout />,
    children: [
      {
        index: true,
        element: <RoleHomeDispatcher />,
      },
      {
        path: 'specialties',
        element: (
          <RoleGuard allowedRoles={['patient', 'registrar']}>
            <SpecialtyPickerPage />
          </RoleGuard>
        ),
      },
      {
        path: 'specialties/:specialty/doctors',
        element: (
          <RoleGuard allowedRoles={['patient', 'registrar']}>
            <DoctorListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'doctors/:doctorId/book',
        element: (
          <RoleGuard allowedRoles={['patient', 'registrar']}>
            <BookingPage />
          </RoleGuard>
        ),
      },
      {
        path: 'tickets',
        element: (
          <RoleGuard allowedRoles={['patient']}>
            <MyTicketsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'tickets/:ticketId/qr',
        element: (
          <RoleGuard allowedRoles={['patient']}>
            <QrTicketPage />
          </RoleGuard>
        ),
      },
      {
        path: 'tickets/:ticketId/review',
        element: (
          <RoleGuard allowedRoles={['patient']}>
            <ReviewPage />
          </RoleGuard>
        ),
      },

      // Doctor routes
      {
        path: 'doctor',
        element: (
          <RoleGuard allowedRoles={['doctor']}>
            <DoctorDashboard />
          </RoleGuard>
        ),
      },

      // Registrar routes
      {
        path: 'registrar',
        element: (
          <RoleGuard allowedRoles={['registrar']}>
            <RegistrarDashboard />
          </RoleGuard>
        ),
      },

      // Admin routes
      {
        path: 'admin',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/audit',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AuditLogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/slots',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <SlotConfigPage />
          </RoleGuard>
        ),
      },

      // Shared
      {
        path: 'notifications',
        element: (
          <RoleGuard allowedRoles={['patient', 'doctor', 'registrar', 'admin']}>
            <NotificationsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
