import React from 'react';
import { DebugNepalMap } from './nepal-traversal/DebugNepalMap';

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
    <div className={`nepal-map-container ${className || ''}`}>
      <DebugNepalMap
        guessedPath={guessedPath}
        correctPath={correctPath}
        startDistrict={startDistrict}
        endDistrict={endDistrict}
        onDistrictClick={onDistrictClick}
        className="nepal-map-svg"
      />
    </div>
  );
} 