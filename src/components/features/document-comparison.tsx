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
import {
  compareLegalDocuments,
  type CompareLegalDocumentsOutput,
} from '@/ai/flows/compare-legal-documents';
import { Loader2, FileUp, GitCompareArrows } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';

export function DocumentComparison() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [result, setResult] = useState<CompareLegalDocumentsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFile1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile1(selectedFile);
      setResult(null);
    }
  };

  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile2(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file1 || !file2) {
      toast({
        variant: 'destructive',
        title: 'Missing documents',
        description: 'Please select two documents to compare.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const [document1DataUri, document2DataUri] = await Promise.all([
        fileToDataUri(file1),
        fileToDataUri(file2),
      ]);
      const response = await compareLegalDocuments({ document1DataUri, document2DataUri });
      setResult(response);
    } catch (error) {
      console.error('Comparison failed:', error);
      toast({
        variant: 'destructive',
        title: 'Comparison Failed',
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
            <CardTitle>Compare Documents</CardTitle>
            <CardDescription>
              Upload two documents to highlight changes and discrepancies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document1">Document 1</Label>
                <div className="relative">
                  <Input
                    id="document1"
                    type="file"
                    onChange={handleFile1Change}
                    accept=".pdf,.doc,.docx,.txt"
                    className="pl-10"
                  />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                 {file1 && <p className="text-sm text-muted-foreground">Selected: {file1.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="document2">Document 2</Label>
                <div className="relative">
                  <Input
                    id="document2"
                    type="file"
                    onChange={handleFile2Change}
                    accept=".pdf,.doc,.docx,.txt"
                    className="pl-10"
                  />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                 {file2 && <p className="text-sm text-muted-foreground">Selected: {file2.name}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !file1 || !file2}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <GitCompareArrows className="mr-2 h-4 w-4" />
                    Compare Documents
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Comparison Result</CardTitle>
            <CardDescription>
              A summary of the differences between the two documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is comparing your documents...</p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">
                  Your comparison result will appear here.
                </p>
              </div>
            )}
            {result && (
              <div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.comparisonSummary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
