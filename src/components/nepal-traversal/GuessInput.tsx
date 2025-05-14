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
import { Send } from "lucide-react";

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

  function handleFormSubmit(data: GuessFormValues) {
    onSubmit(data.guess);
    form.reset();
  }

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
                  <FormControl>
                    <Input 
                      id="guess-input"
                      placeholder="e.g., Kathmandu, Bhaktapur, Kavre" 
                      {...field} 
                      className="text-base"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter districts separated by commas.
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
