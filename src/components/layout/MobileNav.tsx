'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, FileText, StickyNote, Search } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Docs', href: '/documents', icon: FileText },
    { label: 'Notes', href: '/notes', icon: StickyNote },
    { label: 'Search', href: '/search', icon: Search },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/90 backdrop-blur-md border-t border-border" aria-label="Mobile navigation">
      <div className="flex items-center justify-around px-1 py-2">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
            }`} aria-current={isActive ? 'page' : undefined}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
