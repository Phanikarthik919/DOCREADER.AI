'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText } from 'lucide-react';

const links = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
              isActive
                ? 'bg-indigo-500/20 text-indigo-300' // Active state
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200' // Inactive state
            }`}
          >
            <LinkIcon className="h-5 w-5" />
            <span className="font-medium">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}