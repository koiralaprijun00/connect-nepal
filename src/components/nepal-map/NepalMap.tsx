// Updated NepalMap.tsx to work with your SVG structure
import React, { useMemo, useState, useEffect } from 'react';
import { DistrictPath } from './DistrictPath';
import { MapLegend } from './MapLegend';
import { createDistrictStateMap, normalizeDistrictName } from './map-utils';
import { DISTRICTS_NEPAL, validateDistrictName } from '@/lib/puzzle';

interface NepalMapProps {
  startDistrict: string;
  endDistrict: string;
  correctGuesses: string[];
  incorrectGuesses?: string[];
  onDistrictClick?: (district: string) => void;
  className?: string;
}

// District path data extracted from your SVG
interface DistrictPathData {
  id: string;
  name: string;
  pathData: string;
}

export const NepalMap: React.FC<NepalMapProps> = ({
  startDistrict,
  endDistrict,
  correctGuesses,
  incorrectGuesses = [],
  onDistrictClick,
  className = ""
}) => {
  const [districtPaths, setDistrictPaths] = useState<DistrictPathData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state for district components
  const gameState = useMemo(() => ({
    startDistrict,
    endDistrict,
    correctGuesses,
    incorrectGuesses,
    isGameWon: false // You can pass this from props if needed
  }), [startDistrict, endDistrict, correctGuesses, incorrectGuesses]);

  // Create district state mapping for performance
  const districtStates = useMemo(() => {
    return createDistrictStateMap(gameState);
  }, [gameState]);

  // Load and parse SVG file
  useEffect(() => {
    const loadNepalMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load SVG from assets folder
        const response = await fetch('/src/assets/maps/nepal-districts.svg');
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.statusText}`);
        }

        const svgContent = await response.text();
        const parsedDistricts = parseSVGDistricts(svgContent);
        
        console.log(`Loaded ${parsedDistricts.length} districts from SVG`);
        
        // Validate against expected districts
        const foundNames = parsedDistricts.map(d => d.name);
        const missing = DISTRICTS_NEPAL.filter(expected => 
          !foundNames.some(found => 
            normalizeDistrictName(found) === normalizeDistrictName(expected)
          )
        );
        
        if (missing.length > 0) {
          console.warn('Missing districts in SVG:', missing);
        }
        
        setDistrictPaths(parsedDistricts);
      } catch (err) {
        console.error('Failed to load Nepal map:', err);
        setError('Failed to load map. Using fallback.');
      } finally {
        setIsLoading(false);
      }
    };

    loadNepalMap();
  }, []);

  // Parse SVG content and extract district paths
  const parseSVGDistricts = (svgContent: string): DistrictPathData[] => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const pathElements = svgDoc.querySelectorAll('path[id]');
    
    const districts: DistrictPathData[] = [];
    
    pathElements.forEach((pathElement) => {
      const id = pathElement.getAttribute('id');
      const pathData = pathElement.getAttribute('d');
      
      if (!id || !pathData) return;
      
      // Map SVG id to proper district name
      const districtName = mapSVGIdToDistrictName(id);
      
      if (districtName) {
        districts.push({
          id,
          name: districtName,
          pathData
        });
      } else {
        console.warn(`Could not map SVG id "${id}" to a known district`);
      }
    });
    
    return districts;
  };

  // Map SVG id to proper district name
  const mapSVGIdToDistrictName = (svgId: string): string | null => {
    // Your SVG uses lowercase ids like "achham", "kathmandu", etc.
    // We need to map these to proper district names
    
    // First, try direct validation
    let districtName = validateDistrictName(svgId);
    if (districtName) return districtName;
    
    // Try with capitalization
    const capitalized = svgId.charAt(0).toUpperCase() + svgId.slice(1).toLowerCase();
    districtName = validateDistrictName(capitalized);
    if (districtName) return districtName;
    
    // Special mappings for your SVG ids that might not match exactly
    const specialMappings: Record<string, string> = {
      // Add any special cases here if needed
      'rukumeast': 'Rukum East',
      'rukumwest': 'Rukum West',
      // Add more if you find mismatches
    };
    
    if (specialMappings[svgId.toLowerCase()]) {
      return specialMappings[svgId.toLowerCase()];
    }
    
    return null;
  };

  // Handlers
  const handleDistrictClick = (districtName: string) => {
    console.log('District clicked:', districtName);
    onDistrictClick?.(districtName);
  };

  const handleDistrictHover = (districtName: string | null) => {
    // Optional: Handle hover events
    console.log('District hovered:', districtName);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <div className="relative bg-blue-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Nepal map...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (error || districtPaths.length === 0) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <div className="relative bg-blue-50 rounded-lg border border-gray-200 overflow-hidden">
          <FallbackMap
            gameState={gameState}
            districtStates={districtStates}
            onDistrictClick={handleDistrictClick}
            onDistrictHover={handleDistrictHover}
          />
          
          <MapLegend
            startDistrict={startDistrict}
            endDistrict={endDistrict}
            correctGuessCount={correctGuesses.length}
            incorrectGuessCount={incorrectGuesses.length}
            showIncorrect={incorrectGuesses.length > 0}
            position="top-right"
            variant="compact"
          />
        </div>
        
        <div className="mt-2 text-center text-sm text-orange-600">
          ⚠️ Using simplified map - {error || 'No districts found in SVG'}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="relative bg-blue-50 rounded-lg border border-gray-200 overflow-hidden">
        <svg
          viewBox="0 0 840 595"
          className="w-full h-auto"
          style={{ minHeight: '300px', maxHeight: '500px' }}
          role="img"
          aria-label="Interactive map of Nepal showing districts"
        >
          <title>Nepal Districts Map</title>
          
          {/* Background */}
          <rect width="840" height="595" fill="#f0f9ff" />
          
          {/* Render all district paths */}
          {districtPaths.map(({ id, name, pathData }) => (
            <DistrictPath
              key={id}
              id={id}
              name={name}
              pathData={pathData}
              state={districtStates[name] || 'default'}
              gameState={gameState}
              onClick={handleDistrictClick}
              onHover={handleDistrictHover}
              showTooltip={true}
            />
          ))}
        </svg>
        
        {/* Legend */}
        <MapLegend
          startDistrict={startDistrict}
          endDistrict={endDistrict}
          correctGuessCount={correctGuesses.length}
          incorrectGuessCount={incorrectGuesses.length}
          showIncorrect={incorrectGuesses.length > 0}
          position="top-right"
          variant="detailed"
        />
      </div>
      
      {/* Map Status */}
      <div className="mt-3 text-center text-sm text-gray-600">
        <span className="font-medium text-green-600">{startDistrict}</span>
        {" → "}
        <span className="font-medium text-red-600">{endDistrict}</span>
        {correctGuesses.length > 0 && (
          <span className="ml-2 text-yellow-600">
            ({correctGuesses.length} correct guess{correctGuesses.length !== 1 ? 'es' : ''})
          </span>
        )}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Map loaded: {districtPaths.length} districts found
        </div>
      )}
    </div>
  );
};

// Fallback component with simplified placeholder map
const FallbackMap: React.FC<{
  gameState: any;
  districtStates: Record<string, any>;
  onDistrictClick: (district: string) => void;
  onDistrictHover: (district: string | null) => void;
}> = ({ gameState, districtStates, onDistrictClick, onDistrictHover }) => {
  // Sample districts for fallback
  const sampleDistricts = [
    { id: 'kathmandu', name: 'Kathmandu', path: 'M380 180 L420 180 L420 220 L380 220 Z' },
    { id: 'lalitpur', name: 'Lalitpur', path: 'M380 220 L420 220 L420 260 L380 260 Z' },
    { id: 'bhaktapur', name: 'Bhaktapur', path: 'M420 180 L460 180 L460 220 L420 220 Z' },
    { id: 'chitwan', name: 'Chitwan', path: 'M340 280 L440 280 L440 320 L340 320 Z' },
  ];

  return (
    <svg
      viewBox="0 0 840 595"
      className="w-full h-auto"
      style={{ minHeight: '300px', maxHeight: '500px' }}
    >
      <rect width="840" height="595" fill="#f0f9ff" />
      
      {sampleDistricts.map(({ id, name, path }) => (
        <DistrictPath
          key={id}  
          id={id}
          name={name}
          pathData={path}
          state={districtStates[name] || 'default'}
          gameState={gameState}
          onClick={onDistrictClick}
          onHover={onDistrictHover}
          showTooltip={true}
        />
      ))}
      
      <text x="420" y="50" textAnchor="middle" className="fill-gray-500 text-sm font-semibold">
        Nepal Districts Map (Fallback)
      </text>
    </svg>
  );
};

export default NepalMap;