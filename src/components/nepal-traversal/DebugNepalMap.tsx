'use client';
import type { SVGProps } from 'react';
import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { NepalMapSVG } from './NepalMapSVG';

interface DebugNepalMapProps extends SVGProps<SVGSVGElement> {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
  onDistrictClick?: (districtName: string) => void;
  hintDistricts?: string[];
}

export function DebugNepalMap({
  guessedPath,
  correctPath,
  startDistrict,
  endDistrict,
  onDistrictClick,
  hintDistricts = [],
  className,
  ...rest
}: DebugNepalMapProps) {
  // All hooks at the top, always
  const svgRef = useRef<SVGSVGElement>(null);
  const [debugInfo, setDebugInfo] = React.useState<any>({});
  // Memoize lowercased correctPath for performance
  const correctSet = React.useMemo(() => new Set(correctPath.map(d => d.toLowerCase())), [correctPath]);

  // Debug function to analyze SVG structure
  const analyzeSVG = useCallback(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const analysis = {
      totalElements: svg.querySelectorAll('*').length,
      pathElements: svg.querySelectorAll('path').length,
      groupElements: svg.querySelectorAll('g').length,
      elementsWithId: Array.from(svg.querySelectorAll('[id]')).map(el => el.id),
      elementsWithDataName: Array.from(svg.querySelectorAll('[data-name]')).map(el => el.getAttribute('data-name')),
      viewBox: svg.getAttribute('viewBox'),
      svgDimensions: {
        width: svg.getAttribute('width'),
        height: svg.getAttribute('height'),
        clientWidth: svg.clientWidth,
        clientHeight: svg.clientHeight
      }
    };
    setDebugInfo(analysis);
    console.group('🗺️ SVG Analysis');
    console.log('SVG Structure:', analysis);
    console.log('Start District:', startDistrict);
    console.log('End District:', endDistrict);
    console.log('Guessed Path:', guessedPath);
    console.log('Correct Path:', correctPath);
    console.groupEnd();
  }, [startDistrict, endDistrict, guessedPath, correctPath]);

  // Find district element with comprehensive search
  const findDistrictElement = useCallback((districtName: string): SVGElement | null => {
    if (!svgRef.current || !districtName) return null;
    const svg = svgRef.current;
    const searchTerms = [
      districtName.toLowerCase(),
      districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase(),
      districtName.toUpperCase(),
      districtName.toLowerCase().replace(/\s+/g, ''),
    ];
    console.log(`🔍 Searching for district: ${districtName}`);
    console.log('Search terms:', searchTerms);
    for (const term of searchTerms) {
      let element = svg.querySelector(`#${term}`) as SVGElement;
      if (element) {
        console.log(`✅ Found via ID: #${term}`, element);
        return element;
      }
      element = svg.querySelector(`path[id="${term}"]`) as SVGElement;
      if (element) {
        console.log(`✅ Found via path ID: path[id="${term}"]`, element);
        return element;
      }
      const group = svg.querySelector(`g[id="${term}"]`);
      if (group) {
        const path = group.querySelector('path') as SVGElement;
        if (path) {
          console.log(`✅ Found via group: g[id="${term}"] path`, path);
          return path;
        }
        console.log(`✅ Found group: g[id="${term}"]`, group);
        return group as SVGElement;
      }
      element = svg.querySelector(`[data-name="${term}"]`) as SVGElement;
      if (element) {
        console.log(`✅ Found via data-name: [data-name="${term}"]`, element);
        return element;
      }
    }
    console.warn(`❌ District not found: ${districtName}`);
    return null;
  }, []);

  // Apply styling to district
  const styleDistrict = useCallback((districtName: string, className: string, color?: string) => {
    const element = findDistrictElement(districtName);
    if (element) {
      const currentClass = (element.getAttribute('class') || '').split(' ');
      const filteredClass = currentClass.filter((cls: string) => !cls.startsWith('district-'));
      element.setAttribute('class', [...filteredClass, className].join(' '));
      if (color) {
        element.style.fill = color;
        element.style.stroke = '#000';
        element.style.strokeWidth = '2px';
      }
      console.log(`🎨 Styled ${districtName} with ${className}`, element);
    }
  }, [findDistrictElement]);

  // Main effect for styling districts (runs only on client)
  useEffect(() => {
    if (!svgRef.current) return;
    console.group('🎨 Styling Districts');
    const allElements = svgRef.current.querySelectorAll('path, g');
    allElements.forEach(element => {
      element.removeAttribute('style');
      element.setAttribute('class', 'district-default');
    });
    if (startDistrict) {
      styleDistrict(startDistrict, 'district-start', '#22c55e');
    }
    if (endDistrict) {
      styleDistrict(endDistrict, 'district-end', '#ef4444');
    }
    correctPath.forEach(district => {
      if (district !== startDistrict && district !== endDistrict) {
        styleDistrict(district, 'district-correct-path', '#93c5fd');
      }
    });
    guessedPath.forEach(district => {
      if (district !== startDistrict && district !== endDistrict) {
        const isCorrect = correctSet.has(district.toLowerCase());
        if (isCorrect) {
          styleDistrict(district, 'district-guessed-correct', '#fbbf24');
        } else {
          styleDistrict(district, 'district-guessed-incorrect', '#f87171');
        }
      }
    });
    console.groupEnd();
  }, [startDistrict, endDistrict, correctPath, guessedPath, styleDistrict, correctSet]);

  // Debug effect
  useEffect(() => {
    const timer = setTimeout(analyzeSVG, 100);
    return () => clearTimeout(timer);
  }, [analyzeSVG]);

  return (
    <div className="relative w-full">
      {/* SVG Container with explicit sizing */}
      <div className="w-full bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
        <NepalMapSVG
          ref={svgRef}
          className={cn(
            'w-full h-auto',
            'min-h-[400px]',
            className
          )}
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
          {...rest}
        />
      </div>
      {/* Debug Panel */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg text-xs">
        <h3 className="font-bold mb-2">🐛 Debug Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Game State:</strong>
            <div>Start: {startDistrict}</div>
            <div>End: {endDistrict}</div>
            <div>Guessed: [{guessedPath.join(', ')}]</div>
            <div>Correct: [{correctPath.join(', ')}]</div>
          </div>
          <div>
            <strong>SVG Info:</strong>
            <div>Elements: {debugInfo.totalElements}</div>
            <div>Paths: {debugInfo.pathElements}</div>
            <div>Groups: {debugInfo.groupElements}</div>
            <div>ViewBox: {debugInfo.viewBox}</div>
          </div>
        </div>
        {debugInfo.elementsWithId && (
          <div className="mt-2">
            <strong>Available IDs:</strong>
            <div className="text-xs max-h-20 overflow-y-auto">
              {debugInfo.elementsWithId.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 