import React from 'react';
import { DebugNepalMap } from './nepal-traversal/DebugNepalMap';

export function InteractiveNepalMap({
  guessedPath,
  startDistrict,
  endDistrict,
  className,
  onDistrictClick
}: {
  guessedPath: string[];
  startDistrict: string;
  endDistrict: string;
  className?: string;
  onDistrictClick?: (districtName: string) => void;
}) {
  return (
    <div className={`nepal-map-container ${className || ''}`}>
      <DebugNepalMap
        guessedPath={guessedPath}
        correctPath={[]}
        startDistrict={startDistrict}
        endDistrict={endDistrict}
        onDistrictClick={onDistrictClick}
        className="nepal-map-svg"
      />
    </div>
  );
} 