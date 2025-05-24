'use client';
import type { SVGProps } from 'react';
import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { NepalMapSVG } from './NepalMapSVG';

interface ImprovedNepalDistrictMapProps extends SVGProps<SVGSVGElement> {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
  onDistrictClick?: (districtName: string) => void;
  hintDistricts?: string[];
}

export function ImprovedNepalDistrictMap({
  guessedPath,
  correctPath,
  startDistrict,
  endDistrict,
  onDistrictClick,
  hintDistricts = [],
  className,
  ...rest
}: ImprovedNepalDistrictMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Normalize district names for consistent matching
  const normalizeDistrict = useCallback((name: string): string => {
    return name.trim().toLowerCase().replace(/[-_\s]/g, '');
  }, []);

  // Find SVG element by district name with multiple fallback strategies
  const findDistrictElement = useCallback((districtName: string): SVGElement | null => {
    if (!svgRef.current || !districtName) return null;
    
    const svg = svgRef.current;
    const normalized = normalizeDistrict(districtName);
    const original = districtName.trim();
    const capitalized = original.charAt(0).toUpperCase() + original.slice(1).toLowerCase();
    const lower = original.toLowerCase();
    
    // Search strategies in order of preference
    const searchStrategies = [
      // 1. Exact ID matches
      () => svg.querySelector(`#${original}`),
      () => svg.querySelector(`#${capitalized}`),
      () => svg.querySelector(`#${lower}`),
      () => svg.querySelector(`#${normalized}`),
      
      // 2. Path elements with ID
      () => svg.querySelector(`path[id="${original}"]`),
      () => svg.querySelector(`path[id="${capitalized}"]`),
      () => svg.querySelector(`path[id="${lower}"]`),
      () => svg.querySelector(`path[id="${normalized}"]`),
      
      // 3. Group elements containing paths
      () => {
        const group = svg.querySelector(`g[id="${original}"]`) || 
                     svg.querySelector(`g[id="${capitalized}"]`) || 
                     svg.querySelector(`g[id="${lower}"]`);
        return group?.querySelector('path') || group;
      },
      
      // 4. Data attributes
      () => svg.querySelector(`[data-name="${original}"]`),
      () => svg.querySelector(`[data-name="${capitalized}"]`),
      () => svg.querySelector(`[data-name="${lower}"]`),
      () => svg.querySelector(`g[data-name="${original}"] path`),
      
      // 5. Fuzzy matching - find elements with similar names
      () => {
        const allElements = Array.from(svg.querySelectorAll('[id], [data-name]'));
        return allElements.find((el): el is SVGElement => {
          // Type guard: only SVGElement
          if (!(el instanceof SVGElement)) return false;
          const elementId = el.id || el.getAttribute('data-name') || '';
          return normalizeDistrict(elementId) === normalized;
        }) || null;
      }
    ];

    for (const strategy of searchStrategies) {
      const element = strategy();
      if (element && element instanceof SVGElement) {
        // If it's a group, try to get the path inside
        if (element.tagName.toLowerCase() === 'g') {
          const path = element.querySelector('path');
          return path instanceof SVGElement ? path : element;
        }
        return element;
      }
    }

    // Log missing districts for debugging
    console.warn(`District element not found: ${districtName} (normalized: ${normalized})`);
    return null;
  }, [normalizeDistrict]);

  // Apply CSS class to district element
  const setDistrictClass = useCallback((districtName: string, cssClass: string) => {
    const element = findDistrictElement(districtName);
    if (element) {
      // Reset all district-related classes first
      const currentClass = (element.getAttribute('class') || '').split(' ');
      const filteredClass = currentClass.filter((cls: string) => !cls.startsWith('district-'));
      element.setAttribute('class', filteredClass.join(' '));
      // Add the new class
      element.classList.add(cssClass);
      // Add hover and focus states for better accessibility
      if (onDistrictClick) {
        (element as unknown as HTMLElement).style.cursor = 'pointer';
        element.setAttribute('tabIndex', '0');
        element.setAttribute('aria-label', `District: ${districtName}`);
      }
    }
  }, [findDistrictElement, onDistrictClick]);

  // Reset all districts to default state
  const resetAllDistricts = useCallback(() => {
    if (!svgRef.current) return;
    const allElements = svgRef.current.querySelectorAll('path, g');
    allElements.forEach(element => {
      const currentClass = (element.getAttribute('class') || '').split(' ');
      const filteredClass = currentClass.filter((cls: string) => !cls.startsWith('district-'));
      element.setAttribute('class', filteredClass.join(' '));
      element.classList.add('district-default');
      // Reset interactive states
      (element as unknown as HTMLElement).style.cursor = '';
      element.removeAttribute('tabIndex');
      element.removeAttribute('aria-label');
    });
  }, []);

  // Main effect to update district styling
  useEffect(() => {
    if (!svgRef.current) return;

    // Reset all districts first
    resetAllDistricts();

    // Apply start district styling (highest priority)
    if (startDistrict) {
      setDistrictClass(startDistrict, 'district-start');
    }

    // Apply end district styling (highest priority)
    if (endDistrict) {
      setDistrictClass(endDistrict, 'district-end');
    }

    // Apply hint districts styling
    if (hintDistricts && hintDistricts.length > 0) {
      hintDistricts.forEach(district => {
        // Don't override start/end districts
        if (district !== startDistrict && district !== endDistrict) {
          setDistrictClass(district, 'district-hint');
        }
      });
    }

    // Apply correct path styling (lower priority than start/end)
    if (correctPath && correctPath.length > 0) {
      correctPath.forEach(district => {
        // Don't override start/end districts
        if (district !== startDistrict && district !== endDistrict) {
          setDistrictClass(district, 'district-correct-path');
        }
      });
    }

    // Apply guessed districts styling
    if (guessedPath && guessedPath.length > 0) {
      const normalizedCorrectPath = correctPath.map(d => normalizeDistrict(d));
      
      guessedPath.forEach(guessedDistrict => {
        // Don't override start/end districts
        if (guessedDistrict !== startDistrict && guessedDistrict !== endDistrict) {
          const isCorrect = normalizedCorrectPath.includes(normalizeDistrict(guessedDistrict));
          const cssClass = isCorrect ? 'district-guessed-correct' : 'district-guessed-incorrect';
          setDistrictClass(guessedDistrict, cssClass);
        }
      });
    }

  }, [
    guessedPath, 
    correctPath, 
    startDistrict, 
    endDistrict, 
    hintDistricts,
    resetAllDistricts,
    setDistrictClass,
    normalizeDistrict
  ]);

  // Handle district clicks
  useEffect(() => {
    if (!svgRef.current || !onDistrictClick) return;
    const svg = svgRef.current;
    const clickableElements = Array.from(svg.querySelectorAll('path[id], g[id], [data-name]'));
    const handleClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const element = e.currentTarget as SVGElement;
      const districtName = element.id || element.getAttribute('data-name');
      if (districtName && onDistrictClick) {
        onDistrictClick(districtName);
      }
    };
    const handleKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') {
        handleClick(e);
      }
    };
    // Add event listeners
    clickableElements.forEach(element => {
      element.addEventListener('click', handleClick as EventListener);
      element.addEventListener('keydown', handleKeyDown as EventListener);
    });
    // Cleanup
    return () => {
      clickableElements.forEach(element => {
        element.removeEventListener('click', handleClick as EventListener);
        element.removeEventListener('keydown', handleKeyDown as EventListener);
      });
    };
  }, [onDistrictClick]);

  return (
    <div className="relative w-full h-full">
      <NepalMapSVG
        ref={svgRef}
        className={cn(
          'w-full h-full',
          'bg-background rounded-lg border border-border shadow-sm',
          'transition-all duration-200',
          className
        )}
        preserveAspectRatio="xMidYMid meet"
        {...rest}
      />
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded opacity-50 hover:opacity-100 transition-opacity">
          <div>Start: {startDistrict}</div>
          <div>End: {endDistrict}</div>
          <div>Guessed: {guessedPath.length}</div>
          <div>Correct Path: {correctPath.length}</div>
        </div>
      )}
    </div>
  );
} 