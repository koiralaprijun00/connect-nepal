import React from 'react';
import { ImprovedNepalDistrictMap } from './nepal-traversal/ImprovedNepalDistrictMap';

export function InteractiveNepalMap(props: {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
  className?: string;
  onDistrictClick?: (districtName: string) => void;
}) {
  return (
    <div style={{ width: '100%', maxWidth: 800, height:550, background: '#222', margin: '0 auto' }}>
      <ImprovedNepalDistrictMap
        {...props}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
} 