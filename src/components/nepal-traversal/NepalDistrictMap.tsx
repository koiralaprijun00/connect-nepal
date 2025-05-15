
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
      if (el.id || el.dataset.name) {
        el.setAttribute('class', 'district-default');
      }
    });

    const setElementClass = (districtName: string, cssClass: string) => {
      if (!districtName) return; 
      const districtNameLower = districtName.toLowerCase();
      let el = svg.getElementById(districtName);
      if (!el) el = svg.getElementById(districtNameLower);
      if (!el) el = svg.getElementById(districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase());

      if (!el) el = svg.querySelector(`[data-name="${districtName}"]`);
      if (!el) el = svg.querySelector(`[data-name="${districtNameLower}"]`);
      if (!el) el = svg.querySelector(`[data-name="${districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase()}"]`);

      if (el) {
        el.setAttribute('class', cssClass); 
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
        setElementClass(originalGuessedDistrictName, 'district-guessed-correct');
      } else {
        if (!lowerCorrectPath.includes(guessedDistrictLower)) {
          const el = svg.getElementById(originalGuessedDistrictName) || svg.querySelector(`[data-name="${originalGuessedDistrictName}"]`);
          if (el) {
            const currentClass = el.getAttribute('class') || '';
            if (currentClass !== 'district-start' && currentClass !== 'district-end') {
               setElementClass(originalGuessedDistrictName, 'district-guessed-incorrect');
            }
          }
        }
      }
    });

    // 4. Style start and end districts (these have highest precedence)
    if (startDistrict) setElementClass(startDistrict, 'district-start');
    if (endDistrict) setElementClass(endDistrict, 'district-end');

  }, [guessedPath, correctPath, startDistrict, endDistrict]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 600" // ADJUST THIS to your SVG's viewBox
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto object-contain bg-muted/20 rounded-md border border-border shadow-sm', className)}
      data-ai-hint="Nepal map districts"
      {...rest}
    >
      {/* 
        Replace the 'd' attribute content for each path with your actual SVG path data.
        Ensure the 'id' of each <g> tag matches the district name used in your game logic.
        Adjust the main 'viewBox' attribute of this <svg> element above to fit all your districts.
      */}
      <g id="Kathmandu">
        {/* Replace with your actual path data for Kathmandu */}
        <path d="M100,100 L150,100 L125,150 Z" /> 
      </g>
      <g id="Bhaktapur">
        {/* Replace with your actual path data for Bhaktapur */}
        <path d="M160,100 L210,100 L185,150 Z" />
      </g>
      {/* 
        Add more <g id="DistrictName"><path d="..." /></g> elements for all other districts here.
        For example:
        <g id="Lalitpur">
          <path d="M100,160 L150,160 L125,210 Z" />
        </g>
        <g id="Kavrepalanchok">
         <path d="M160,160 L210,160 L185,210 Z" />
        </g>
      */}
    </svg>
  );
}
