import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout, RequireAuth } from '@/components/layout';
import { LoginPage } from '@/features/auth/LoginPage';
import { SpaceDetailPage } from '@/features/booking/SpaceDetailPage';
import { ExplorePage } from '@/features/explore/ExplorePage';
import { LandingPage } from '@/features/landing/LandingPage';
import { TopPage } from '@/features/ranking/TopPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { ReportPage } from '@/features/reports/ReportPage';
import { CheckInPage } from '@/features/reservations/CheckInPage';
import { MyReservationsPage } from '@/features/reservations/MyReservationsPage';
import { ReleasePage } from '@/features/reservations/ReleasePage';
import { VoucherPage } from '@/features/reservations/VoucherPage';

/** Pantallas públicas (portada e inicio de sesión) y pantallas solo para estudiantes. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="ingresar" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="explorar" element={<ExplorePage />} />
          <Route path="espacio/:spaceId" element={<SpaceDetailPage />} />
          <Route path="comprobante/:rid" element={<VoucherPage />} />
          <Route path="liberar/:bookingId" element={<ReleasePage />} />
          <Route path="mis-reservas" element={<MyReservationsPage />} />
          <Route path="check-in/:rid" element={<CheckInPage />} />
          <Route path="top" element={<TopPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="reportar" element={<ReportPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
