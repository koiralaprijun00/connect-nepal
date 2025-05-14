
"use client";
import { Mountain, MapPin } from 'lucide-react';

interface CombinedHeaderPuzzleProps {
  startDistrict: string;
  endDistrict: string;
}

export function CombinedHeaderPuzzle({ startDistrict, endDistrict }: CombinedHeaderPuzzleProps) {
  return (
    <div className="text-center py-3 border-b border-border mb-4">
      <div className="flex items-center justify-center gap-1 mb-1">
        <Mountain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold text-primary tracking-tight">Nepal Traversal</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        Discover the shortest path through the majestic districts of Nepal!
      </p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4 text-secondary" />
          <p>
            Start: <span className="font-medium text-accent">{startDistrict}</span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4 text-secondary" />
          <p>
            End: <span className="font-medium text-accent">{endDistrict}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
