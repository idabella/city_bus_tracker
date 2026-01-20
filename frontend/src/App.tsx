import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { Cities } from './pages/Cities';
import { Stations } from './pages/Stations';
import { BusLines } from './pages/BusLines';
import { Buses } from './pages/Buses';
import { Drivers } from './pages/Drivers';
import { Trips } from './pages/Trips';
import { Tickets } from './pages/Tickets';
import { Subscriptions } from './pages/Subscriptions';
import { MaintenancePage } from './pages/Maintenance';
import { Incidents } from './pages/Incidents';
import LoginPage from './pages/login';
import SignUpPage from './pages/SignUp';

// Layout avec Sidebar pour les pages du dashboard
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children, path }: { children: React.ReactNode; path: string }) {
  const { user, hasAccess } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasAccess(path)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />

                {/* Routes du dashboard avec sidebar */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute path="/dashboard">
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cities"
                  element={
                    <ProtectedRoute path="/cities">
                      <DashboardLayout>
                        <Cities />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stations"
                  element={
                    <ProtectedRoute path="/stations">
                      <DashboardLayout>
                        <Stations />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bus-lines"
                  element={
                    <ProtectedRoute path="/bus-lines">
                      <DashboardLayout>
                        <BusLines />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/buses"
                  element={
                    <ProtectedRoute path="/buses">
                      <DashboardLayout>
                        <Buses />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/drivers"
                  element={
                    <ProtectedRoute path="/drivers">
                      <DashboardLayout>
                        <Drivers />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips"
                  element={
                    <ProtectedRoute path="/trips">
                      <DashboardLayout>
                        <Trips />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <ProtectedRoute path="/tickets">
                      <DashboardLayout>
                        <Tickets />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions"
                  element={
                    <ProtectedRoute path="/subscriptions">
                      <DashboardLayout>
                        <Subscriptions />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maintenance"
                  element={
                    <ProtectedRoute path="/maintenance">
                      <DashboardLayout>
                        <MaintenancePage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute path="/incidents">
                      <DashboardLayout>
                        <Incidents />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;