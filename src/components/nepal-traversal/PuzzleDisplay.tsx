"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PuzzleDisplayProps {
  startDistrict: string;
  endDistrict: string;
}

export function PuzzleDisplay({ startDistrict, endDistrict }: PuzzleDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-primary">Today's Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-secondary" />
          <p className="text-lg">
            Start District: <span className="font-semibold text-accent">{startDistrict}</span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-secondary" />
          <p className="text-lg">
            End District: <span className="font-semibold text-accent">{endDistrict}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
