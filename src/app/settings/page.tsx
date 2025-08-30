
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJurisdiction } from '@/contexts/jurisdiction-context';
import { JURISDICTIONS } from '@/lib/jurisdictions';

export default function SettingsPage() {
    const { jurisdiction, setJurisdiction } = useJurisdiction();

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                    <Select value={jurisdiction} onValueChange={setJurisdiction}>
                        <SelectTrigger className="w-[280px]" id="jurisdiction">
                            <SelectValue placeholder="Select Jurisdiction" />
                        </SelectTrigger>
                        <SelectContent>
                            {JURISDICTIONS.map((j) => (
                                <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        This setting determines the legal jurisdiction for AI-powered features.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
