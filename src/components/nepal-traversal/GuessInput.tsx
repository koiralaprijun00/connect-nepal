
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { DISTRICTS_NEPAL } from "@/lib/puzzle";
import { useState, useEffect, useMemo } from "react";

const guessSchema = z.object({
  guess: z.string().min(1, { message: "Guess cannot be empty." })
    .regex(/^[a-zA-Z\s,]+$/, { message: "Only letters, spaces, and commas allowed." }),
});

type GuessFormValues = z.infer<typeof guessSchema>;

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  isLoading: boolean;
}

export function GuessInput({ onSubmit, isLoading }: GuessInputProps) {
  const form = useForm<GuessFormValues>({
    resolver: zodResolver(guessSchema),
    defaultValues: {
      guess: "",
    },
  });

  const [popoverOpen, setPopoverOpen] = useState(false);

  const currentGuessValue = form.watch("guess");

  const filterTerm = useMemo(() => {
    const lastCommaIdx = currentGuessValue.lastIndexOf(',');
    return (lastCommaIdx === -1 
      ? currentGuessValue 
      : currentGuessValue.substring(lastCommaIdx + 1)
    ).trim();
  }, [currentGuessValue]);

  const filteredDistricts = useMemo(() => {
    if (!filterTerm) {
      return DISTRICTS_NEPAL;
    }
    return DISTRICTS_NEPAL.filter(district =>
      district.toLowerCase().includes(filterTerm.toLowerCase())
    );
  }, [filterTerm]);

  function handleDistrictSelect(selectedDistrict: string) {
    const currentVal = form.getValues("guess");
    const lastCommaIndex = currentVal.lastIndexOf(',');

    let newValue;
    if (lastCommaIndex === -1) {
      // No commas, replace the whole input
      newValue = selectedDistrict;
    } else {
      // Commas exist, replace text after the last comma
      const textBeforeLastComma = currentVal.substring(0, lastCommaIndex + 1);
      newValue = `${textBeforeLastComma.trim()} ${selectedDistrict}`; 
    }
    
    form.setValue("guess", newValue.trim(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    setPopoverOpen(false);
  }

  function handleFormSubmit(data: GuessFormValues) {
    onSubmit(data.guess);
    form.reset();
    setPopoverOpen(false);
  }
  
  useEffect(() => {
    if (!form.formState.isDirty && popoverOpen && !isLoading) {
      // If form is reset externally, consider closing popover.
      // But also don't close if user is actively interacting.
    }
  }, [form.formState.isDirty, popoverOpen, isLoading]);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Enter Your Path</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="guess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="guess-input" className="text-lg">District Sequence</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Input
                          id="guess-input"
                          placeholder="e.g., Kathmandu, Bhaktapur, Kavre"
                          {...field}
                          onFocus={() => {
                            if (field.value && field.value.trim() !== '' && !isLoading) {
                                setPopoverOpen(true);
                            }
                          }}
                          onChange={(e) => {
                            field.onChange(e); // Update form state
                            if (e.target.value.trim() !== '' && !isLoading) {
                              setPopoverOpen(true);
                            } else {
                              setPopoverOpen(false); // Close if input becomes empty
                            }
                          }}
                          className="text-base"
                          autoComplete="off"
                        />
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="p-2" 
                      style={{ width: 'var(--radix-popover-trigger-width)' }}
                      onOpenAutoFocus={(e) => e.preventDefault()} 
                    >
                      <ScrollArea className="h-[200px] rounded-md border">
                        {filteredDistricts.length === 0 ? (
                          <p className="p-3 text-sm text-center text-muted-foreground">No matching districts.</p>
                        ) : (
                          <div className="p-1">
                            {filteredDistricts.map(district => (
                              <div
                                key={district}
                                onClick={() => handleDistrictSelect(district)}
                                className="text-sm p-2 rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
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
                    Type your path. A list of matching districts will appear to help you select.
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
      </CardContent>
    </Card>
  );
}
