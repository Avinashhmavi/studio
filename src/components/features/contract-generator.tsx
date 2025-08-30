'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { generateContract, type GenerateContractOutput } from '@/ai/flows/generate-contract';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ContractGenerator() {
  const [contractType, setContractType] = useState('nda');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateContractOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Details',
        description: 'Please provide the details for your contract.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await generateContract({ contractType, details });
      setResult(response);
    } catch (error) {
      console.error('Contract generation failed:', error);
       toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
        setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (!result?.contractText) return;
    navigator.clipboard.writeText(result.contractText);
    toast({
      title: 'Copied to Clipboard',
      description: 'The generated contract has been copied.',
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>AI Contract Generator</CardTitle>
                    <CardDescription>
                    Describe your contract needs and let AI draft it for you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="contract-type">Contract Type</Label>
                            <Select
                                value={contractType}
                                onValueChange={(value) => setContractType(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="contract-type">
                                <SelectValue placeholder="Select a document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nda">Non-Disclosure Agreement (NDA)</SelectItem>
                                    <SelectItem value="lease">Residential Lease Agreement</SelectItem>
                                    <SelectItem value="service">Service Agreement</SelectItem>
                                    <SelectItem value="employment">Employment Agreement</SelectItem>
                                    <SelectItem value="custom">Other (Specify in details)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="details">Contract Details</Label>
                            <Textarea
                                id="details"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="e.g., 'An NDA between two companies, Acme Inc. and Beta Corp, for the purpose of discussing a potential partnership. The confidential information is related to a new software project.'"
                                rows={8}
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !details.trim()}>
                            {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                            ) : (
                            <><Wand2 className="mr-2 h-4 w-4" /> Generate Contract</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
             <Card className="min-h-[400px]">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Generated Contract</CardTitle>
                        <CardDescription>
                            Review the AI-generated contract below.
                        </CardDescription>
                    </div>
                     {result && (
                        <Button variant="outline" onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Contract
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                     {isLoading && (
                        <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-muted-foreground">AI is drafting your contract...</p>
                        </div>
                    )}
                    {!isLoading && !result && (
                        <div className="flex items-center justify-center pt-20 text-center">
                            <p className="text-muted-foreground">Your generated contract will appear here.</p>
                        </div>
                    )}
                    {result && (
                       <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                         <div
                            className="whitespace-pre-wrap font-mono text-xs"
                            aria-label="Generated Contract"
                         >
                            {result.contractText}
                         </div>
                       </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
