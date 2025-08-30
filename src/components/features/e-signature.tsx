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
import { FileUp, Signature, CheckCircle, Loader2, Download } from 'lucide-react';
import { signDocument } from '@/ai/flows/sign-document';
import { fileToDataUri } from '@/lib/utils';

export function ESignature() {
  const [file, setFile] = useState<File | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signedContent, setSignedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSignedContent(null);
      setSignerName('');
    }
  };

  const handleSign = async () => {
    if (!file || !signerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: "Please upload a document and enter the signer's name.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const documentDataUri = await fileToDataUri(file);
      const result = await signDocument({ documentDataUri, signerName });
      
      setSignedContent(result.signedDocumentContent);
      toast({
        title: 'Document Signed',
        description: `${file.name} has been successfully signed by ${signerName}.`,
      });
    } catch (error) {
      console.error("Signing failed:", error);
      toast({
        variant: "destructive",
        title: "Signing Failed",
        description: "Something went wrong. Please try again."
      })
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!signedContent || !file) return;

    const blob = new Blob([signedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const originalName = file.name.replace(/\.[^/.]+$/, '');
    link.download = `${originalName}-signed.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const resetState = () => {
    setFile(null);
    setSignedContent(null);
    setSignerName('');
    setIsLoading(false);
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>E-Signature</CardTitle>
        <CardDescription>
          Sign your documents electronically. The AI will extract the text and append a signature block.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!signedContent ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="document">Document to Sign (.pdf, .docx, .txt, images)</Label>
              <div className="relative">
                <Input
                  id="document"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                  className="pl-10"
                  disabled={isLoading}
                />
                <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {file && (
              <div className="space-y-2">
                <Label htmlFor="signerName">Signer Full Name</Label>
                <Input
                  id="signerName"
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        ) : (
          file && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-800">Document Signed!</h3>
                <p className="text-sm text-green-700 mt-1">
                  {file.name} was signed by <strong>{signerName}</strong>.
                </p>
              </div>
               <div className="space-y-2">
                  <Label>Signed Document Preview (.txt)</Label>
                  <pre className="p-4 rounded-md bg-muted text-sm h-64 overflow-auto whitespace-pre-wrap font-mono">
                    {signedContent}
                  </pre>
               </div>
            </div>
          )
        )}

      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {!signedContent ? (
           <Button onClick={handleSign} disabled={!file || !signerName.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Signature className="mr-2 h-4 w-4" />
                Sign Document
              </>
            )}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={resetState}>Sign Another Document</Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Signed File
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
