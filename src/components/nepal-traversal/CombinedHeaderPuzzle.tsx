"use client";
import { Mountain, MapPin } from 'lucide-react';

interface CombinedHeaderPuzzleProps {
  startDistrict: string;
  endDistrict: string;
}

export function CombinedHeaderPuzzle({ startDistrict, endDistrict }: CombinedHeaderPuzzleProps) {
  return (
    <div className="relative overflow-hidden py-6 mb-6 rounded-lg w-full">
      {/* Temple-inspired background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg"></div>
      {/* Content container */}
      <div className="relative z-10 max-w-2xl px-4">
        {/* Title section with temple gradient */}
        <div className="flex items-center gap-3 mb-4">
          <Mountain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text tracking-tight">
            Nepal Traversal
          </h1>
        </div>

        {/* Description with temple theme */}
        <p className="mb-4 text-base text-muted-foreground">
          🏔️ Discover the shortest path through the majestic districts of Nepal! 🏔️
        </p>

        {/* Travel path with temple styling */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 temple-border">
          <MapPin className="h-6 w-6 text-secondary" />
          <p className="text-foreground text-lg font-medium">
            Travel from <span className="gradient-text-static text-xl font-bold">{startDistrict}</span> to <span className="gradient-text-static text-xl font-bold">{endDistrict}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
