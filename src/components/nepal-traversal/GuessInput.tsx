import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DISTRICTS_NEPAL } from "@/lib/puzzle";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { flushSync } from "react-dom";

const guessSchema = z.object({
  guess: z
    .string()
    .min(1, { message: "Guess cannot be empty." })
    .regex(/^[a-zA-Z\s,']+$/, {
      message: "Only letters, spaces, commas, and apostrophes allowed.",
    }),
});

type GuessFormValues = z.infer<typeof guessSchema>;

interface GuessInputProps {
  onSubmit: (intermediateDistricts: string[]) => void;
  isLoading: boolean;
  startDistrict: string;
  endDistrict: string;
  latestGuessResult?: { type: 'success' | 'error'; message: string } | null;
}

export function GuessInput({ onSubmit, isLoading, startDistrict, endDistrict, latestGuessResult }: GuessInputProps) {
  const [intermediateDistricts, setIntermediateDistricts] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter districts for autocomplete suggestions, excluding already selected and start/end
  const filteredDistricts = useMemo(() => {
    const exclude = [startDistrict, endDistrict, ...intermediateDistricts].map(d => d.toLowerCase());
    return DISTRICTS_NEPAL.filter(
      (district) =>
        !exclude.includes(district.toLowerCase()) &&
        district.toLowerCase().includes(inputValue.trim().toLowerCase())
    );
  }, [inputValue, intermediateDistricts, startDistrict, endDistrict]);

  function handleDistrictSelect(selectedDistrict: string) {
    setIntermediateDistricts((prev) => [...prev, selectedDistrict]);
    setInputValue("");
    setPopoverOpen(false);
    setHighlightedIndex(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleRemoveDistrict(index: number) {
    setIntermediateDistricts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(intermediateDistricts);
    setIntermediateDistricts([]);
    setInputValue("");
    setPopoverOpen(false);
    setHighlightedIndex(null);
  }

  // Keyboard navigation for popover
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (popoverOpen && filteredDistricts.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((old) =>
            old === null || old === filteredDistricts.length - 1 ? 0 : old + 1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((old) =>
            old === null || old === 0 ? filteredDistricts.length - 1 : old - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex !== null && filteredDistricts[highlightedIndex]) {
            handleDistrictSelect(filteredDistricts[highlightedIndex]);
          } else if (inputValue.trim() && filteredDistricts.length > 0) {
            handleDistrictSelect(filteredDistricts[0]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setPopoverOpen(false);
          setHighlightedIndex(null);
          break;
        default:
          break;
      }
    } else if (e.key === "Enter" && inputValue.trim() === "") {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  // Open popover when input is focused or typing and there are suggestions
  useEffect(() => {
    if (isLoading) {
      setPopoverOpen(false);
      setHighlightedIndex(null);
      return;
    }
    if (document.activeElement === inputRef.current && inputValue.trim() && filteredDistricts.length > 0) {
      setPopoverOpen(true);
    } else if (!inputValue.trim()) {
      setPopoverOpen(false);
      setHighlightedIndex(null);
    }
  }, [inputValue, isLoading, filteredDistricts.length]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <div className="text-lg font-medium mb-2">District Sequence</div>
        {/* Chips for selected intermediate districts */}
        {intermediateDistricts.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-2 overflow-x-auto">
            {intermediateDistricts.map((district, idx) => (
              <span key={district + idx} className="flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                {district}
                <button
                  type="button"
                  className="ml-1 text-xs text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveDistrict(idx)}
                  aria-label={`Remove ${district}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onFocus={() => {
                if (inputValue.trim() && filteredDistricts.length > 0) setPopoverOpen(true);
              }}
              onBlur={() => setTimeout(() => setPopoverOpen(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="Type a district and press Enter or select"
              disabled={isLoading}
              className="text-base"
              autoComplete="off"
            />
          </PopoverTrigger>
          <PopoverContent className="p-2 w-[var(--radix-popper-anchor-width)] max-h-60 overflow-y-auto" onOpenAutoFocus={e => e.preventDefault()}>
            <ScrollArea className="rounded-md border max-h-52 overflow-y-auto">
              {filteredDistricts.length === 0 ? (
                <p className="p-3 text-sm text-center text-muted-foreground">
                  No matching districts.
                </p>
              ) : (
                <div className="p-1">
                  {filteredDistricts.map((district, index) => (
                    <div
                      key={district}
                      onClick={() => handleDistrictSelect(district)}
                      className={`text-sm p-2 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        highlightedIndex === index ? "bg-accent text-accent-foreground" : ""
                      }`}
                    >
                      {district}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      <Button type="submit" className="w-full text-lg" disabled={isLoading || intermediateDistricts.length === 0}>
        <Send className="mr-2 h-5 w-5" />
        {isLoading ? "Submitting..." : "Submit Guess"}
      </Button>
      {latestGuessResult && (
        <div
          className={`mt-4 p-4 rounded-lg border shadow-sm text-base font-medium ${
            latestGuessResult.type === 'success'
              ? 'bg-green-100 border-green-400 text-green-800'
              : 'bg-red-100 border-red-400 text-red-800'
          }`}
        >
          {latestGuessResult.message}
        </div>
      )}
    </form>
  );
}