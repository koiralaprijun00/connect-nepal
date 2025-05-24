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

  // Find district element with improved search strategy
  const findDistrictElement = useCallback((districtName: string): SVGElement | null => {
    if (!svgRef.current || !districtName) return null;
    const svg = svgRef.current;
    
    // Primary search - exact ID match (most reliable)
    const exactMatch = svg.querySelector(`#${districtName.toLowerCase()}`);
    if (exactMatch) return exactMatch as SVGElement;
    
    // Secondary search - look inside groups
    const groupMatch = svg.querySelector(`g[id="${districtName}"] path`) || 
                       svg.querySelector(`g[id="${districtName.toLowerCase()}"] path`);
    if (groupMatch) return groupMatch as SVGElement;
    
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
    
    // 1. First, reset ALL districts to default
    const allPaths = svgRef.current.querySelectorAll('path.district, g path');
    allPaths.forEach(element => {
      element.setAttribute('class', 'district-default');
      element.removeAttribute('style'); // Remove inline styles
    });

    // 2. Apply start district (GREEN) - highest priority
    if (startDistrict) {
      const startEl = findDistrictElement(startDistrict);
      if (startEl) {
        startEl.setAttribute('class', 'district-start');
      }
    }

    // 3. Apply end district (RED) - highest priority  
    if (endDistrict) {
      const endEl = findDistrictElement(endDistrict);
      if (endEl) {
        endEl.setAttribute('class', 'district-end');
      }
    }

    // 4. Apply guessed districts (only if not start/end)
    guessedPath.forEach(district => {
      if (district !== startDistrict && district !== endDistrict) {
        const el = findDistrictElement(district);
        if (el) {
          const isCorrect = correctSet.has(district.toLowerCase());
          el.setAttribute('class', isCorrect ? 'district-guessed-correct' : 'district-guessed-incorrect');
        }
      }
    });

  }, [startDistrict, endDistrict, guessedPath, correctPath, findDistrictElement, correctSet]);

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