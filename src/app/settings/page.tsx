'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useToast } from '@/components/providers/ToastProvider';
import {
  User,
  Building,
  GraduationCap,
  Shield,
  KeyRound,
  Sun,
  Moon,
  Laptop,
  Download,
  Save,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();

  // Profile Form State
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setInstitution(user.institution || '');
      setDepartment(user.department || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          institution: institution.trim() || undefined,
          department: department.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Profile updated', 'Your researcher credentials have been saved.');
        await refreshUser();
      } else {
        error('Update failed', json.error);
      }
    } catch {
      error('Network error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('Mismatch', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      error('Too short', 'New password must be at least 8 characters long');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Password changed', 'Your security password has been updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        error('Password change failed', json.error);
      }
    } catch {
      error('Network error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportData = () => {
    const dataBlob = {
      user: { email: user?.email, name: user?.name, institution: user?.institution },
      exportTimestamp: new Date().toISOString(),
      format: 'ResearchOS JSON Archive v1.0',
    };
    const blob = new Blob([JSON.stringify(dataBlob, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `researchos-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Export generated', 'Downloaded local JSON backup metadata.');
  };

  return (
    <AppShell
      title="Settings & Researcher Profile"
      subtitle="Manage your identity, security credentials, appearance, and institutional affiliation"
    >
      <div className="space-y-8 max-w-4xl">
        {/* Profile Card */}
        <Card>
          <CardHeader className="p-6 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Researcher Profile</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your academic credentials and institutional affiliation
                </p>
              </div>
              <Badge variant="default" className="text-xs">
                {user?.role || 'RESEARCHER'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Institutional Email"
                  value={user?.email || ''}
                  disabled
                  helperText="Managed by university / institution"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Institution / University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                  placeholder="e.g. Stanford University"
                />
                <Input
                  label="Department / Lab"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                  placeholder="e.g. Bio-X Institute"
                />
              </div>

              <Input
                label="Avatar Image URL (Optional)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                helperText="Provide an HTTPS link to your profile photo"
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isUpdatingProfile}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Appearance & Theme Card */}
        <Card>
          <CardHeader className="p-6 border-b border-border/60">
            <CardTitle className="text-base font-bold">Appearance & Workspace Theme</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize contrast and light or dark ambiance for prolonged reading sessions
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between h-28 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Light Mode</p>
                  <p className="text-[10px] text-muted-foreground">High contrast for daylight</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between h-28 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-900 text-indigo-300 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Dark Mode</p>
                  <p className="text-[10px] text-muted-foreground">Gentle on eyes during late reviews</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between h-28 transition-all ${
                  theme === 'system'
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-secondary text-foreground flex items-center justify-center border border-border">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">System Default</p>
                  <p className="text-[10px] text-muted-foreground">Sync with OS preferences</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Password Card */}
        <Card>
          <CardHeader className="p-6 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-bold">Security & Authentication</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update password and review account security
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password (min 8 characters)"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                size="sm"
                isLoading={isUpdatingPassword}
                leftIcon={<KeyRound className="w-3.5 h-3.5" />}
              >
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Data Portability & Archive Export */}
        <Card>
          <CardHeader className="p-6 border-b border-border/60">
            <CardTitle className="text-base font-bold">Data Export & Backup</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Export your research catalog, project indexes, and note annotations in JSON format
            </p>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Full Workspace Snapshot</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Includes all literature records, metadata, citations, and markdown notes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON Archive
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
