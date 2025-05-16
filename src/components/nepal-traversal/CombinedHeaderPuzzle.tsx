"use client";
import { Mountain, MapPin } from 'lucide-react';

interface CombinedHeaderPuzzleProps {
  startDistrict: string;
  endDistrict: string;
}

export function CombinedHeaderPuzzle({ startDistrict, endDistrict }: CombinedHeaderPuzzleProps) {
  return (
    <div className="relative overflow-hidden py-4 mb-4">
      {/* Animated gradient overlay */}
      <div className="absolute"></div>
      
      {/* Content container */}
      <div className="relative z-10 max-w-2xl">
        {/* Title section */}
        <div className="flex items-start justify-start gap-2 mb-2">
          <Mountain className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            Nepal Traversal
          </h1>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">
          Discover the shortest path through the majestic districts of Nepal!
        </p>

        {/* Travel path */}
        <div className="flex items-center justify-start gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <p className="text-foreground text-base">
            Travel from <span className="font-medium text-primary text-lg">{startDistrict}</span> to <span className="font-medium text-destructive text-lg">{endDistrict}</span> district
          </p>
        </div>
      </div>
    </div>
  );
}
