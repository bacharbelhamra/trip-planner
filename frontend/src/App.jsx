import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateTrip from './pages/CreateTrip';
import ViewTrip from './pages/ViewTrip';
import MyTrips from './pages/MyTrips';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading && !user) return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );
  if (!user) return <Navigate to="/auth" state={{ from: window.location.pathname }} replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const hideHeader = location.pathname === '/auth';
  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
        <Route path="/view-trip/:id" element={<ProtectedRoute><ViewTrip /></ProtectedRoute>} />
        <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
