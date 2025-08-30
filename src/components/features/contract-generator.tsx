'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const templates = {
  nda: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of [Date] by and between:

[Disclosing Party Name], with a principal place of business at [Address] ("Disclosing Party"), and

[Receiving Party Name], with a principal place of business at [Address] ("Receiving Party").

1.  Purpose. The parties wish to discuss certain business opportunities...
2.  Confidential Information. "Confidential Information" means...
3.  Obligations. The Receiving Party agrees...
...
  `,
  lease: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement (the "Lease") is made and entered into on [Date], by and between:

[Landlord Name] ("Landlord"), and

[Tenant Name(s)] ("Tenant").

1.  Property. Landlord leases to Tenant the premises at [Property Address]...
2.  Term. The term of this Lease shall be for [Number] months/years, beginning on [Start Date]...
3.  Rent. Tenant shall pay Landlord a monthly rent of $[Amount]...
...
  `,
};

type TemplateKey = keyof typeof templates;

export function ContractGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('nda');
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(templates[selectedTemplate]);
    toast({
      title: 'Copied to Clipboard',
      description: 'The contract template has been copied.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate a Contract Template</CardTitle>
        <CardDescription>
          Select a document type to generate a starter template. You can then
          customize it to fit your needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Select
            value={selectedTemplate}
            onValueChange={(value) => setSelectedTemplate(value as TemplateKey)}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nda">Non-Disclosure Agreement (NDA)</SelectItem>
              <SelectItem value="lease">Residential Lease Agreement</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Template
          </Button>
        </div>
        <div>
          <Textarea
            readOnly
            value={templates[selectedTemplate]}
            className="h-[500px] font-mono text-xs"
            aria-label="Contract Template"
          />
        </div>
      </CardContent>
    </Card>
  );
}
