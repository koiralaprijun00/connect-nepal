'use client';

import React, { useState, useRef, useEffect, useMemo } from "react";
import { DISTRICTS_NEPAL } from "@/lib/puzzle";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface GuessInputProps {
  onSubmit: (intermediateDistricts: string[]) => void;
  isLoading: boolean;
  startDistrict: string;
  endDistrict: string;
  latestGuessResult?: { type: 'success' | 'error'; message: string } | null;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onSubmit, isLoading, startDistrict, endDistrict, latestGuessResult }) => {
  const [intermediateDistricts, setIntermediateDistricts] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter districts for autocomplete suggestions, excluding already selected and start/end
  const filteredDistricts: string[] = useMemo(() => {
    const exclude = [startDistrict, endDistrict, ...intermediateDistricts].map(d => d.toLowerCase());
    return DISTRICTS_NEPAL.filter(
      (district: string) =>
        !exclude.includes(district.toLowerCase()) &&
        district.toLowerCase().includes(inputValue.trim().toLowerCase())
    );
  }, [inputValue, intermediateDistricts, startDistrict, endDistrict]);

  function handleDistrictSelect(selectedDistrict: string) {
    setIntermediateDistricts((prev: string[]) => [...prev, selectedDistrict]);
    setInputValue("");
    setPopoverOpen(false);
    setHighlightedIndex(null);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleRemoveDistrict(index: number) {
    setIntermediateDistricts((prev: string[]) => prev.filter((_, i) => i !== index));
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(intermediateDistricts);
    setIntermediateDistricts([]);
    setInputValue("");
    setPopoverOpen(false);
    setHighlightedIndex(null);
  }

  function handleInputEnter() {
    const input = inputValue.trim();
    if (!input) return;
    // Check if input matches a valid, not-already-selected district
    const match = DISTRICTS_NEPAL.find(
      (d: string) => d.toLowerCase() === input.toLowerCase() &&
      ![startDistrict, endDistrict, ...intermediateDistricts].map(x => x.toLowerCase()).includes(d.toLowerCase())
    );
    if (match) {
      handleDistrictSelect(match);
    } else {
      setError('Unknown district');
    }
  }

  // Keyboard navigation for popover
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (popoverOpen && filteredDistricts.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((old: number | null) =>
            old === null || old === filteredDistricts.length - 1 ? 0 : old + 1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((old: number | null) =>
            old === null || old === 0 ? filteredDistricts.length - 1 : old - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex !== null && filteredDistricts[highlightedIndex]) {
            handleDistrictSelect(filteredDistricts[highlightedIndex]);
          } else if (inputValue.trim()) {
            handleInputEnter();
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
    } else if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleInputEnter();
    } else if (e.key === "Enter" && inputValue.trim() === "") {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  // Control popover state based on input value
  useEffect(() => {
    if (isLoading) {
      setPopoverOpen(false);
      setHighlightedIndex(null);
      return;
    }
    // Only open popover when input has content and there are suggestions
    if (inputValue.trim() && filteredDistricts.length > 0 && document.activeElement === inputRef.current) {
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
        <div className="text-sm text-muted-foreground mb-2">Add the districts you think connect the start and end. Only include the districts in between.</div>
        {/* Chips for selected intermediate districts */}
        {intermediateDistricts.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-2 overflow-x-auto">
            {intermediateDistricts.map((district: string, idx: number) => (
              <span key={district + idx} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {district}
                <button
                  type="button"
                  className="ml-1.5 -mr-0.5 h-4 w-4 rounded-full bg-blue-200 text-blue-700 inline-flex items-center justify-center"
                  onClick={() => handleRemoveDistrict(idx)}
                  aria-label={`Remove ${district}`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onFocus={() => {
              if (inputValue.trim() && filteredDistricts.length > 0) setPopoverOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a district and press Enter or select"
            disabled={isLoading}
            className="text-base"
            autoComplete="off"
          />
          {popoverOpen && filteredDistricts.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border">
              <ScrollArea className="rounded-md max-h-52 overflow-y-auto">
                <div className="p-1">
                  {filteredDistricts.map((district: string, index: number) => (
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
              </ScrollArea>
            </div>
          )}
        </div>
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
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
};