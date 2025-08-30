'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/':
      return 'Document Analysis';
    case '/contract-generation':
      return 'Contract Generation';
    case '/legal-qa':
      return 'Legal Q&A';
    case '/negotiation-support':
      return 'AI Negotiation Support';
    case '/document-storage':
      return 'My Documents';
    case '/document-comparison':
      return 'Document Comparison';
    case '/e-signature':
      return 'E-Signature';
    default:
      return 'Dashboard';
  }
};

export function AppHeader() {
  const pathname = usePathname();
  const [jurisdiction, setJurisdiction] = useState('california');

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{getPageTitle(pathname)}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Select value={jurisdiction} onValueChange={setJurisdiction}>
          <SelectTrigger className="w-[180px] hidden sm:flex">
            <SelectValue placeholder="Select Jurisdiction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="california">California</SelectItem>
            <SelectItem value="new-york">New York</SelectItem>
            <SelectItem value="texas">Texas</SelectItem>
            <SelectItem value="federal">Federal</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/100/100" alt="User" data-ai-hint="person avatar" width={100} height={100} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">User</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
