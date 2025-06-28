import React, { useMemo, useState, useEffect } from 'react';
import { normalizeDistrictName } from './map-utils';
import { DISTRICTS_NEPAL, validateDistrictName } from '@/lib/puzzle';

interface NepalMapProps {
  startDistrict: string;
  endDistrict: string;
  correctGuesses: string[];
  className?: string;
}

interface DistrictPathData {
  id: string;
  name: string;
  pathData: string;
}

// District state for visual indication only
type DistrictState = 'default' | 'start' | 'end' | 'correct';

export const NepalMap: React.FC<NepalMapProps> = ({
  startDistrict,
  endDistrict,
  correctGuesses,
  className = ""
}) => {
  const [districtPaths, setDistrictPaths] = useState<DistrictPathData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load SVG file
  useEffect(() => {
    const loadMap = async () => {
      try {
        const response = await fetch('/maps/nepal-districts.svg');
        if (!response.ok) throw new Error('Failed to load map');
        
        const svgContent = await response.text();
        const districts = parseSVG(svgContent);
        setDistrictPaths(districts);
        
        // Debug: Log which districts were found
        console.log('Parsed districts:', districts.map(d => d.name));
        console.log('Looking for start district:', startDistrict);
        console.log('Looking for end district:', endDistrict);
      } catch (err) {
        console.error('Map loading failed:', err);
        setError('Map not available');
      } finally {
        setIsLoading(false);
      }
    };

    loadMap();
  }, [startDistrict, endDistrict]);

  // Enhanced SVG parser with better district name mapping
  const parseSVG = (content: string): DistrictPathData[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'image/svg+xml');
    const paths = doc.querySelectorAll('path[id], path[data-name], path[data-district]');
    
    return Array.from(paths).map(path => {
      const id = path.getAttribute('id') || '';
      const dataName = path.getAttribute('data-name') || '';
      const dataDistrict = path.getAttribute('data-district') || '';
      const pathData = path.getAttribute('d') || '';
      
      if (!pathData) return null;
      
      // Try multiple sources for district name
      const name = mapIdToName(id) || mapIdToName(dataName) || mapIdToName(dataDistrict) || id;
      
      return { id, name: name || id, pathData };
    }).filter((d): d is DistrictPathData => d !== null && d.name && d.pathData);
  };

  // Enhanced district name mapping with more variations
  const mapIdToName = (id: string): string | null => {
    if (!id) return null;
    
    // Enhanced mapping for common variations
    const idMappings: Record<string, string> = {
      // Direct mappings for common SVG IDs
      'kapilbastu': 'Kapilvastu',
      'kapilavastu': 'Kapilvastu', 
      'kapilvastu': 'Kapilvastu',
      'sunsari': 'Sunsari',
      'kathmandu': 'Kathmandu',
      'lalitpur': 'Lalitpur',
      'bhaktapur': 'Bhaktapur',
      'chitwan': 'Chitwan',
      'pokhara': 'Kaski', // City to district mapping
      'biratnagar': 'Morang', // City to district mapping
      
      // Handle common variations
      'nawalparasi': 'Nawalpur',
      'nawalparasi_east': 'Parasi',
      'nawalparasi_west': 'Nawalpur',
      'rukum': 'Rukum East',
      'rukum_east': 'Rukum East',
      'rukum_west': 'Rukum West',
    };
    
    const normalized = id.toLowerCase().replace(/[-_\s]/g, '');
    
    // Check direct mapping first
    if (idMappings[normalized]) {
      return idMappings[normalized];
    }
    
    // Try capitalized version
    const capitalized = id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
    const validated = validateDistrictName(capitalized);
    if (validated) return validated;
    
    // Try with spaces replaced
    const withSpaces = id.replace(/[-_]/g, ' ');
    const validatedSpaces = validateDistrictName(withSpaces);
    if (validatedSpaces) return validatedSpaces;
    
    // Try partial matching for districts
    for (const district of DISTRICTS_NEPAL) {
      const districtNormalized = district.toLowerCase().replace(/[-_\s]/g, '');
      if (districtNormalized.includes(normalized) || normalized.includes(districtNormalized)) {
        return district;
      }
    }
    
    return null;
  };

  // Get district visual state with enhanced debugging
  const getDistrictState = (districtName: string): DistrictState => {
    const normalized = normalizeDistrictName(districtName);
    const startNormalized = normalizeDistrictName(startDistrict);
    const endNormalized = normalizeDistrictName(endDistrict);
    
    // Debug logging for the problematic districts
    if (districtName.toLowerCase().includes('kapil') || districtName.toLowerCase().includes('suns')) {
      console.log(`Checking district: ${districtName}`);
      console.log(`Normalized: ${normalized}`);
      console.log(`Start normalized: ${startNormalized}`);
      console.log(`End normalized: ${endNormalized}`);
      console.log(`Is start: ${normalized === startNormalized}`);
      console.log(`Is end: ${normalized === endNormalized}`);
    }
    
    if (normalized === startNormalized) return 'start';
    if (normalized === endNormalized) return 'end';
    
    const isCorrect = correctGuesses.some(guess => 
      normalizeDistrictName(guess) === normalized
    );
    if (isCorrect) return 'correct';
    
    return 'default';
  };

  // Get CSS classes for district state with enhanced colors
  const getDistrictClasses = (state: DistrictState): string => {
    const base = "transition-colors duration-200";
    
    switch (state) {
      case 'start':
        return `${base} fill-green-500 stroke-green-700 stroke-2`;
      case 'end':
        return `${base} fill-red-500 stroke-red-700 stroke-2`;
      case 'correct':
        return `${base} fill-yellow-500 stroke-yellow-700 stroke-2`;
      default:
        return `${base} fill-gray-200 stroke-gray-400 stroke-1`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <div className="bg-blue-50 rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error or fallback state
  if (error || districtPaths.length === 0) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <div className="bg-blue-50 rounded-lg border border-gray-200 p-4">
          <SimpleFallbackMap
            startDistrict={startDistrict}
            endDistrict={endDistrict}
            correctGuesses={correctGuesses}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Map Container */}
      <div className="relative bg-blue-50 rounded-lg border border-gray-200 overflow-hidden">
        <svg
          viewBox="0 0 840 595"
          className="w-full h-auto"
          style={{ minHeight: '300px', maxHeight: '500px' }}
          aria-label="Nepal districts map showing game progress"
        >
          <title>Nepal Map - Visual Progress Indicator</title>
          
          {/* Background */}
          <rect width="840" height="595" fill="#f0f9ff" />
          
          {/* Render all districts - visual only, no interactions */}
          {districtPaths.map(({ id, name, pathData }) => {
            const state = getDistrictState(name);
            return (
              <path
                key={id}
                id={id}
                d={pathData}
                className={getDistrictClasses(state)}
                aria-label={`${name} district - ${state}`}
              />
            );
          })}
        </svg>
        
        {/* Enhanced Legend with debugging info */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-green-500 rounded border border-green-700"></div>
              <span className="text-gray-800">Start: {startDistrict}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-red-500 rounded border border-red-700"></div>
              <span className="text-gray-800">End: {endDistrict}</span>
            </div>
            {correctGuesses.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-yellow-500 rounded border border-yellow-700"></div>
                <span>Correct ({correctGuesses.length})</span>
              </div>
            )}
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <div>Districts found: {districtPaths.length}</div>
                <div>Start found: {districtPaths.some(d => getDistrictState(d.name) === 'start') ? '✓' : '✗'}</div>
                <div>End found: {districtPaths.some(d => getDistrictState(d.name) === 'end') ? '✓' : '✗'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced fallback map with correct highlighting
const SimpleFallbackMap: React.FC<{
  startDistrict: string;
  endDistrict: string;
  correctGuesses: string[];
}> = ({ startDistrict, endDistrict, correctGuesses }) => {
  // Enhanced sample districts with more accurate positioning
  const sampleDistricts = [
    { name: 'Kathmandu', path: 'M380 180 L420 180 L420 220 L380 220 Z' },
    { name: 'Lalitpur', path: 'M380 220 L420 220 L420 260 L380 260 Z' },
    { name: 'Bhaktapur', path: 'M420 180 L460 180 L460 220 L420 220 Z' },
    { name: 'Chitwan', path: 'M340 280 L440 280 L440 320 L340 320 Z' },
    { name: 'Kaski', path: 'M200 160 L280 160 L280 240 L200 240 Z' },
    { name: 'Sunsari', path: 'M600 200 L650 200 L650 240 L600 240 Z' },
    { name: 'Kapilvastu', path: 'M150 300 L200 300 L200 340 L150 340 Z' },
  ];

  const getState = (name: string) => {
    if (name === startDistrict) return 'start';
    if (name === endDistrict) return 'end';
    if (correctGuesses.includes(name)) return 'correct';
    return 'default';
  };

  const getClasses = (state: string) => {
    switch (state) {
      case 'start': return 'fill-green-500 stroke-green-700 stroke-2';
      case 'end': return 'fill-red-500 stroke-red-700 stroke-2';
      case 'correct': return 'fill-yellow-500 stroke-yellow-700 stroke-2';
      default: return 'fill-gray-200 stroke-gray-400 stroke-1';
    }
  };

  return (
    <div className="text-center">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-auto border rounded"
        style={{ maxHeight: '300px' }}
      >
        <rect width="800" height="400" fill="#f0f9ff" />
        
        {sampleDistricts.map(({ name, path }) => (
          <path
            key={name}
            d={path}
            className={getClasses(getState(name))}
          />
        ))}
        
        <text x="400" y="50" textAnchor="middle" className="fill-gray-500 text-sm font-semibold">
          Nepal Map (Simplified)
        </text>
      </svg>
      
      <p className="text-xs text-gray-500 mt-2">
        Map shows visual progress only • Districts shown: {sampleDistricts.length}/77
      </p>
      
      {/* Debug info for fallback */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400">
          Start: {startDistrict} | End: {endDistrict}
        </div>
      )}
    </div>
  );
};

export default NepalMap;