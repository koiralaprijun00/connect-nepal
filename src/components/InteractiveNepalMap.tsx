import React, { useRef, useEffect } from 'react';
import { NepalMapSVG } from './nepal-traversal/NepalMapSVG';

export function InteractiveNepalMap({
  guessedPath,
  correctPath,
  startDistrict,
  endDistrict,
  className
}: {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    // Reset all districts to default
    const allDistricts = svg.querySelectorAll('.district');
    allDistricts.forEach(el => {
      el.setAttribute('class', 'district district-default');
    });
    // Highlight start and end
    if (startDistrict) {
      const el = svg.querySelector(`#${startDistrict.toLowerCase()}`);
      if (el) el.setAttribute('class', 'district district-start');
    }
    if (endDistrict) {
      const el = svg.querySelector(`#${endDistrict.toLowerCase()}`);
      if (el) el.setAttribute('class', 'district district-end');
    }
    // Highlight guesses
    guessedPath.forEach(district => {
      const el = svg.querySelector(`#${district.toLowerCase()}`);
      if (!el) return;
      if (correctPath.map(d => d.toLowerCase()).includes(district.toLowerCase())) {
        el.setAttribute('class', 'district district-guessed-correct');
      } else {
        el.setAttribute('class', 'district district-guessed-incorrect');
      }
    });
  }, [guessedPath, correctPath, startDistrict, endDistrict]);

  return (
    <div className="w-full aspect-[4/3] h-auto flex items-center justify-center">
      <NepalMapSVG ref={svgRef} className="w-full h-full" />
    </div>
  );
} 