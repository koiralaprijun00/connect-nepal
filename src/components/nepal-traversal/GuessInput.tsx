'use client';

import React, { useState, useRef, useEffect, useMemo } from "react";
import { DISTRICTS_NEPAL } from "@/lib/puzzle";

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
  isGameWon: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onSubmit, isLoading, startDistrict, endDistrict, latestGuessResult, isGameWon }) => {
  const [guessDistrict, setGuessDistrict] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const justSelected = useRef(false);

  // Filter districts for autocomplete suggestions, excluding start/end
  const filteredDistricts: string[] = useMemo(() => {
    const exclude = [startDistrict, endDistrict].map(d => d.toLowerCase());
    return DISTRICTS_NEPAL.filter(
      (district: string) =>
        !exclude.includes(district.toLowerCase()) &&
        district.toLowerCase().includes(guessDistrict.trim().toLowerCase())
    );
  }, [guessDistrict, startDistrict, endDistrict]);

  function handleDistrictSelect(selectedDistrict: string) {
    if (isGameWon) return;
    setGuessDistrict(selectedDistrict);
    setPopoverOpen(false);
    setHighlightedIndex(null);
    setError(null);
    justSelected.current = true;
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isGameWon) return;
    if (!guessDistrict.trim()) {
      setError('Please enter a district');
      return;
    }
    onSubmit([guessDistrict.trim()]);
    setGuessDistrict("");
    setPopoverOpen(false);
    setHighlightedIndex(null);
    setError(null);
  }

  function handleInputEnter() {
    if (isGameWon) return;
    const input = guessDistrict.trim();
    if (!input) return;
    // Check if input matches a valid district (not start/end)
    const match = DISTRICTS_NEPAL.find(
      (d: string) => d.toLowerCase() === input.toLowerCase() &&
      ![startDistrict, endDistrict].map(x => x.toLowerCase()).includes(d.toLowerCase())
    );
    if (match) {
      setGuessDistrict(match);
      setPopoverOpen(false);
      setHighlightedIndex(null);
      setError(null);
    } else {
      setError('Unknown district');
    }
  }

  // Keyboard navigation for popover
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isGameWon) return;
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
          } else if (guessDistrict.trim()) {
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
    } else if (e.key === "Enter" && guessDistrict.trim()) {
      e.preventDefault();
      handleInputEnter();
    } else if (e.key === "Enter" && guessDistrict.trim() === "") {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  // Control popover state based on input value
  useEffect(() => {
    if (isLoading || isGameWon) {
      setPopoverOpen(false);
      setHighlightedIndex(null);
      return;
    }
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    // Only open popover when input has content and there are suggestions
    if (guessDistrict.trim() && filteredDistricts.length > 0 && document.activeElement === inputRef.current) {
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
      setHighlightedIndex(null);
    }
  }, [guessDistrict, isLoading, filteredDistricts.length, isGameWon]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <div className="text-lg font-medium mb-2">District Sequence</div>
        <div className="text-sm text-muted-foreground mb-2">Add the next district you think connects the start and end. Only one district per guess.</div>
        <div className="relative">
          <Input
            ref={inputRef}
            value={guessDistrict}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (isGameWon) return;
              setGuessDistrict(e.target.value);
              setError(null);
            }}
            onFocus={() => {
              if (isGameWon) return;
              if (guessDistrict.trim() && filteredDistricts.length > 0) setPopoverOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isGameWon ? "Puzzle completed!" : "Type a district and press Enter or select"}
            disabled={isLoading || isGameWon}
            className="text-base"
            autoComplete="off"
          />
          {popoverOpen && filteredDistricts.length > 0 && !isGameWon && (
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
      <Button 
        type="submit" 
        className="w-full text-lg" 
        disabled={isLoading || !guessDistrict.trim() || isGameWon}
      >
        <Send className="mr-2 h-5 w-5" />
        {isLoading ? "Submitting..." : isGameWon ? "Puzzle Completed!" : "Submit Guess"}
      </Button>
    </form>
  );
};