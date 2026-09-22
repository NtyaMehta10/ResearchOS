'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { CommandPalette } from '@/components/modals/CommandPalette';
import { NewProjectModal } from '@/components/modals/NewProjectModal';
import { UploadDocumentModal } from '@/components/modals/UploadDocumentModal';
import { NewNoteModal } from '@/components/modals/NewNoteModal';
import { NewCollectionModal } from '@/components/modals/NewCollectionModal';
import { Loader2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onRefreshData?: () => void;
}

export function AppShell({ children, title, subtitle, onRefreshData }: AppShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">Loading ResearchOS workspace...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleCreated = () => {
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar
          onNewProject={() => setIsProjectModalOpen(true)}
          onUploadDoc={() => setIsDocModalOpen(true)}
          onNewNote={() => setIsNoteModalOpen(true)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <AppSidebar
              onNewProject={() => {
                setMobileMenuOpen(false);
                setIsProjectModalOpen(true);
              }}
              onUploadDoc={() => {
                setMobileMenuOpen(false);
                setIsDocModalOpen(true);
              }}
              onNewNote={() => {
                setMobileMenuOpen(false);
                setIsNoteModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          title={title}
          subtitle={subtitle}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNewProject={() => setIsProjectModalOpen(true)}
          onUploadDoc={() => setIsDocModalOpen(true)}
          onNewNote={() => setIsNoteModalOpen(true)}
          onNewCollection={() => setIsCollectionModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Modals */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <NewProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreated={handleCreated}
      />

      <UploadDocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onUploaded={handleCreated}
      />

      <NewNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onCreated={handleCreated}
      />

      <NewCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
