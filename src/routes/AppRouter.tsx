// src/routes/AppRouter.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy‑load page components
const HomePage = lazy(() => import('../components/HomeView').then(m => ({ default: m.HomeView as any })));
const AboutPage = lazy(() => import('../components/AboutView').then(m => ({ default: m.AboutView as any })));
const TrainingPage = lazy(() => import('../components/TrainingEventsView').then(m => ({ default: m.TrainingEventsView as any })));
const NoticePage = lazy(() => import('../components/NoticeBlogsView').then(m => ({ default: m.NoticeBlogsView as any })));
const MemoriesPage = lazy(() => import('../components/MemoriesView').then(m => ({ default: m.MemoriesView as any })));
const CadetsPage = lazy(() => import('../components/CadetsCornerView').then(m => ({ default: m.CadetsCornerView as any })));
const HonorPage = lazy(() => import('../components/HonorBoardView').then(m => ({ default: m.HonorBoardView as any })));
const ContactPage = lazy(() => import('../components/ContactView').then(m => ({ default: m.ContactView as any })));
const RecruitmentPage = lazy(() => import('../components/RecruitmentView').then(m => ({ default: m.RecruitmentView as any })));
const AdminPage = lazy(() => import('../components/admin/AdminView').then(m => ({ default: m.AdminView as any })));

export default function AppRouter() {
  const isAdmin = useAppStore(state => state.isAdminAuthenticated);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/notices" element={<NoticePage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/cadets" element={<CadetsPage />} />
            <Route path="/honor" element={<HonorPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/home" replace />} />
            <Route path="*" element={<div className="p-8 text-center">404 – Page not found</div>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
