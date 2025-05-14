
'use client';
import type { SVGProps } from 'react';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NepalDistrictMapProps extends SVGProps<SVGSVGElement> {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
}

export function NepalDistrictMap({
  guessedPath,
  correctPath,
  startDistrict,
  endDistrict,
  className,
  ...rest
}: NepalDistrictMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    
    const allElements = Array.from(svg.querySelectorAll('path, g, rect, circle, polygon, polyline, line, ellipse') || []) as SVGElement[];

    // 1. Reset all relevant elements to default class
    allElements.forEach(el => {
      // Check if the element is likely a district (e.g., has an ID or data-name)
      // or apply to all if that's preferred. This avoids styling SVG boilerplate.
      if (el.id || el.dataset.name) {
        el.setAttribute('class', 'district-default');
      }
    });

    const setElementClass = (districtName: string, cssClass: string) => {
      if (!districtName) return; // Guard against empty district names
      const districtNameLower = districtName.toLowerCase();
      // Try ID first (case-sensitive)
      let el = svg.getElementById(districtName);
      // Then try ID (case-insensitive common pattern)
      if (!el) el = svg.getElementById(districtNameLower);
      if (!el) el = svg.getElementById(districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase());


      // Fallback to data-name (case-sensitive)
      if (!el) el = svg.querySelector(`[data-name="${districtName}"]`);
      // Fallback to data-name (case-insensitive)
      if (!el) el = svg.querySelector(`[data-name="${districtNameLower}"]`);
      if (!el) el = svg.querySelector(`[data-name="${districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase()}"]`);


      if (el) {
        el.setAttribute('class', cssClass); // Override completely
      }
    };
    
    const lowerCorrectPath = correctPath.map(d => d.toLowerCase());
    const lowerGuessedPath = guessedPath.map(d => d.toLowerCase());

    // 2. Style the true shortest path
    correctPath.forEach(districtName => {
      setElementClass(districtName, 'district-correct-path');
    });

    // 3. Style the user's guessed path
    guessedPath.forEach((originalGuessedDistrictName, index) => {
      const guessedDistrictLower = originalGuessedDistrictName.toLowerCase();

      if (index < lowerCorrectPath.length && guessedDistrictLower === lowerCorrectPath[index]) {
        // This district is correctly guessed and in the correct sequence.
        setElementClass(originalGuessedDistrictName, 'district-guessed-correct');
      } else {
        // This district is an incorrect guess for the current position.
        // If it's not part of the overall correct path, mark it as plain incorrect.
        if (!lowerCorrectPath.includes(guessedDistrictLower)) {
          // Ensure we don't re-style start/end if they are part of an incorrect guess
          const el = svg.getElementById(originalGuessedDistrictName) || svg.querySelector(`[data-name="${originalGuessedDistrictName}"]`);
          if (el) {
            const currentClass = el.getAttribute('class') || '';
            if (currentClass !== 'district-start' && currentClass !== 'district-end') {
               setElementClass(originalGuessedDistrictName, 'district-guessed-incorrect');
            }
          }
        }
        // If lowerCorrectPath.includes(guessedDistrictLower) but it's in the wrong spot,
        // it will retain its 'district-correct-path' style from step 2.
      }
    });

    // 4. Style start and end districts (these have highest precedence)
    if (startDistrict) setElementClass(startDistrict, 'district-start');
    if (endDistrict) setElementClass(endDistrict, 'district-end');

  }, [guessedPath, correctPath, startDistrict, endDistrict]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 600" // USER ACTION: Adjust this to your SVG's viewBox
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto object-contain bg-muted/20 rounded-md border border-border shadow-sm', className)}
      data-ai-hint="Nepal map districts" /* Keep or update AI hint */
      {...rest}
    >
      {/*
        USER ACTION REQUIRED:
        1. PASTE YOUR SVG MARKUP HERE.
           Replace the placeholder <rect> and <text> below with your actual SVG code
           (e.g., <g><path id="Kathmandu" d="..." /></g> ...).

        2. ENSURE DISTRICT IDENTIFICATION:
           Each styleable district element (e.g., <path>, <g>) MUST have an 'id' attribute
           that matches the district name used in your game (e.g., id="Kathmandu").
           The matching logic tries case-sensitive, then all-lowercase, then Capitalized.
           Using 'data-name="DistrictName"' is also supported as a fallback.

        3. ADJUST `viewBox` (above):
           Modify the `viewBox` attribute of THIS <svg> element to match your source SVG.

        EXAMPLE of what you might paste (very simplified):
        <g fill="#ccc" stroke="#333" strokeWidth="0.5">
          <path id="Kaski" d="M100,100 L150,100 L125,150 Z" />
          <path id="Tanahu" data-name="Tanahu" d="M150,100 L200,100 L175,150 Z" />
        </g>
      */}
       <rect width="100%" height="100%" fill="hsl(var(--muted))" />
       <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fill="hsl(var(--muted-foreground))">
         Your Nepal SVG Map Here
       </text>
       <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="hsl(var(--muted-foreground))" className="italic">
         (Paste SVG code & ensure district IDs match game data)
       </text>
    </svg>
  );
}
