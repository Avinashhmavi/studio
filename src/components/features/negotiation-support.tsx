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
  negotiateContract,
  type NegotiateContractOutput,
} from '@/ai/flows/ai-powered-negotiation';
import { Loader2, FileUp, Wand2 } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';

export function NegotiationSupport() {
  const [file, setFile] = useState<File | null>(null);
  const [goals, setGoals] = useState('');
  const [result, setResult] = useState<NegotiateContractOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !goals) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload a contract and describe your goals.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const contractDataUri = await fileToDataUri(file);
      const negotiationGoals = goals;
      const response = await negotiateContract({ contractDataUri, negotiationGoals });
      setResult(response);
    } catch (error) {
      console.error('Negotiation support failed:', error);
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
            <CardTitle>AI Negotiation Support</CardTitle>
            <CardDescription>
              Get AI-powered negotiation strategies for your contract.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contract">Contract Document</Label>
                 <div className="relative">
                  <Input
                    id="contract"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="pl-10"
                  />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                 {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals">Negotiation Goals</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g., 'Reduce liability, extend payment terms, clarify termination clause.'"
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !file || !goals}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Get Strategies
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
            <CardTitle>Negotiation Strategies</CardTitle>
            <CardDescription>
              AI-suggested strategies based on your contract and goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating strategies...</p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">
                  Your negotiation strategies will appear here.
                </p>
              </div>
            )}
            {result && (
              <div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.negotiationStrategies}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
