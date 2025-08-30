
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calculator, FileQuestion, CircleDollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJurisdiction } from '@/contexts/jurisdiction-context';
import { JURISDICTIONS } from '@/lib/jurisdictions';
import { estimateLegalCosts, type EstimateLegalCostsOutput } from '@/ai/flows/estimate-legal-costs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AttorneyExperience = 'Junior' | 'Senior' | 'Partner';

export function CostEstimator() {
  const [caseDescription, setCaseDescription] = useState('');
  const [attorneyExperience, setAttorneyExperience] = useState<AttorneyExperience>('Senior');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EstimateLegalCostsOutput | null>(null);
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Case Details',
        description: 'Please describe your case to get an estimate.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await estimateLegalCosts({ caseDescription, jurisdiction, attorneyExperience });
      setResult(response);
    } catch (error) {
      console.error('Cost estimation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Estimation Failed',
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
            <CardTitle>Legal Cost Estimator</CardTitle>
            <CardDescription>
              Get an AI-powered cost estimate for your legal case.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="case-description">Case Description</Label>
                <Textarea
                  id="case-description"
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  placeholder="Describe your legal matter, e.g., 'Contested divorce with child custody issues' or 'Patent filing for a new software.'"
                  rows={6}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction-estimator">Jurisdiction</Label>
                 <Select value={jurisdiction} onValueChange={setJurisdiction} disabled={isLoading}>
                    <SelectTrigger id="jurisdiction-estimator">
                        <SelectValue placeholder="Select Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                        {JURISDICTIONS.map((j) => (
                            <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attorney-experience">Attorney Experience</Label>
                 <Select value={attorneyExperience} onValueChange={(v) => setAttorneyExperience(v as AttorneyExperience)} disabled={isLoading}>
                    <SelectTrigger id="attorney-experience">
                        <SelectValue placeholder="Select Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Junior">Junior Associate</SelectItem>
                        <SelectItem value="Senior">Senior Associate</SelectItem>
                        <SelectItem value="Partner">Partner</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !caseDescription.trim()}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Estimating...</>
                ) : (
                  <><Calculator className="mr-2 h-4 w-4" /> Calculate Costs</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Cost Estimation Results</CardTitle>
            <CardDescription>
              Review the AI-generated cost estimate below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is calculating your estimate...</p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">Your cost estimate will appear here.</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <Card>
                    <CardHeader className="flex-row items-center gap-4 space-y-0">
                        <CircleDollarSign className="h-10 w-10 text-primary" />
                        <div>
                            <CardDescription>Estimated Total Cost</CardDescription>
                            <CardTitle className="text-3xl">{result.estimatedCostRange}</CardTitle>
                        </div>
                    </CardHeader>
                </Card>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Cost Breakdown</h3>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Item</TableHead>
                                    <TableHead className="text-right">Estimated Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.costBreakdown.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <p className="font-medium">{item.item}</p>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{item.cost}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Alert variant="destructive">
                    <FileQuestion className="h-4 w-4" />
                    <AlertTitle>Disclaimer</AlertTitle>
                    <AlertDescription>{result.disclaimer}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
