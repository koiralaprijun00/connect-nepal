"use client";
import { Mountain, MapPin } from 'lucide-react';

interface CombinedHeaderPuzzleProps {
  startDistrict: string;
  endDistrict: string;
}

export function CombinedHeaderPuzzle({ startDistrict, endDistrict }: CombinedHeaderPuzzleProps) {
  return (
    <div className="relative overflow-hidden text-center py-4 border-b border-border mb-4 bg-gradient-to-tr from-primary/20 via-secondary/20 to-accent/20">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-secondary/10 to-accent/10 opacity-50 animate-gradient-shift"></div>
      
      {/* Content container */}
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Title section */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mountain className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            Nepal Traversal
          </h1>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">
          Discover the shortest path through the majestic districts of Nepal!
        </p>

        {/* Start and End points */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-center gap-2 bg-background/50 rounded-lg p-2 shadow-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="text-foreground">
              Start: <span className="font-medium text-primary">{startDistrict}</span>
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 bg-background/50 rounded-lg p-2 shadow-sm">
            <MapPin className="h-4 w-4 text-destructive" />
            <p className="text-foreground">
              End: <span className="font-medium text-destructive">{endDistrict}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
