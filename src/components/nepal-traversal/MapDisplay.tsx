"use client";
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";

interface MapDisplayProps {
  guessedPath: string[]; // Will be used later for highlighting
  correctPath: string[]; // Will be used later for highlighting
}

export function MapDisplay({ guessedPath, correctPath }: MapDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardContent className="flex justify-center items-center p-2 aspect-[4/3] relative">
        <Image 
          src="https://placehold.co/600x450.png" 
          alt="Map of Nepal with districts" 
          data-ai-hint="Nepal map districts"
          width={600}
          height={450}
          className="rounded-md object-contain"
          priority
        />
        {/* Future: SVG overlay for paths and districts */}
      </CardContent>
    </Card>
  );
}
