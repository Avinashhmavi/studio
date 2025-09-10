
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Scale, User, Loader2, Paperclip, X, File as FileIcon } from 'lucide-react';
import { answerLegalQuestions } from '@/ai/flows/answer-legal-questions';
import { useToast } from '@/hooks/use-toast';
import { cn, fileToDataUri } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useJurisdiction } from '@/contexts/jurisdiction-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { JURISDICTIONS } from '@/lib/jurisdictions';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.children[0] as HTMLDivElement;
        if(viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const question = `In the jurisdiction of ${jurisdiction}, ${input}`;
      const documentDataUri = file ? await fileToDataUri(file) : undefined;
      
      console.log('Sending request:', { question, hasFile: !!file, fileName: file?.name });
      
      const result = await answerLegalQuestions({ question, documentDataUri });
      
      console.log('Received response:', result);
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: result.answer,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const userMessages = messages.filter((m) => m.id !== userMessage.id);
      setMessages(userMessages);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: `Failed to get an answer: ${errorMessage}`,
      });

    } finally {
      setIsLoading(false);
      removeFile();
    }
  };

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Legal Q&A Chatbot</CardTitle>
                    <CardDescription>Ask questions, or upload a document for context-aware answers.</CardDescription>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="jurisdiction-chat">Jurisdiction</Label>
                    <Select value={jurisdiction} onValueChange={setJurisdiction}>
                        <SelectTrigger className="w-[180px]" id="jurisdiction-chat">
                            <SelectValue placeholder="Select Jurisdiction" />
                        </SelectTrigger>
                        <SelectContent>
                            {JURISDICTIONS.map((j) => (
                                <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'flex items-start gap-3',
                                message.sender === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {message.sender === 'ai' && (
                                <Avatar className="h-9 w-9 border bg-primary text-primary-foreground">
                                    <AvatarFallback><Scale className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                    'max-w-xl rounded-lg p-3 text-sm',
                                    message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                )}
                            >
                                <p className="whitespace-pre-wrap">{message.text}</p>
                            </div>
                            {message.sender === 'user' && (
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                             <Avatar className="h-9 w-9 border bg-primary text-primary-foreground">
                                <AvatarFallback><Scale className="h-5 w-5"/></AvatarFallback>
                             </Avatar>
                             <div className="max-w-md rounded-lg p-3 bg-muted">
                                <Loader2 className="h-5 w-5 animate-spin"/>
                             </div>
                         </div>
                    )}
                </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="mt-auto space-y-2">
                {file && (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
                        <FileIcon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile} disabled={isLoading}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your document or a general legal topic..."
                        className="pr-24"
                        disabled={isLoading}
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="h-8 w-8"
                        >
                            <Paperclip className="h-4 w-4" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                </div>
            </form>
        </CardContent>
    </Card>
  );
}
