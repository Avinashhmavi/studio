
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  performDueDiligence,
  type DueDiligenceOutput,
} from '@/ai/flows/due-diligence';
import { Loader2, FileUp, Files, ShieldCheck, AlertTriangle } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function DueDiligence() {
  const [files, setFiles] = useState<File[]>([]);
  const [transactionDetails, setTransactionDetails] = useState('');
  const [report, setReport] = useState<DueDiligenceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setReport(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No files selected',
        description: 'Please upload at least one document for due diligence.',
      });
      return;
    }
    if (!transactionDetails.trim()) {
        toast({
          variant: 'destructive',
          title: 'Missing Details',
          description: 'Please describe the transaction.',
        });
        return;
      }

    setIsLoading(true);
    setReport(null);

    try {
      const documentDataUris = await Promise.all(files.map(fileToDataUri));
      const result = await performDueDiligence({ documentDataUris, transactionDetails });
      setReport(result);
    } catch (error) {
      console.error('Due diligence failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Due Diligence Support</CardTitle>
            <CardDescription>
              Upload documents for a comprehensive AI-powered due diligence analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="transactionDetails">Transaction Details</Label>
                <Textarea
                    id="transactionDetails"
                    placeholder="e.g., 'Acquisition of StartupX by a large tech firm. Focus on IP and employee contracts.'"
                    value={transactionDetails}
                    onChange={(e) => setTransactionDetails(e.target.value)}
                    rows={4}
                    disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Due Diligence Documents</Label>
                <div className="relative">
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                    className="pl-10"
                  />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                 {files.length > 0 && <div className="text-sm text-muted-foreground pt-2">
                    <p>{files.length} file(s) selected:</p>
                    <ul className="list-disc pl-5">
                        {files.map(f => <li key={f.name} className="truncate">{f.name}</li>)}
                    </ul>
                 </div>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || files.length === 0 || !transactionDetails.trim()}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                ) : (
                  'Perform Due Diligence'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Due Diligence Report</CardTitle>
            <CardDescription>
              Review the AI-generated report of your uploaded documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is performing due diligence...</p>
              </div>
            )}
            {!isLoading && !report && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">
                  Your due diligence report will appear here.
                </p>
              </div>
            )}
            {report && (
              <Accordion type="multiple" defaultValue={['summary', 'findings']} className="w-full space-y-4">
                <AccordionItem value="summary" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Executive Summary</AccordionTrigger>
                  <AccordionContent className="pt-2 text-base leading-relaxed">
                    {report.executiveSummary}
                  </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="findings" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Key Findings & Risks</AccordionTrigger>
                  <AccordionContent className="pt-2">
                     <div className="space-y-4">
                      {report.keyFindings.map((finding, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                           <div className="flex items-start gap-3">
                            {finding.riskLevel === 'High' && <AlertTriangle className="h-5 w-5 text-destructive mt-1 shrink-0" />}
                            {finding.riskLevel === 'Medium' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 shrink-0" />}
                            {finding.riskLevel === 'Low' && <ShieldCheck className="h-5 w-5 text-green-600 mt-1 shrink-0" />}
                             <div>
                                <h4 className="font-semibold">{finding.area}</h4>
                                <p className="text-sm">{finding.finding}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    <strong>Recommendation:</strong> {finding.recommendation}
                                </p>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
