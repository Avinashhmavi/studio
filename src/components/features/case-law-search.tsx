
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Search, BookText, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJurisdiction } from '@/contexts/jurisdiction-context';
import { JURISDICTIONS } from '@/lib/jurisdictions';
import { searchCaseLaw, type SearchCaseLawOutput } from '@/ai/flows/search-case-law';

export function CaseLawSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchCaseLawOutput | null>(null);
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Query',
        description: 'Please enter a topic to search for.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await searchCaseLaw({ query, jurisdiction });
      setResult(response);
    } catch (error) {
      console.error('Case law search failed:', error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
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
            <CardTitle>Case Law & Statute Search</CardTitle>
            <CardDescription>
              Find relevant legal information using AI-powered search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="query">Search Topic</Label>
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'wrongful termination statute of limitations'"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction-search">Jurisdiction</Label>
                 <Select value={jurisdiction} onValueChange={setJurisdiction} disabled={isLoading}>
                    <SelectTrigger id="jurisdiction-search">
                        <SelectValue placeholder="Select Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                        {JURISDICTIONS.map((j) => (
                            <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" /> Search</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Research Results</CardTitle>
            <CardDescription>
              Review the AI-generated research findings below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is conducting research...</p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">Your research results will appear here.</p>
              </div>
            )}
            {result && (
               <Accordion type="multiple" defaultValue={['summary', 'cases', 'statutes']} className="w-full space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base leading-relaxed">{result.summary}</p>
                    </CardContent>
                  </Card>
                  
                  <AccordionItem value="cases" className="border rounded-lg bg-card px-4">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Landmark className="h-5 w-5" />
                            Relevant Case Law
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 text-base">
                        {result.caseLaw.length > 0 ? (
                            <div className="space-y-4">
                                {result.caseLaw.map((c, i) => (
                                    <div key={i} className="border-b pb-4 last:border-b-0">
                                        <h4 className="font-semibold">{c.title}</h4>
                                        <p className="text-sm text-muted-foreground">{c.citation}</p>
                                        <p className="mt-2">{c.summary}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-muted-foreground">No relevant case law found.</p>}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="statutes" className="border rounded-lg bg-card px-4">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <BookText className="h-5 w-5" />
                            Relevant Statutes & Regulations
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 text-base">
                        {result.statutes.length > 0 ? (
                            <div className="space-y-4">
                                {result.statutes.map((s, i) => (
                                    <div key={i} className="border-b pb-4 last:border-b-0">
                                        <h4 className="font-semibold">{s.title}</h4>
                                        <p className="text-sm text-muted-foreground">{s.code}</p>
                                        <p className="mt-2">{s.summary}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-muted-foreground">No relevant statutes found.</p>}
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
