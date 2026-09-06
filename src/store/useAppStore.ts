// src/store/useAppStore.ts
import { TabType } from '../types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { verifyAdminToken } from '../utils/auth';

type AuthSlice = {
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (value: boolean) => void;
  validateAdminToken: () => Promise<void>;
};

type UIStateSlice = {
  showBackToTop: boolean;
  setShowBackToTop: (value: boolean) => void;
  // modal visibility flags
  isJoinModalOpen: boolean;
  setJoinModalOpen: (value: boolean) => void;
  isCadetAuthOpen: boolean;
  setCadetAuthOpen: (value: boolean) => void;
  isUniformModalOpen: boolean;
  setUniformModalOpen: (value: boolean) => void;
  isAdminLoginOpen: boolean;
  setAdminLoginOpen: (value: boolean) => void;
  showLegalModal: string | null;
  setShowLegalModal: (value: string | null) => void;
  // active tab state for routing
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
};

type SelectedSlice = {
  selectedNotice: any; // could be typed later
  setSelectedNotice: (notice: any | null) => void;
  selectedBlog: any;
  setSelectedBlog: (blog: any | null) => void;
  selectedMemory: any;
  setSelectedMemory: (memory: any | null) => void;
};

type AppState = AuthSlice & UIStateSlice & SelectedSlice;

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Auth
        isAdminAuthenticated: false,
        setIsAdminAuthenticated: (value) => set({ isAdminAuthenticated: value }),
        validateAdminToken: async () => {
          const token = typeof window !== 'undefined' ? sessionStorage.getItem('ngdc_admin_auth') : null;
          if (token) {
            const valid = await verifyAdminToken(token);
            set({ isAdminAuthenticated: valid });
          } else {
            set({ isAdminAuthenticated: false });
          }
        },
        // UI
        showBackToTop: false,
        setShowBackToTop: (value) => set({ showBackToTop: value }),
        isJoinModalOpen: false,
        setJoinModalOpen: (value) => set({ isJoinModalOpen: value }),
        isCadetAuthOpen: false,
        setCadetAuthOpen: (value) => set({ isCadetAuthOpen: value }),
        isUniformModalOpen: false,
        setUniformModalOpen: (value) => set({ isUniformModalOpen: value }),
        isAdminLoginOpen: false,
        setAdminLoginOpen: (value) => set({ isAdminLoginOpen: value }),
        showLegalModal: null,
        setShowLegalModal: (value) => set({ showLegalModal: value }),
        // active tab for routing
        activeTab: 'home',
        setActiveTab: (tab) => set({ activeTab: tab }),
        // Selected items
        selectedNotice: null,
        setSelectedNotice: (notice) => set({ selectedNotice: notice }),
        selectedBlog: null,
        setSelectedBlog: (blog) => set({ selectedBlog: blog }),
        selectedMemory: null,
        setSelectedMemory: (memory) => set({ selectedMemory: memory }),
      }),
      { name: 'app-store' }
    )
  )
);
