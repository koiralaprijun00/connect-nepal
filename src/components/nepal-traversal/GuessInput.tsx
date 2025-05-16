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
  onSubmit: (guess: string) => void;
  isLoading: boolean;
}

export function GuessInput({ onSubmit, isLoading }: GuessInputProps) {
  const form = useForm<GuessFormValues>({
    resolver: zodResolver(guessSchema),
    defaultValues: { guess: "" },
  });

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Watch current input
  const currentGuessValue = form.watch("guess");

  // Extract term after last comma for filtering suggestions
  const filterTerm = useMemo(() => {
    const lastCommaIdx = currentGuessValue.lastIndexOf(",");
    return lastCommaIdx === -1
      ? currentGuessValue.trim()
      : currentGuessValue.substring(lastCommaIdx + 1).trim();
  }, [currentGuessValue]);

  // Filter districts for autocomplete suggestions
  const filteredDistricts = useMemo(() => {
    if (!filterTerm) return DISTRICTS_NEPAL;
    return DISTRICTS_NEPAL.filter((district) =>
      district.toLowerCase().includes(filterTerm.toLowerCase())
    );
  }, [filterTerm]);

  // Select district from suggestions
  function handleDistrictSelect(selectedDistrict: string) {
    const currentVal = form.getValues("guess");
    const lastCommaIndex = currentVal.lastIndexOf(",");

    let newValue;
    if (lastCommaIndex === -1) {
      newValue = selectedDistrict;
    } else {
      const before = currentVal.substring(0, lastCommaIndex + 1);
      newValue = `${before} ${selectedDistrict}`;
    }

    form.setValue("guess", newValue.trim(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Close the popover in the next event loop
    setTimeout(() => {
      setPopoverOpen(false);
      setHighlightedIndex(null);
    }, 0);

    inputRef.current?.focus();
  }

  // Submit handler
  function handleFormSubmit(data: GuessFormValues) {
    const cleanedGuess = data.guess.replace(/,\s*$/, "").trim();
    onSubmit(cleanedGuess);
    form.reset();
    setPopoverOpen(false);
    setHighlightedIndex(null);
  }

  // Keyboard navigation and shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!popoverOpen) {
      if (e.key === "Enter") {
        e.preventDefault();
        form.handleSubmit(handleFormSubmit)();
      }
      return;
    }

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
        if (highlightedIndex !== null) {
          handleDistrictSelect(filteredDistricts[highlightedIndex]);
        } else {
          // If no suggestion highlighted, submit form
          form.handleSubmit(handleFormSubmit)();
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
  };

  // Auto open/close popover based on filter term and loading state
  useEffect(() => {
    if (isLoading) {
      setPopoverOpen(false);
      setHighlightedIndex(null);
    } else if (filterTerm.trim() !== "") {
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
      setHighlightedIndex(null);
    }
  }, [filterTerm, isLoading]);

  const handleInputFocus = () => {
    // Open popover only if there is a filter term (user has typed)
    if (filterTerm.trim() !== "") {
      setPopoverOpen(true);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="guess"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="guess-input" className="text-lg">
                District Sequence
              </FormLabel>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Input
                      {...field}
                      id="guess-input"
                      placeholder="e.g., Kathmandu, Bhaktapur, Kavre"
                      type="text"
                      ref={inputRef}
                      autoComplete="off"
                      onKeyDown={handleKeyDown}
                      className="text-base"
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="p-2 w-[var(--radix-popper-anchor-width)]"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <ScrollArea className={`rounded-md border ${filteredDistricts.length > 0 ? 'max-h-[200px]' : ''}`}>
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
              <FormDescription>
                Type district names separated by commas. You can select from suggestions or type your complete
                answer directly. Use arrow keys to navigate suggestions and Enter to select or submit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full text-lg" disabled={isLoading}>
          <Send className="mr-2 h-5 w-5" />
          {isLoading ? "Submitting..." : "Submit Guess"}
        </Button>
      </form>
    </Form>
  );
}