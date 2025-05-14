"use client";
import { Mountain } from 'lucide-react';

export function HeaderComponent() {
  return (
    <header className="text-center py-6 border-b border-border">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Mountain className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary tracking-tight">Nepal Traversal</h1>
      </div>
      <p className="text-lg text-muted-foreground">Discover the shortest path through the majestic districts of Nepal!</p>
    </header>
  );
}
