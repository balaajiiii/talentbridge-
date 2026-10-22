import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyApplicationsPage } from '@/pages/MyApplicationsPage';
import { OrganizerDashboardPage } from '@/pages/OrganizerDashboardPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Automatically select the correct dashboard for the logged-in user.
function DashboardHomeRoute() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  const role = String(profile?.role ?? '')
    .trim()
    .toLowerCase();

  if (role === 'organizer') {
    return <Navigate to="/dashboard/organizer" replace />;
  }

  return <DashboardPage />;
}

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route
        path="/dashboard/applications"
        element={
          <ProtectedRoute>
            <MyApplicationsPage />
          </ProtectedRoute>
        }
      />

      {/* Dedicated organizer dashboard */}
      <Route
        path="/dashboard/organizer"
        element={
          <ProtectedRoute>
            <OrganizerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Automatically select the dashboard based on the user's role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardHomeRoute />
          </ProtectedRoute>
        }
      />

      {/* Send unknown dashboard paths back to the dashboard */}
      <Route
        path="/dashboard/*"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;