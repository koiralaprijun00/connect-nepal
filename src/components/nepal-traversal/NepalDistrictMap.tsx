
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
      <g id="Achham">
        {/* Replace with your actual path data for Kathmandu */}
        <path id="achham" d="M153.4,198.5c0.7,0.3,1.1,1.3,1.7,1.7c0.7,0.5,1.7,0.6,2.6,0.9c0.8,0.3,4.5,2.2,2.6,3.4
  		c0.4,0.6,1.3,2.5,1.2,2.6c1.2-0.2,3.4-1.6,3.4-1.6c0.8-1.1,1.2,0.1,1.9,0.7c0.1-0.1,0.1-0.2,0.3-0.3c0.1,1.1,1.7,3.5,2.4,3.2
  		c0.8,0.5,2.3-0.8,2.4-1.7c0.8,0.7,0.9,1.8,2.5,2.2c0.9,0.2,1.7-0.6,3-0.3c1.1,0.3,1.8,1.4,2.8,2.1c0.7,0.5,1,0.2,1.6,0.8
  		c0.4,0.5-0.1,1.3,0.5,1.9c-0.8,0.4-1.7,2.4-1.6,3.7c0.1,0.8,0.3,3.3,1.1,3.5c-0.4,1,0.4,2.4,1.9,1.4c0.8,0.7,1.2,1.2,1.5,1.5
  		c0.5,0.6,1.3,1.5,2.6,1.4c0,0.1,0,0.2,0,0.3c-1.5,0-3,2.1-4.2,2.7c-1,0.5-3.9,1-4.7,2.3c0.1,0.1-2.8,3.7-3.2,4.1
  		c-0.4,0.5-1.4,1.2-1.6,1.7c-0.1,0.3,0.9,2.5-0.2,1.6c0.1,0.3,0,0.4-0.3,0.3c1.1,0.4,1.6,4.9,2.7,3.8c0.7,0.4,0.7,1.3,0.2,1.7h0.3
  		c-0.2,0.2,1.9,1.8,2.4,2.6c0.8,1.2,1.3,2.5,2.6,3.2c0.2-0.2,0-0.4,0.5-0.3c0.8,2.6,2.4,4.6,3.3,7c0.6,1.6,0.8,2.3,1.9,3.4
  		c0.8,0.9,1.7,2.3,0.5,3.5c-1.1,1-3.7,0.1-4.8,0.8c-0.1-0.3-0.1-0.2-0.2-0.5c2.4-0.7,0.7-1.6,0.3-2.4c-0.6-1.1,0.2-2.3-0.1-2.9
  		c-0.3-0.8-1.6-1.4-2.1-2.3c-0.4-0.7-0.5-1.3-1-1.8c-0.3-0.3-1.5-0.6-1.7-0.9c-0.5-0.9,0.3-3,0.2-3.6c-0.2-0.9-1.4-0.9-2.5-1.5
  		c-1.2-0.6-1.4-1.4-3.2-0.9c-1.4,0.4-1.7,1.2-3,1.6c-0.3,0.1-1.4,0.6-2.1,0.3c-0.7-0.4-0.3-1.3-0.8-1.9c-0.2-0.2-1,0.2-1.2,0
  		s-0.1-0.7-0.4-0.9c-0.6-0.4-1-0.6-1.7-1.1c-0.7,0.7-1.4,0.6-2.2,1.4c-0.3,0.3-0.3,1-0.9,1c-0.8,0-0.7-0.9-1-1
  		c-1.3-0.5-1,0.4-2.5,0.6c-1,0.1-2.5-0.4-2.8-1.2c-1.7,1-3.5-2-4.6-2.9c-0.6-0.5-1.2-1.3-1.9-1.7c-0.8-0.5-2.1-0.5-1.4-1.9
  		c1.2,1,2.3-0.1,3.1-1c0.9-1,0.9-1.8,0.5-3.6c-0.2-1-0.4-2.2-1-3.3c-0.9-1.6-0.8-0.9-0.2-2.7c-1.1,0.1-1.2-0.2-1.7-0.7
  		c-0.2-0.2,0-0.8-0.1-1s-0.6-0.2-0.8-0.4c-0.8-1.1-1.6-2.1-2.5-2.7c-0.1-0.3,0.2-0.3,0.3-0.5c-1.4-0.1-0.1-0.5-0.5-1.2
  		c-0.2-0.4-0.9-0.2-1.2-0.7c1.2-0.5,0-0.5-0.1-0.9c-0.1-0.3-0.5-1.1-0.9-1.5c1-1.5-1.5-1-1.4-2.1c0.7-0.3,1.4-0.5,1.9,0
  		c0.6-0.5,1-0.2,1.4,0c1.1-0.7,2.6-1.2,3.6-2.1c0.4-0.4,1.3-1,1.2-1.8s-1.3-0.6-1.6-1.4c-0.3-0.8,1.2-2.8,1.6-3.6
  		c0.3-0.7,0.6-1.2,1-1.7c0.1-0.2,0.9,0,1-0.2c0.2-0.3-0.1-1.1,0-1.4c0.3-1.2,0.6-4.2,1.9-4.4c-0.3-0.6-0.1-0.5,0-1
  		c-0.3-0.5-0.2-0.1,0-0.9c-0.2-0.2-0.2,0.1-0.3-0.3C152,198.5,152.9,198.4,153.4,198.5z">
  	</path> 
      </g>
      <g id="Banke">
        <path id="banke" d="M197.3,306.3c0.8,0.4,1.1,0.4,1.7,0.9c0.4,0.3,0.9,1.1,1.4,1.3c1.5,0.6,2.7,0.9,3.9,1.5
  		c0,0,1.9,0.8,1.9,0.9c0.3,0.5-0.1,1.9,0.5,2.1c0.5,0.2,0.5-0.6,0.8-0.6c-0.1,0,0.7-0.1,0.6-0.1c0.5,0,1.8,0.5,2.2,0.7
  		c1.2,0.4,3.2,2,2.4,3.6c0.9,0.1,1.6,0,1.9-0.5c0.4,0.9,4.1,1.7,3.3,2.6c0.7,0.3,0.9,0.6,0.5,1c1.3-0.1,2,2.5,3.1,1.4
  		c0.5,1.5,2,1.8,3.1,3.2c0.9,1.1,2.9,3.2,1.7,5c0.5,1.2,0.3,1.6,1.2,2.1c0.6,0.4,2.4,0.5,2.4,0.5c0.5,0.9,2.2,1.1,2.9,1.4
  		c0.6,0.2,2.1,0.9,2.9,1.4c1.5,0.9,5.2,2,6.1,3.4c0.7,1.1,0.6,3-0.2,4c0.5,0.8,0.3,2.4,0.7,3.1c-0.1,0.3-0.3,0.1-0.3,0.5
  		c0.3,0.3,0.4,0,0,0.3c0.2,0.3,0.2,0.1,0.3,0.4c-1.1,0-5-0.5-5.5-1.2c-0.2,1-1.3,1.5-1.7,1.5c-0.3-1-1.3,0.9-1.7-0.7
  		c-0.9,0.8-2.5-0.4-2.9,1.2c0.1,0.2,0.3,0.5,0.5,0.7c-0.1,0.3,0.1,0.6-0.5,0.9c0.1,0.1,0.5,0.3,0.5,0.3c-2.6,1.2-7.4-1.6-9.6-0.1
  		c-0.4,0.2-1.3,1.6-1.7,2.2c-0.5,0.8-1.5,2-1.9,2.7c1.5,2.5-2.9,2.1-3.9,1.3c-1.3-1-2.6-2.7-4.2-3.7c-0.7-0.4-2.1-0.6-3.1-1.2
  		c-0.9-0.5-1.5-1.5-2.1-2.1c-1.7-1.7-3.7-3.4-5.8-5.1c-2-1.7-5.2-1.1-7.4-2.7c-0.1,0.1-0.2,0.2-0.3,0.3c-0.5-1.7-3-2.2-4.7-3.5
  		c-1.9-1.5-3.8-2.8-6.1-3.7c0-0.1,0.3-0.2,0-0.7c1,0.5,1.5-0.2,1.9-0.8c-1.1-0.8-1.4-1.4-1.9-2.4c0.3,0.1,0.3,0.2,0.5,0.3
  		c0.2-0.9-0.2-1.3-0.7-1.7c0.5-0.3,0.7-0.2,0-0.5c0.8-0.4-0.2-2,0.7-2.9c0.4,0.7,0.7,0.2,1.4-0.2c-0.4-0.5,0.2-0.2-0.4-0.5
  		c0.2-0.7,0.1-0.6,0.2-1.2c0,0.1,0.5-0.2,0.5-0.2c-0.2,0-0.5,0-0.7,0v-0.5c1.2,0.2,0.8-0.3,1.2-0.9c0.3-0.4-0.3-0.4,0.5-1
  		s2.7-0.3,2.3-1.9c0.1,0,0.2,0,0.3,0c-0.2,0.4,0,0-0.3,0.2c0.8,0.3,1.1-0.4,1.7-0.7c0-0.4-0.2-0.4-0.5-0.5c0.5,0,0.3-0.3,0.8,0
  		c0-0.8,0.1-1,0.7-1.2c0,0.1,0,0.4,0,0.5c0.4-0.2,0.9,0.3,1.6-0.1c0.4-0.2,0.7-1.1,1-1.4c0.6-0.6,1.8-1.4,2.8-1.6
  		c-0.3-0.7-0.2-0.6,0-1.2c-0.6-0.1-0.4-0.2-0.8-0.3c0.8-0.1,1-0.9,1.2-1.4c0.2,0.3,0.6,0.4,0.8,0.7c0.5-0.9,0.6-1.8,1.2-2.4
  		c-0.1,0-0.2,0-0.3,0c0.2-0.6,0.5-1,1-1.2c-0.1,0.5-0.1,0.5-0.3,1c0.1,0,0.2,0,0.3,0c-0.1-0.8,0.5-1.2,0.9-1.5
  		c-0.2,0.2-0.2,0.4-0.7,0.3c0.1-0.1,0.3-0.4,0.3-0.5c-0.3,0.1-0.3,0-0.3-0.3c-0.2,0.1-0.5,0.1-0.9-0.4
  		C196.4,306.6,196.6,306.4,197.3,306.3z"></path>
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
