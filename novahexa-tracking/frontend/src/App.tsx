import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';

// Public pages (lazy loaded)
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Tracking = React.lazy(() => import('./pages/Tracking').then(m => ({ default: m.Tracking })));
const Services = React.lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const FAQ = React.lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const LegalPage = React.lazy(() => import('./pages/Legal').then(m => ({ default: m.Legal })));
const PrivacyPolicy = React.lazy(() => import('./pages/Legal').then(m => ({ default: m.PrivacyPolicy })));
const CookiePolicy = React.lazy(() => import('./pages/Legal').then(m => ({ default: m.CookiePolicy })));

// Auth pages (lazy loaded)
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));

// Client pages (lazy loaded)
const ClientDashboard = React.lazy(() => import('./pages/client/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const ClientPackageDetail = React.lazy(() => import('./pages/client/ClientPackageDetail').then(m => ({ default: m.ClientPackageDetail })));
const ClientMessages = React.lazy(() => import('./pages/client/ClientMessages').then(m => ({ default: m.ClientMessages })));
const ClientProfile = React.lazy(() => import('./pages/client/ClientProfile').then(m => ({ default: m.ClientProfile })));

// Admin pages (lazy loaded)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminSubmissions = React.lazy(() => import('./pages/admin/AdminSubmissions').then(m => ({ default: m.AdminSubmissions })));
const AdminPackages = React.lazy(() => import('./pages/admin/AdminPackages').then(m => ({ default: m.AdminPackages })));
const AdminMessages = React.lazy(() => import('./pages/admin/AdminMessages').then(m => ({ default: m.AdminMessages })));
const AdminContactMessages = React.lazy(() => import('./pages/admin/AdminContactMessages').then(m => ({ default: m.AdminContactMessages })));
const AdminMap = React.lazy(() => import('./pages/admin/AdminMap').then(m => ({ default: m.AdminMap })));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminFaq = React.lazy(() => import('./pages/admin/AdminFaq').then(m => ({ default: m.AdminFaq })));

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="flex-1 flex flex-col">{children}</main>
    <Footer />
  </>
);

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Chargement…</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans text-slate-900">
          <WhatsAppButton />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public pages ── */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/tracking" element={<PublicLayout><Tracking /></PublicLayout>} />
              <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/legal/cgu" element={<PublicLayout><LegalPage /></PublicLayout>} />
              <Route path="/legal/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
              <Route path="/legal/cookies" element={<PublicLayout><CookiePolicy /></PublicLayout>} />

              {/* ── Auth pages (no public layout) ── */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

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
              <Route
                path="/client/messages"
                element={
                  <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                    <ClientMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/profile"
                element={
                  <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                    <ClientProfile />
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
                path="/admin/analytics"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminAnalytics />
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
              <Route
                path="/admin/faq"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminFaq />
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
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}
