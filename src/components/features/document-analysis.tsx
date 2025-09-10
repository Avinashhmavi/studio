
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
import { Loader2, FileUp, CheckCircle, AlertTriangle, ShieldCheck, FileWarning, BadgeCheck } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MultiSelect } from '@/components/ui/multi-select';

const PREDEFINED_REGULATIONS = [
  { value: 'GDPR', label: 'GDPR' },
  { value: 'HIPAA', label: 'HIPAA' },
  { value: 'CCPA', label: 'CCPA' },
  { value: 'SOX', label: 'Sarbanes-Oxley (SOX)'},
  { value: 'FERPA', label: 'FERPA'},
];


export function DocumentAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [regulations, setRegulations] = useState<string[]>([]);
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
      const result = await analyzeLegalDocument({ documentDataUri, regulations: regulations });
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

  const getRiskBadgeVariant = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'Low':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'High':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Analyze Document</CardTitle>
            <CardDescription>
              Upload a document for risk analysis and compliance checks.
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

               <div className="space-y-2">
                <Label htmlFor="regulations">Compliance Check (optional)</Label>
                <MultiSelect
                  options={PREDEFINED_REGULATIONS}
                  selected={regulations}
                  onChange={setRegulations}
                  placeholder="Select or type regulations..."
                  disabled={isLoading}
                  creatable
                />
                <p className="text-xs text-muted-foreground">
                    Select from the list or type to add a custom regulation.
                </p>
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
              <Accordion type="multiple" defaultValue={['summary', 'clauses', 'risks', 'compliance', 'key-terms']} className="w-full space-y-4">
                <AccordionItem value="summary" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Summary</AccordionTrigger>
                  <AccordionContent className="pt-2 text-base leading-relaxed">
                    {analysis.summary}
                  </AccordionContent>
                </AccordionItem>
                
                 {analysis.clauseAnalysis && analysis.clauseAnalysis.length > 0 && (
                 <AccordionItem value="clauses" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Clause & Risk Detection</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-4">
                      {analysis.clauseAnalysis.map((item, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                                {item.isPresent ? (
                                    <FileWarning className="h-5 w-5 text-yellow-600" />
                                ) : (
                                    <BadgeCheck className="h-5 w-5 text-green-600" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-semibold">{item.clauseType}</h4>
                                    {item.isPresent ? (
                                      <Badge variant={getRiskBadgeVariant(item.riskLevel)}>{item.riskLevel} Risk</Badge>
                                    ) : (
                                      <Badge variant="outline">Not Detected</Badge>
                                    )}
                                </div>
                                {item.isPresent && (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">Why it matters:</span> {item.explanation}
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                 <AccordionItem value="risks" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">General Potential Risks</AccordionTrigger>
                  <AccordionContent className="pt-2">
                     <div className="space-y-4">
                      {analysis.potentialRisks.map((riskItem, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <h4 className="font-semibold">{riskItem.risk}</h4>
                             </div>
                             <Badge variant={getRiskBadgeVariant(riskItem.severity)}>{riskItem.severity} Risk</Badge>
                           </div>
                           <p className="text-sm text-muted-foreground pl-7">{riskItem.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {analysis.complianceAnalysis && analysis.complianceAnalysis.length > 0 && (
                 <AccordionItem value="compliance" className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">Compliance Analysis</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-4">
                      {analysis.complianceAnalysis.map((item, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className={cn("h-5 w-5", item.isCompliant ? "text-green-600" : "text-destructive")} />
                            <h4 className="font-semibold">{item.regulation}</h4>
                            <Badge variant={item.isCompliant ? 'default' : 'destructive'}>
                              {item.isCompliant ? 'Compliant' : 'Not Compliant'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground pl-7">{item.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                )}

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

              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
