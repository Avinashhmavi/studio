
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileQuestion, Loader2 } from 'lucide-react';
import { useJurisdiction } from '@/contexts/jurisdiction-context';
import {
  generateWorkflow,
  type GenerateWorkflowOutput,
} from '@/ai/flows/generate-workflow';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { JURISDICTIONS } from '@/lib/jurisdictions';

const workflowTopics = [
  {
    id: 'small-claims',
    title: 'File a Small Claims Case',
  },
  {
    id: 'draft-will',
    title: 'Draft a Will',
  },
  {
    id: 'register-business',
    title: 'Register a Business',
  },
];

export function GuidedWorkflows() {
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateWorkflowOutput | null>(null);

  const handleGenerateWorkflow = async (topic: string) => {
    setIsLoading(true);
    setResult(null);
    setActiveTopic(topic);
    try {
      const response = await generateWorkflow({ topic, jurisdiction });
      setResult(response);
    } catch (error) {
      console.error('Workflow generation failed', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate the workflow. Please try again.',
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
            <CardTitle>Guided Legal Workflows</CardTitle>
            <CardDescription>
              Select a topic to generate a step-by-step guide for your
              jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="jurisdiction-workflow">Jurisdiction</Label>
                <Select value={jurisdiction} onValueChange={setJurisdiction} disabled={isLoading}>
                    <SelectTrigger id="jurisdiction-workflow">
                        <SelectValue placeholder="Select Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                        {JURISDICTIONS.map((j) => (
                            <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Select a workflow:
            </p>
            <div className="flex flex-col space-y-2">
              {workflowTopics.map((topic) => (
                <Button
                  key={topic.id}
                  variant={activeTopic === topic.title ? 'default' : 'outline'}
                  onClick={() => handleGenerateWorkflow(topic.title)}
                  disabled={isLoading}
                >
                  {isLoading && activeTopic === topic.title && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {topic.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>
              {result ? result.workflowTitle : 'Workflow Steps'}
            </CardTitle>
            <CardDescription>
              Follow these AI-generated steps for your legal process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Generating workflow for {jurisdiction}...
                </p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center pt-20 text-center">
                <p className="text-muted-foreground">
                  Select a workflow topic to see the steps here.
                </p>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <FileQuestion className="h-4 w-4" />
                  <AlertTitle>Not Legal Advice</AlertTitle>
                  <AlertDescription>
                    The information provided is for informational purposes only
                    and does not constitute legal advice. Consult with a
                    qualified professional.
                  </AlertDescription>
                </Alert>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-2"
                >
                  {result.steps.map((step, index) => (
                    <AccordionItem
                      value={`item-${index}`}
                      key={index}
                      className="border rounded-lg bg-card px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                          <span className="font-semibold">{step.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-4 pl-8 text-base">
                        <p className="whitespace-pre-wrap">{step.content}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
