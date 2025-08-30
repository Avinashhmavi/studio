import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-semibold text-primary group-data-[collapsible=icon]:justify-center',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Scale className="h-5 w-5" />
      </div>
      <span className="truncate group-data-[collapsible=icon]:hidden">
        LegAI
      </span>
    </div>
  );
}
