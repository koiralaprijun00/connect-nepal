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
          Discover the shortest path through the majestic districts of Nepal!
        </p>

        {/* Travel path with new styling */}
        <div className="inline-flex items-center gap-3 rounded-lg">
          <span className="flex items-center justify-center">
            <MapPin className="h-4 w-4 text-sexondary" />
          </span>
          <span className="text-foreground text-md font-medium">Travel from</span>
          <span className="px-6 py-1 rounded-md text-2xl font-semibold text-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500">
            {startDistrict.charAt(0).toUpperCase() + startDistrict.slice(1)}
          </span>
          <span className="text-3xl text-secondary mx-1">&#8594;</span>
          <span className="px-6 py-1 rounded-md text-2xl font-semibold text-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500">
            {endDistrict.charAt(0).toUpperCase() + endDistrict.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
