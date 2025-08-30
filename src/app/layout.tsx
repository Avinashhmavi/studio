import type { Metadata } from 'next';
import './globals.css';

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { JurisdictionProvider } from '@/contexts/jurisdiction-context';

export const metadata: Metadata = {
  title: 'Legal Ai',
  description: 'Your AI-powered Legal Assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <JurisdictionProvider>
          <SidebarProvider defaultOpen={true}>
              <AppSidebar />
              <SidebarInset>
                  <AppHeader />
                  <main className="p-4 sm:p-6 lg:p-8">{children}</main>
              </SidebarInset>
          </SidebarProvider>
        </JurisdictionProvider>
        <Toaster />
      </body>
    </html>
  );
}
