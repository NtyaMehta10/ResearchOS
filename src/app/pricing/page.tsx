'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Academic & Scholar',
      price: '$0',
      period: 'forever free',
      description: 'Ideal for PhD candidates, students, and independent research fellows.',
      features: [
        'Up to 5 active research projects',
        'Unlimited literature documents (up to 5GB)',
        'Rich markdown notes with citation links',
        'Collections & multi-tag taxonomy',
        'Unified full-text search',
        'Audit activity log (30 days)',
      ],
      cta: 'Start Free',
      popular: false,
      href: '/register',
    },
    {
      name: 'Pro Researcher',
      price: '$18',
      period: 'per month',
      description: 'For principal investigators, postdoctoral researchers, and staff scientists.',
      features: [
        'Unlimited research projects',
        '50GB secure document storage',
        'Full document metadata extraction',
        'Unlimited collections & custom tags',
        'Advanced analytics & productivity telemetry',
        'Phase 2 AI Readiness Access',
        'Priority data export & backups',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
      href: '/register?plan=pro',
    },
    {
      name: 'Lab & Institute',
      price: '$45',
      period: 'per seat / month',
      description: 'For laboratories, university departments, and R&D organizations.',
      features: [
        'Everything in Pro Researcher',
        'Centralized institutional billing',
        'Shared group literature repositories',
        'Role-based permissions & audit trails',
        'Dedicated lab workspace coordinator',
        'Custom domain & SSO (SAML/Okta)',
      ],
      cta: 'Contact Lab Sales',
      popular: false,
      href: '/register?plan=lab',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Transparent Research Pricing
          </h1>
          <p className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mt-2">
            Predictable plans for serious inquiry.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Free forever for early scholars. Upgraded power for high-output labs and grant-funded research.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 flex flex-col justify-between border transition-all ${
                tier.popular
                  ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-card shadow-xl relative'
                  : 'border-border bg-card/60'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Most Popular
                </div>
              )}

              <div>
                <h2 className="text-lg font-bold text-foreground">{tier.name}</h2>
                <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{tier.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                  <span className="text-xs text-muted-foreground">/{tier.period}</span>
                </div>

                <div className="mt-8 space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Included capabilities:
                  </p>
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-xs text-foreground/90">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <Link href={tier.href}>
                  <Button
                    variant={tier.popular ? 'primary' : 'outline'}
                    className="w-full"
                    size="md"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
