
'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
  } from '@/components/ui/command';
  

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  creatable?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = 'Select an option',
  disabled,
  creatable = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
  };

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue && creatable) {
        e.preventDefault();
        const newOption = inputValue.trim();
        if (newOption && !selected.includes(newOption) && !options.some(o => o.value === newOption)) {
           handleSelect(newOption);
           setInputValue('');
        }
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-auto min-h-10', className)}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
              selected.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(value);
                  }}
                >
                  {value}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command onKeyDown={handleKeyDown}>
           <CommandInput 
                placeholder={creatable ? "Select or create..." : "Search..."}
                value={inputValue}
                onValueChange={setInputValue}
            />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    handleSelect(option.value);
                    setOpen(false);
                  }}
                  className={selected.includes(option.value) ? 'opacity-50 cursor-not-allowed' : ''}
                  disabled={selected.includes(option.value)}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {creatable && inputValue && !options.some(o => o.value.toLowerCase() === inputValue.toLowerCase()) && (
                <>
                    <CommandSeparator />
                    <CommandGroup>
                        <CommandItem onSelect={() => {
                            handleSelect(inputValue.trim());
                            setInputValue('');
                            setOpen(false);
                        }}>
                           Create "{inputValue.trim()}"
                        </CommandItem>
                    </CommandGroup>
                </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
