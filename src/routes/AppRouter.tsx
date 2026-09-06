// src/routes/AppRouter.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy‑load page components
const HomePage = lazy(() => import('../components/HomeView'));
const AboutPage = lazy(() => import('../components/AboutView'));
const TrainingPage = lazy(() => import('../components/TrainingEventsView'));
const NoticePage = lazy(() => import('../components/NoticeBlogsView'));
const MemoriesPage = lazy(() => import('../components/MemoriesView'));
const CadetsPage = lazy(() => import('../components/CadetsCornerView'));
const HonorPage = lazy(() => import('../components/HonorBoardView'));
const ContactPage = lazy(() => import('../components/ContactView'));
const RecruitmentPage = lazy(() => import('../components/RecruitmentView'));
const AdminPage = lazy(() => import('../components/admin/AdminView'));

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
