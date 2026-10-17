/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SvgLiquidFilter } from './components/common/SvgLiquidFilter';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { FloatingPublishButton } from './components/layout/FloatingPublishButton';
import { FeedView } from './components/feed/FeedView';
import { PhotosView } from './components/photos/PhotosView';
import { StudioView } from './components/studio/StudioView';
import { MessagingView } from './components/messaging/MessagingView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { ClientGalleryView } from './components/gallery/ClientGalleryView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { SettingsModal } from './components/common/SettingsModal';
import { FirstAdminSetupModal } from './components/admin/FirstAdminSetupModal';
import { PrivateGalleryCodeModal } from './components/gallery/PrivateGalleryCodeModal';
import { AboutStudioModal } from './components/common/AboutStudioModal';
import { SystemSetting, Post, Gallery } from './types';
import {
  getSystemSettings,
  DEFAULT_SETTINGS,
  subscribeToFeedPosts,
  subscribeToNotifications,
  subscribeToUserGalleries,
} from './services/dataService';

function MainApp() {
  const { currentUser, userProfile, isAdmin, isAdminInitialized } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [systemSettings, setSystemSettings] = useState<SystemSetting>(DEFAULT_SETTINGS);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [clientGalleries, setClientGalleries] = useState<Gallery[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  // Gallery view state if opening a private client gallery
  const [viewingGalleryToken, setViewingGalleryToken] = useState<string | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFirstAdminModalOpen, setIsFirstAdminModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isAboutStudioOpen, setIsAboutStudioOpen] = useState(false);

  // Load URL query params on boot (e.g. ?gallery=token)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const galleryParam = params.get('gallery');
    if (galleryParam) {
      setViewingGalleryToken(galleryParam);
      setActiveTab('gallery');
    }
  }, []);

  // Fetch settings
  useEffect(() => {
    async function init() {
      const s = await getSystemSettings();
      setSystemSettings(s);
    }
    init();
  }, []);

  // Listen to user's assigned private galleries (for Studio tab)
  useEffect(() => {
    if (!currentUser) {
      setClientGalleries([]);
      return;
    }
    const unsub = subscribeToUserGalleries(currentUser.uid, currentUser.email || undefined, (galleries) => {
      setClientGalleries(galleries);
    });
    return () => unsub();
  }, [currentUser]);

  // Listen to feed posts for user profile count
  useEffect(() => {
    const unsub = subscribeToFeedPosts((posts) => {
      if (currentUser) {
        setUserPosts(posts.filter((p) => p.authorId === currentUser.uid));
      }
    }, currentUser?.uid);
    return () => unsub();
  }, [currentUser]);

  // Listen to unread notifications
  useEffect(() => {
    if (!currentUser) {
      setUnreadNotifsCount(0);
      return;
    }
    const unsub = subscribeToNotifications(currentUser.uid, (items) => {
      setUnreadNotifsCount(items.filter((i) => !i.isRead).length);
    });
    return () => unsub();
  }, [currentUser]);

  // Handle open gallery from code modal or studio
  const handleOpenGallery = (identifier: string) => {
    setViewingGalleryToken(identifier);
    setActiveTab('gallery');
  };

  const hasStudioGalleries = clientGalleries.length > 0 || isAdmin;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors duration-200">
      {/* SVG Liquid Gooey Filter */}
      <SvgLiquidFilter />

      {/* When in Client Gallery View, render full-bleed gallery */}
      {activeTab === 'gallery' && viewingGalleryToken ? (
        <ClientGalleryView
          galleryIdentifier={viewingGalleryToken}
          onBackToHome={() => {
            setViewingGalleryToken(null);
            setActiveTab('feed');
            window.history.replaceState({}, '', '/');
          }}
          whatsappNumber={systemSettings.studioWhatsApp}
          onRequireAuth={() => setIsAuthModalOpen(true)}
        />
      ) : activeTab === 'admin' ? (
        <AdminDashboard
          onBackToFeed={() => setActiveTab('feed')}
          onOpenClientGallery={(token) => {
            setViewingGalleryToken(token);
            setActiveTab('gallery');
          }}
        />
      ) : (
        <>
          {/* Top Navbar */}
          <Navbar
            activeTab={activeTab}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenAboutStudio={() => setIsAboutStudioOpen(true)}
          />

          {/* Main Content Area based on Active Tab */}
          <main className="flex-1 w-full">
            {activeTab === 'feed' && (
              <FeedView
                settings={systemSettings}
                onExplorePhotos={() => setActiveTab('photos')}
                onOpenPrivateGalleryModal={() => setIsCodeModalOpen(true)}
                onRequireAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'photos' && (
              <PhotosView onRequireAuth={() => setIsAuthModalOpen(true)} />
            )}

            {/* Studio space (conditional for clients with galleries) */}
            {activeTab === 'studio' && (
              <StudioView
                galleries={clientGalleries}
                settings={systemSettings}
                onOpenGallery={handleOpenGallery}
                onRequireAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'messages' && (
              <MessagingView onRequireAuth={() => setIsAuthModalOpen(true)} />
            )}

            {activeTab === 'notifications' && (
              <NotificationsView
                onRequireAuth={() => setIsAuthModalOpen(true)}
                onNavigateToPost={() => setActiveTab('feed')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                userPosts={userPosts}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onRequireAuth={() => setIsAuthModalOpen(true)}
              />
            )}
          </main>

          {/* Floating Action Button (+) "Publier" */}
          <FloatingPublishButton
            onPostCreated={() => setActiveTab('feed')}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />

          {/* Bottom Elastic Liquid Navigation */}
          <BottomNav
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setViewingGalleryToken(null);
              setActiveTab(tab);
            }}
            unreadNotificationsCount={unreadNotifsCount}
            unreadMessagesCount={0}
            hasStudioGalleries={hasStudioGalleries}
          />
        </>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenFirstAdminSetup={() => setIsFirstAdminModalOpen(true)}
        onNavigateToAdmin={() => setActiveTab('admin')}
      />

      <FirstAdminSetupModal
        isOpen={isFirstAdminModalOpen}
        onClose={() => setIsFirstAdminModalOpen(false)}
        onSuccess={() => setActiveTab('admin')}
      />

      <PrivateGalleryCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSubmitTokenOrCode={handleOpenGallery}
        whatsappNumber={systemSettings.studioWhatsApp}
      />

      <AboutStudioModal
        isOpen={isAboutStudioOpen}
        onClose={() => setIsAboutStudioOpen(false)}
        settings={systemSettings}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
