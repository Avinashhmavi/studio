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
  analyzeLegalDocument,
  type AnalyzeLegalDocumentOutput,
} from '@/ai/flows/analyze-legal-documents';
import { Loader2, FileUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function DocumentAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeLegalDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a legal document to analyze.',
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const documentDataUri = await fileToDataUri(file);
      const result = await analyzeLegalDocument({ documentDataUri });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
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
            <CardTitle>Analyze Document</CardTitle>
            <CardDescription>
              Upload a legal document to extract key terms, identify risks, and
              receive a summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document">Legal Document</Label>
                <div className="relative">
                  <Input
                    id="document"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="pl-10"
                  />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                 {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !file}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Document'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Review the AI-generated analysis of your document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is analyzing your document...</p>
              </div>
            )}
            {!isLoading && !analysis && (
              <div className="flex items-center justify-center pt-10 text-center">
                <p className="text-muted-foreground">
                  Your analysis results will appear here.
                </p>
              </div>
            )}
            {analysis && (
              <Accordion type="multiple" defaultValue={['summary', 'key-terms', 'risks', 'attention']} className="w-full space-y-4">
                <AccordionItem value="summary" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Summary</AccordionTrigger>
                  <AccordionContent className="pt-2 text-base leading-relaxed">
                    {analysis.summary}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="key-terms" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Key Terms</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <ul className="list-disc space-y-2 pl-5">
                      {analysis.keyTerms.map((term, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="mr-2 mt-1 h-4 w-4 shrink-0 text-green-500" />
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="risks" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Potential Risks</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <ul className="list-disc space-y-2 pl-5">
                      {analysis.potentialRisks.map((risk, index) => (
                        <li key={index} className="flex items-start">
                           <AlertTriangle className="mr-2 mt-1 h-4 w-4 shrink-0 text-yellow-500" />
                           <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="attention" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Areas Requiring Attention</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <ul className="list-disc space-y-2 pl-5">
                      {analysis.areasRequiringAttention.map((area, index) => (
                         <li key={index} className="flex items-start">
                            <AlertTriangle className="mr-2 mt-1 h-4 w-4 shrink-0 text-red-500" />
                            <span>{area}</span>
                        </li>
                      ))}
                    </ul>
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
