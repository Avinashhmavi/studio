'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Gavel,
  Folder,
  Settings,
  LifeBuoy,
  GitCompareArrows,
  Signature,
  Search,
  BookCopy,
  Workflow,
} from 'lucide-react';
import { Logo } from '@/components/logo';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/case-law-search', label: 'Case Law Search', icon: Search },
  { href: '/precedent-analysis', label: 'Precedent Analysis', icon: BookCopy },
  { href: '/document-comparison', label: 'Compare Documents', icon: GitCompareArrows },
  { href: '/contract-generation', label: 'Contract Generator', icon: FileText },
  { href: '/legal-qa', label: 'Legal Q&A', icon: MessageSquare },
  { href: '/negotiation-support', label: 'Negotiation', icon: Gavel },
  { href: '/guided-workflows', label: 'Guided Workflows', icon: Workflow },
  { href: '/document-storage', label: 'My Documents', icon: Folder },
  { href: '/e-signature', label: 'E-Signature', icon: Signature },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/settings'}>
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Support" isActive={pathname === '/support'}>
                <Link href="/support">
                  <LifeBuoy />
                  <span>Support</span>
                </Link>
              </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
