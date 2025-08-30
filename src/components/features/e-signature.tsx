'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Signature, CheckCircle } from 'lucide-react';

export function ESignature() {
  const [file, setFile] = useState<File | null>(null);
  const [signerName, setSignerName] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsSigned(false);
      setSignerName('');
    }
  };

  const handleSign = () => {
    if (!file || !signerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload a document and enter the signer\'s name.',
      });
      return;
    }

    // In a real application, this would involve a call to an e-signature service API.
    // Here, we'll just simulate the signing process.
    setIsSigned(true);
    toast({
      title: 'Document Signed',
      description: `${file.name} has been successfully signed by ${signerName}.`,
    });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>E-Signature</CardTitle>
        <CardDescription>
          Sign your documents electronically. This is a simulation and not legally binding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="document">Document to Sign</Label>
          <div className="relative">
            <Input
              id="document"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="pl-10"
              disabled={isSigned}
            />
            <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name}
            </p>
          )}
        </div>

        {file && !isSigned && (
          <div className="space-y-2">
            <Label htmlFor="signerName">Signer Full Name</Label>
            <Input
              id="signerName"
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
        )}

        {isSigned && file && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800">Document Signed!</h3>
            <p className="text-sm text-green-700 mt-1">
              {file.name} was signed by <strong>{signerName}</strong>.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {file && !isSigned && (
          <Button onClick={handleSign} disabled={!signerName.trim()}>
            <Signature className="mr-2 h-4 w-4" />
            Sign Document
          </Button>
        )}
         {isSigned && (
          <Button onClick={() => {
            setFile(null);
            setIsSigned(false);
            setSignerName('');
          }}>
            Sign Another Document
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
