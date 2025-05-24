import React from 'react';
import { ImprovedNepalDistrictMap } from './nepal-traversal/ImprovedNepalDistrictMap';

export function InteractiveNepalMap({
  guessedPath,
  correctPath,
  startDistrict,
  endDistrict,
  className,
  onDistrictClick
}: {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
  className?: string;
  onDistrictClick?: (districtName: string) => void;
}) {
  return (
    <div className={`w-full aspect-[4/3] h-auto flex items-center justify-center ${className}`}>
      <ImprovedNepalDistrictMap
        guessedPath={guessedPath}
        correctPath={correctPath}
        startDistrict={startDistrict}
        endDistrict={endDistrict}
        onDistrictClick={onDistrictClick}
        className="w-full h-full"
      />
    </div>
  );
} 