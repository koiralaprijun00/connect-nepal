'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { DISTRICTS_NEPAL, validateDistrictName } from "@/lib/puzzle";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Undo2 } from "lucide-react";

interface GuessInputProps {
  onSubmit: (intermediateDistricts: string[]) => void;
  onUndo?: () => void;
  isLoading: boolean;
  startDistrict: string;
  endDistrict: string;
  latestGuessResult?: { type: 'success' | 'error'; message: string } | null;
  isGameWon: boolean;
  canUndo?: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({ 
  onSubmit, 
  onUndo,
  isLoading, 
  startDistrict, 
  endDistrict, 
  latestGuessResult, 
  isGameWon,
  canUndo = false
}) => {
  const [guessDistrict, setGuessDistrict] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const justSelected = useRef(false);

  // Filter districts for autocomplete suggestions, excluding start/end
  const filteredDistricts: string[] = useMemo(() => {
    const exclude = [startDistrict, endDistrict].map(d => d.toLowerCase());
    const query = guessDistrict.trim().toLowerCase();
    
    if (!query) return [];
    
    return DISTRICTS_NEPAL.filter(
      (district: string) =>
        !exclude.includes(district.toLowerCase()) &&
        district.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8 for better UX
  }, [guessDistrict, startDistrict, endDistrict]);

  const handleDistrictSelect = useCallback((selectedDistrict: string) => {
    if (isGameWon) return;
    setGuessDistrict(selectedDistrict);
    setPopoverOpen(false);
    setHighlightedIndex(null);
    setError(null);
    justSelected.current = true;
    setTimeout(() => {
      inputRef.current?.focus();
      setTimeout(() => {
        setPopoverOpen(false);
      }, 10);
    }, 0);
  }, [isGameWon]);

  // Enhanced validation using the new validateDistrictName function
  const validateDistrict = useCallback((input: string): { isValid: boolean; normalizedName: string; error: string } => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { isValid: false, normalizedName: '', error: 'Please enter a district' };
    }

    // Check if trying to guess start or end district
    const excludedDistricts = [startDistrict, endDistrict].map(d => d.toLowerCase());
    if (excludedDistricts.includes(trimmed.toLowerCase())) {
      return { isValid: false, normalizedName: '', error: 'You cannot guess the start or end district.' };
    }

    // Use the comprehensive validation function
    const validatedName = validateDistrictName(trimmed);
    if (!validatedName) {
      return { isValid: false, normalizedName: '', error: 'Invalid district name. Try typing more letters or check spelling.' };
    }

    // Double-check it's not start/end after validation
    if (excludedDistricts.includes(validatedName.toLowerCase())) {
      return { isValid: false, normalizedName: '', error: 'You cannot guess the start or end district.' };
    }

    return { isValid: true, normalizedName: validatedName, error: '' };
  }, [startDistrict, endDistrict]);

  // Add onBlur handler for input
  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      if (!justSelected.current) {
        setPopoverOpen(false);
        setHighlightedIndex(null);
      }
      justSelected.current = false;
    }, 150); // Increased timeout to prevent premature closing
  }, []);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGameWon || isLoading) return;
    
    const validation = validateDistrict(guessDistrict);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    console.log('Submitting guess:', validation.normalizedName); // Debug log
    onSubmit([validation.normalizedName]);
    setGuessDistrict("");
    setPopoverOpen(false);
    setHighlightedIndex(null);
    setError(null);
  }, [guessDistrict, isGameWon, isLoading, validateDistrict, onSubmit]);

  // Keyboard navigation for popover
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isGameWon || isLoading) return;
    
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
          }
          // Don't submit form here - let the form submission handle it
          break;
        case "Escape":
          e.preventDefault();
          setPopoverOpen(false);
          setHighlightedIndex(null);
          break;
        default:
          break;
      }
    }
  }, [isGameWon, isLoading, popoverOpen, filteredDistricts, highlightedIndex, handleDistrictSelect]);

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

  // Clear error when input changes
  useEffect(() => {
    if (error && guessDistrict.trim()) {
      setError(null);
    }
  }, [guessDistrict, error]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-medium mb-2">District Sequence</div>
        <div className="text-sm text-muted-foreground mb-2">
          Add the district you think connects {startDistrict} to {endDistrict}. Only one district per guess.
        </div>
        
        {/* Feedback Display */}
        {latestGuessResult && (
          <div className={`mb-3 p-3 rounded-lg text-sm ${
            latestGuessResult.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {latestGuessResult.message}
          </div>
        )}
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              value={guessDistrict}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (isGameWon || isLoading) return;
                setGuessDistrict(e.target.value);
              }}
              onFocus={() => {
                if (isGameWon || isLoading) return;
                if (guessDistrict.trim() && filteredDistricts.length > 0) setPopoverOpen(true);
              }}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={
                isGameWon 
                  ? "Puzzle completed!" 
                  : isLoading 
                    ? "Processing..." 
                    : "Type a district name... (e.g., Nawalpur, Parasi)"
              }
              disabled={isLoading || isGameWon}
              className="text-base pr-12"
              autoComplete="off"
            />
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* Autocomplete dropdown */}
            {popoverOpen && filteredDistricts.length > 0 && !isGameWon && !isLoading && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48">
                <ScrollArea className="rounded-md max-h-48">
                  <div className="p-1">
                    {filteredDistricts.map((district: string, index: number) => (
                      <div
                        key={district}
                        onClick={() => handleDistrictSelect(district)}
                        className={`text-sm p-2 rounded-sm cursor-pointer transition-colors text-foreground ${
                          highlightedIndex === index
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "hover:bg-accent hover:text-accent-foreground"
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
          
          {/* Error display */}
          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {/* Helpful hints */}
          {!error && guessDistrict.trim().length > 0 && guessDistrict.trim().length < 3 && (
            <div className="text-blue-600 text-sm">
              💡 Try typing at least 3 letters for better suggestions
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 text-lg" 
              disabled={isLoading || !guessDistrict.trim() || isGameWon}
            >
              <Send className="mr-2 h-5 w-5" />
              {isLoading ? "Submitting..." : isGameWon ? "Completed!" : "Submit Guess"}
            </Button>
            
            {onUndo && canUndo && (
              <Button 
                type="button"
                variant="outline"
                onClick={onUndo}
                disabled={isLoading || isGameWon}
                className="px-4"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        
        {/* District count info */}
        <div className="mt-2 text-xs text-muted-foreground">
          Search among {DISTRICTS_NEPAL.length} districts of Nepal
        </div>
      </div>
    </div>
  );
};