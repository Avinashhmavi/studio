
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, BookCopy, Landmark, ShieldQuestion, Gavel, FileQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJurisdiction } from '@/contexts/jurisdiction-context';
import { JURISDICTIONS } from '@/lib/jurisdictions';
import { analyzePrecedents, type AnalyzePrecedentsOutput } from '@/ai/flows/analyze-precedents';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function PrecedentAnalysis() {
  const [caseDetails, setCaseDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzePrecedentsOutput | null>(null);
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDetails.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Case Details',
        description: 'Please enter the details of your case.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await analyzePrecedents({ caseDetails, jurisdiction });
      setResult(response);
    } catch (error) {
      console.error('Precedent analysis failed:', error);
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
            <CardTitle>Precedent Analysis</CardTitle>
            <CardDescription>
              Get AI-suggested precedents based on your case details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="case-details">Case Details</Label>
                <Textarea
                  id="case-details"
                  value={caseDetails}
                  onChange={(e) => setCaseDetails(e.target.value)}
                  placeholder="Describe the facts, legal issues, and context of your case..."
                  rows={8}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction-precedent">Jurisdiction</Label>
                 <Select value={jurisdiction} onValueChange={setJurisdiction} disabled={isLoading}>
                    <SelectTrigger id="jurisdiction-precedent">
                        <SelectValue placeholder="Select Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                        {JURISDICTIONS.map((j) => (
                            <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !caseDetails.trim()}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><BookCopy className="mr-2 h-4 w-4" /> Analyze Precedents</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Review the AI-generated precedent analysis below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is analyzing precedents...</p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">Your analysis results will appear here.</p>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                 <Alert variant="destructive">
                    <FileQuestion className="h-4 w-4" />
                    <AlertTitle>Not Legal Advice</AlertTitle>
                    <AlertDescription>
                        The information provided is for informational purposes only and does not constitute legal advice. You should consult with a qualified legal professional for advice regarding your individual situation.
                    </AlertDescription>
                </Alert>
               <Accordion type="multiple" defaultValue={['summary', 'precedents', 'strategy']} className="w-full space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base leading-relaxed">{result.summary}</p>
                    </CardContent>
                  </Card>
                  
                  <AccordionItem value="precedents" className="border rounded-lg bg-card px-4">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Landmark className="h-5 w-5" />
                            Relevant Precedents
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 text-base">
                        {result.precedents.length > 0 ? (
                            <div className="space-y-4">
                                {result.precedents.map((p, i) => (
                                    <div key={i} className="border-b pb-4 last:border-b-0">
                                        <h4 className="font-semibold">{p.title}</h4>
                                        <p className="text-sm text-muted-foreground">{p.citation}</p>
                                        <p className="mt-2 text-sm"><strong>Relevance:</strong> {p.relevance}</p>
                                        <p className="mt-1 text-sm"><strong>Potential Outcome:</strong> {p.outcome}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-muted-foreground">No relevant precedents found.</p>}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="strategy" className="border rounded-lg bg-card px-4">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Gavel className="h-5 w-5" />
                            Case Strategy & Solutions
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 text-base">
                       <p className="whitespace-pre-wrap">{result.caseStrategy}</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="prevention" className="border rounded-lg bg-card px-4">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <ShieldQuestion className="h-5 w-5" />
                            Arrest Prevention & Rights
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 text-base">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Arrest Prevention Measures</h4>
                                <ul className="list-disc space-y-2 pl-5">
                                    {result.arrestPreventionMeasures.map((measure, i) => <li key={i}>{measure}</li>)}
                                </ul>
                            </div>
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Your Rights During an Arrest</h4>
                                <ul className="list-disc space-y-2 pl-5">
                                    {result.rightsDuringArrest.map((right, i) => <li key={i}>{right}</li>)}
                                </ul>
                            </div>
                        </div>
                    </AccordionContent>
                  </AccordionItem>

              </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
