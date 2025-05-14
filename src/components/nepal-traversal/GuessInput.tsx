
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
import { useState, useEffect } from "react";

const guessSchema = z.object({
  guess: z.string().min(1, { message: "Guess cannot be empty." })
    .regex(/^[a-zA-Z\s,]+$/, { message: "Only letters, spaces, and commas allowed."}),
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

  function handleDistrictSelect(selectedDistrict: string) {
    const currentGuess = form.getValues("guess");
    const newValue = currentGuess
      ? `${currentGuess.trim().replace(/,$/, '')}, ${selectedDistrict}` // Ensure no double commas
      : selectedDistrict;

    form.setValue("guess", newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    setPopoverOpen(false);
  }

  function handleFormSubmit(data: GuessFormValues) {
    onSubmit(data.guess);
    form.reset();
    setPopoverOpen(false); // Close popover on submit
  }
  
  // Close popover if form is reset externally or on successful submit
  useEffect(() => {
    if (!form.formState.isDirty && popoverOpen) {
      // setPopoverOpen(false); // This might be too aggressive if user is just clicking around
    }
  }, [form.formState.isDirty, popoverOpen]);


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
                            if(!form.formState.isSubmitting) setPopoverOpen(true)
                          }}
                          className="text-base"
                          autoComplete="off"
                        />
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="p-2" 
                      style={{ width: 'var(--radix-popover-trigger-width)' }}
                      onOpenAutoFocus={(e) => e.preventDefault()} // Prevent popover from stealing focus
                    >
                      <ScrollArea className="h-[200px] rounded-md border">
                        {DISTRICTS_NEPAL.length === 0 ? (
                          <p className="p-3 text-sm text-center text-muted-foreground">No districts available.</p>
                        ) : (
                          <div className="p-1">
                            {DISTRICTS_NEPAL.map(district => (
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
                    Type your path directly, or focus the input to select and append districts from a list.
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
