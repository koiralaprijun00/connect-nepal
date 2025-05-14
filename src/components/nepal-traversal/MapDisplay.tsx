
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { NepalDistrictMap } from './NepalDistrictMap'; // Import the new SVG map component

interface MapDisplayProps {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
}

export function MapDisplay({ guessedPath, correctPath, startDistrict, endDistrict }: MapDisplayProps) {
  return (
    <Card className="shadow-lg overflow-hidden">
      <CardContent className="p-2 aspect-[4/3] flex justify-center items-center">
        {/* Replace Image with NepalDistrictMap */}
        <NepalDistrictMap
          guessedPath={guessedPath}
          correctPath={correctPath}
          startDistrict={startDistrict}
          endDistrict={endDistrict}
          // The className for the SVG element itself can be managed here or within NepalDistrictMap
        />
      </CardContent>
    </Card>
  );
}
