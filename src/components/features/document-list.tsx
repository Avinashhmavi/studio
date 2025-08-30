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
import { MoreHorizontal, FilePlus } from 'lucide-react';

const documents = [
  {
    name: 'Employment Agreement.pdf',
    type: 'Contract',
    date: '2024-05-15',
    status: 'Analyzed',
  },
  {
    name: 'Apartment Lease.docx',
    type: 'Lease',
    date: '2024-05-10',
    status: 'Analyzed',
  },
  {
    name: 'NDA_Project_X.pdf',
    type: 'NDA',
    date: '2024-04-28',
    status: 'Draft',
  },
  {
    name: 'Last Will and Testament.docx',
    type: 'Will',
    date: '2024-03-01',
    status: 'Signed',
  },
];

export function DocumentList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
            <CardTitle>My Documents</CardTitle>
            <CardDescription>
            A secure place to store and manage your legal documents.
            </CardDescription>
        </div>
        <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Date Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.name}>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell className="hidden md:table-cell">{doc.type}</TableCell>
                <TableCell className="hidden md:table-cell">{doc.date}</TableCell>
                <TableCell>
                  <Badge variant={doc.status === 'Analyzed' ? 'default' : 'secondary'}>
                    {doc.status}
                  </Badge>
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
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
