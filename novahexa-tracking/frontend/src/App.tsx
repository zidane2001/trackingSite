import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Public pages
import { Home } from './pages/Home';
import { Tracking } from './pages/Tracking';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { Legal, PrivacyPolicy, CookiePolicy } from './pages/Legal';

// Auth pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Client pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientPackageDetail } from './pages/client/ClientPackageDetail';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSubmissions } from './pages/admin/AdminSubmissions';
import { AdminPackages } from './pages/admin/AdminPackages';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminContactMessages } from './pages/admin/AdminContactMessages';
import { AdminMap } from './pages/admin/AdminMap';

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="flex-1 flex flex-col">{children}</main>
    <Footer />
  </>
);

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans text-slate-900">
          <Routes>
            {/* ── Public pages ── */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/tracking" element={<PublicLayout><Tracking /></PublicLayout>} />
            <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/legal/cgu" element={<PublicLayout><Legal /></PublicLayout>} />
            <Route path="/legal/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
            <Route path="/legal/cookies" element={<PublicLayout><CookiePolicy /></PublicLayout>} />

            {/* ── Auth pages (no public layout) ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Client pages (protected) ── */}
            <Route
              path="/client"
              element={
                <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/packages/:id"
              element={
                <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                  <ClientPackageDetail />
                </ProtectedRoute>
              }
            />

            {/* ── Admin pages (protected) ── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/submissions"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminSubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/packages"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminPackages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/map"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminMap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contact-messages"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminContactMessages />
                </ProtectedRoute>
              }
            />

            {/* ── 404 fallback ── */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <div className="flex-1 flex items-center justify-center py-20">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
                      <p className="text-slate-500 mb-6">Page non trouvée</p>
                      <a href="/" className="text-yellow-500 font-semibold hover:underline">
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                </PublicLayout>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
