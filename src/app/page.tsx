'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  FolderKanban,
  FileText,
  StickyNote,
  FolderGit2,
  Search,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Database,
  Cpu,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [demoLoading, setDemoLoading] = React.useState(false);

  const handleInstantDemo = async () => {
    setDemoLoading(true);
    const res = await login('demo@researchos.io', 'Password123!');
    if (res.success) {
      router.push('/dashboard');
    }
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>ResearchOS v1.0 — Commercial-Grade Research Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Organize complex research with <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 bg-clip-text text-transparent">scientific rigor.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The unified SaaS workspace designed for principal investigators, postdoctoral researchers, and quantitative teams. Structure literature, synthesize notes, manage collections, and audit research milestones in one coherent workspace.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Dashboard Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={handleInstantDemo}
                  isLoading={demoLoading}
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30"
                >
                  Explore Demo Workspace (Instant Access)
                </Button>

                <Link href="/register">
                  <Button variant="outline" size="lg">
                    Create Free Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick Credential hint */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Preloaded test accounts: <code>demo@researchos.io</code> (Password: <code>Password123!</code>)</span>
          </div>

          {/* Realistic SaaS Workspace Mockup Preview */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-border shadow-2xl bg-card/60 backdrop-blur-xl p-2 sm:p-4 overflow-hidden">
            <div className="rounded-xl border border-border bg-background p-4 sm:p-6 text-left">
              {/* Fake App header */}
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-semibold text-foreground/80 pl-2">
                    ResearchOS / Workspace / CRISPR-Cas9 Target Recognition
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                    Live Synced
                  </span>
                </div>
              </div>

              {/* Workspace grid mock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Active Project
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    Mechanisms of CRISPR-Cas9 Target Recognition
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-medium">
                      #CRISPR-Cas9
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-medium">
                      #High-Priority
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Primary Literature
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1 truncate">
                    A Programmable Dual-RNA-Guided Endonuclease
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Science 2012 • Jinek, Doudna, Charpentier
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Synthesized Findings
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    PAM proximal seed mismatch kinetics (1-8 bp)
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                    ✓ Verified against cryo-EM models
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-24 border-b border-border/60 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Complete Feature Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
              Everything researchers need to execute rigorous inquiries.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mt-3">
              Built on a normalized relational database schema with real-time audit logging and full REST endpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Dedicated Project Workspaces</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Isolate distinct research grants, clinical studies, or literature reviews. Manage project statuses, custom icons, color tokens, and team visibility.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Document Management</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Upload PDFs, DOCX, and research manuscripts. Catalog DOIs, publication years, journal venues, abstracts, and multi-tag categorizations.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <StickyNote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Markdown Synthesis Notes</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Clean markdown editor supporting headings, code blocks, citations, equations, and direct two-way linking to papers and projects.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Thematic Collections</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Create structured binders across or within projects. Organize foundational literature, experimental datasets, and methodology reviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Unified Search & ⌘K Palette</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Instant search across projects, documents, abstracts, author names, notes, and tags with keyboard shortcut navigation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Activity Stream & Analytics</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Full chronological audit trail of all research operations and visual analytics tracking literature acquisition and writing velocity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Quality & Phase 2 AI-Ready Architecture */}
      <section className="py-20 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl border border-border bg-card/80 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Engineering Integrity
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                  Built for production, engineered for the AI frontier.
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  Phase 1 strictly establishes solid software engineering fundamentals: normalized database architecture, bulletproof Zod validation, JWT session handling, and atomic state updates.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Normalized SQLite & Prisma Schema</p>
                      <p className="text-[11px] text-muted-foreground">Indexed foreign keys, composite join tables, and cascade deletes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Security & Authorization</p>
                      <p className="text-[11px] text-muted-foreground">Bcrypt password hashing, HTTP-only secure cookie tokens, and strict user-tenant isolation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cpu className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Phase 2 Extension Ready</p>
                      <p className="text-[11px] text-muted-foreground">Structured schema extension points for vector embeddings, citation graphs, and RAG synthesis.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/50 border border-border font-mono text-xs text-foreground/90 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/80">
                  <span>architecture-status.json</span>
                  <span className="text-emerald-500 font-sans font-semibold">● PHASE 1 CERTIFIED</span>
                </div>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold">&#123;</p>
                <p className="pl-4">&quot;framework&quot;: &quot;Next.js 15 (App Router)&quot;,</p>
                <p className="pl-4">&quot;database&quot;: &quot;SQLite via Prisma ORM&quot;,</p>
                <p className="pl-4">&quot;auth&quot;: &quot;JWT + Secure HTTP-Only Cookies&quot;,</p>
                <p className="pl-4">&quot;validation&quot;: &quot;Zod Typed Schemas&quot;,</p>
                <p className="pl-4">&quot;ai_layer&quot;: &quot;Phase 2 Reserved (Stubs & Hooks ready)&quot;,</p>
                <p className="pl-4">&quot;theme_mode&quot;: &quot;Dark / Light / System auto-sync&quot;</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold">&#125;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold tracking-tight text-foreground">ResearchOS</span>
            <span className="text-xs text-muted-foreground ml-2">© 2026 Production SaaS.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
