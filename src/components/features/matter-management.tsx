
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const matters = [
  {
    name: 'Wilson v. Acme Corp',
    status: 'In Progress',
    deadline: '2024-08-15',
    assignedTo: { name: 'Alice Johnson', avatar: 'https://picsum.photos/id/1011/100' },
  },
  {
    name: 'Project Phoenix Merger',
    status: 'Discovery',
    deadline: '2024-09-01',
    assignedTo: { name: 'Robert Brown', avatar: 'https://picsum.photos/id/1012/100' },
  },
  {
    name: 'Estate of Eleanor Vance',
    status: 'On Hold',
    deadline: '2024-07-30',
    assignedTo: { name: 'Emily White', avatar: 'https://picsum.photos/id/1013/100' },
  },
  {
    name: 'IP Filing for "Innovate"',
    status: 'Completed',
    deadline: '2024-06-20',
    assignedTo: { name: 'Michael Green', avatar: 'https://picsum.photos/id/1014/100' },
  },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'In Progress': return 'default';
        case 'Discovery': return 'secondary';
        case 'On Hold': return 'outline';
        case 'Completed': return 'destructive'; // Using destructive to show it's done, can be changed
        default: return 'secondary';
    }
}

export function MatterManagement() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
              <CardTitle>Matter Management</CardTitle>
              <CardDescription>
                Track case progress, deadlines, and tasks for your legal matters.
              </CardDescription>
          </div>
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Matter
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter Name</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Next Deadline</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matters.map((matter) => (
                <TableRow key={matter.name}>
                  <TableCell className="font-medium">{matter.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={getStatusBadgeVariant(matter.status)}>
                      {matter.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{matter.deadline}</TableCell>
                   <TableCell>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={matter.assignedTo.avatar} alt={matter.assignedTo.name} data-ai-hint="person avatar" />
                                <AvatarFallback>{matter.assignedTo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{matter.assignedTo.name}</p>
                        </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Tasks</DropdownMenuItem>
                        <DropdownMenuItem>View Documents</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Archive Matter</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
