
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>
          Get help with LegAI or provide feedback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Contact Us</h3>
          <p className="text-muted-foreground">
            For support inquiries, please email us at{' '}
            <a href="mailto:support@legai.com" className="text-primary hover:underline">
              support@legai.com
            </a>
            .
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Frequently Asked Questions</h3>
          <p className="text-muted-foreground">
            Check our FAQ section for answers to common questions.
          </p>
          <Button variant="outline" className="mt-2" asChild>
            <Link href="#">View FAQ</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
