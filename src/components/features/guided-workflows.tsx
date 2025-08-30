'use client';

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
import { CheckCircle } from 'lucide-react';

const smallClaimsSteps = [
  {
    title: 'Step 1: Determine If Your Case Qualifies',
    content:
      "Check your local court's monetary limits for small claims (e.g., up to $10,000 in California). Your claim must be for money; you can't sue to make someone do something. Common cases include security deposit disputes, property damage, or unpaid debts.",
  },
  {
    title: 'Step 2: Identify the Correct Defendant and Court',
    content:
      "You must sue the right person or business. Use their full legal name. The case should be filed in the court of the county where the defendant lives or where the incident happened. Check the court's website for specific rules.",
  },
  {
    title: 'Step 3: Fill Out the "Plaintiff\'s Claim" Form',
    content:
      'Obtain the official form (e.g., Form SC-100 in California) from the court\'s website or clerk\'s office. Clearly state why you are suing and how much money you are demanding. Be concise and factual.',
  },
  {
    title: 'Step 4: File Your Claim and Pay the Fee',
    content:
      'File the completed form with the court clerk. You will need to pay a filing fee, which varies by jurisdiction. If you cannot afford the fee, you can apply for a fee waiver.',
  },
  {
    title: 'Step 5: Serve the Defendant',
    content:
      'You must formally notify the defendant that they are being sued. This is called "service of process." You cannot do this yourself. It must be done by a sheriff, a professional process server, or another adult who is not a party to the case. Proof of service must be filed with the court.',
  },
  {
    title: 'Step 6: Prepare for Your Court Hearing',
    content:
      'Gather all your evidence, such as contracts, receipts, photos, and emails. Organize your thoughts and be prepared to explain your case to the judge clearly. You can also bring witnesses.',
  },
  {
    title: 'Step 7: Attend the Court Hearing',
    content:
      'Arrive on time and dress appropriately. The judge will listen to both sides. Present your case calmly and stick to the facts. The judge may make a decision at the hearing or mail it to you later.',
  },
];

export function GuidedWorkflows() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Guided Legal Workflows</CardTitle>
        <CardDescription>
          Step-by-step guidance for common legal processes. This is not legal
          advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">
          How to File a Small Claims Case
        </h3>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {smallClaimsSteps.map((step, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-card px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-semibold">{step.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-4 pl-8 text-base">
                {step.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
