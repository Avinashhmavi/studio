
'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, AlertTriangle, FileQuestion, PieChart } from 'lucide-react';
import { detectJunkFees, type DetectJunkFeesOutput } from '@/ai/flows/detect-junk-fees';
import { fileToDataUri } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJurisdiction } from '@/contexts/jurisdiction-context';
import { JURISDICTIONS } from '@/lib/jurisdictions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, Cell, ResponsiveContainer, PieChart as RechartsPieChart } from "recharts"

export function JunkFeeDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [baseRent, setBaseRent] = useState('');
  const [result, setResult] = useState<DetectJunkFeesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { jurisdiction, setJurisdiction } = useJurisdiction();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !baseRent) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload a lease and enter the base rent.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const leaseDocumentDataUri = await fileToDataUri(file);
      const rentAmount = parseFloat(baseRent);
      if (isNaN(rentAmount)) {
        toast({ variant: 'destructive', title: 'Invalid Rent', description: 'Please enter a valid number for the base rent.' });
        setIsLoading(false);
        return;
      }
      const response = await detectJunkFees({ leaseDocumentDataUri, baseRent: rentAmount, jurisdiction });
      setResult(response);
    } catch (error) {
      console.error('Junk fee detection failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const chartData = result ? [
    { name: 'Base Rent', value: parseFloat(baseRent), fill: 'hsl(var(--chart-1))' },
    { name: 'Junk Fees', value: result.identifiedFees.reduce((acc, fee) => acc + fee.amount, 0), fill: 'hsl(var(--chart-2))' }
  ] : [];

  const chartConfig = {
      rent: {
        label: "Base Rent",
        color: "hsl(var(--chart-1))",
      },
      fees: {
        label: "Junk Fees",
        color: "hsl(var(--chart-2))",
      },
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Junk Fee Detector</CardTitle>
            <CardDescription>
              Analyze your rental lease for hidden fees based on your jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="baseRent">Advertised Base Rent ($)</Label>
                <Input
                  id="baseRent"
                  type="number"
                  value={baseRent}
                  onChange={(e) => setBaseRent(e.target.value)}
                  placeholder="e.g., 2000"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction-junk-fee">Jurisdiction</Label>
                 <Select value={jurisdiction} onValueChange={setJurisdiction} disabled={isLoading}>
                    <SelectTrigger id="jurisdiction-junk-fee">
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
                <Label htmlFor="lease">Lease Document</Label>
                <div className="relative">
                  <Input
                    id="lease"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="pl-10"
                  />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                 {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !file || !baseRent}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze for Junk Fees'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Analysis Report for {jurisdiction}</CardTitle>
            <CardDescription>
              A breakdown of the true cost of your lease.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is analyzing your lease...</p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">
                  Your junk fee analysis will appear here.
                </p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <Alert variant="destructive">
                  <FileQuestion className="h-4 w-4" />
                  <AlertTitle>For Informational Purposes Only</AlertTitle>
                  <AlertDescription>
                    This is an AI-generated analysis and does not constitute legal advice. Review your lease carefully.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Advertised Base Rent</CardDescription>
                            <CardTitle className="text-4xl">{formatCurrency(parseFloat(baseRent))}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">per month</div>
                        </CardContent>
                    </Card>
                    <Card className="border-primary bg-primary/5">
                        <CardHeader className="pb-2">
                            <CardDescription>True Monthly Cost</CardDescription>
                            <CardTitle className="text-4xl">{formatCurrency(result.trueTotalMonthlyCost)}</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <div className="text-xs text-muted-foreground">including all mandatory fees</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Cost Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] w-full">
                        <ChartContainer config={chartConfig}>
                            <RechartsPieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value, name) => `${name}: ${formatCurrency(value as number)}`} />} />
                                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </RechartsPieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Identified Additional Fees
                    </h3>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fee Name</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.identifiedFees.length > 0 ? result.identifiedFees.map((fee, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <p className="font-medium">{fee.feeName}</p>
                                        <p className="text-xs text-muted-foreground">{fee.description}</p>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(fee.amount)} / month</TableCell>
                                </TableRow>
                                )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No obvious junk fees were detected.</TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
