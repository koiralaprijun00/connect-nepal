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
        
        // Enhanced debug: Log which districts were found and their mappings
        console.log('=== SVG PARSING DEBUG ===');
        console.log('Total districts parsed:', districts.length);
        console.log('Looking for start district:', startDistrict);
        console.log('Looking for end district:', endDistrict);
        console.log('Correct guesses to highlight:', correctGuesses);
        
        // Check if start and end districts are found
        const startFound = districts.find(d => 
          normalizeDistrictName(d.name) === normalizeDistrictName(startDistrict)
        );
        const endFound = districts.find(d => 
          normalizeDistrictName(d.name) === normalizeDistrictName(endDistrict)
        );
        
        console.log('Start district found:', startFound ? `✓ (${startFound.name})` : '✗');
        console.log('End district found:', endFound ? `✓ (${endFound.name})` : '✗');
        
        // Check correct guesses mapping with detailed analysis
        correctGuesses.forEach(guess => {
          const found = districts.find(d => 
            normalizeDistrictName(d.name) === normalizeDistrictName(guess)
          );
          console.log(`Correct guess "${guess}" found:`, found ? `✓ (${found.name})` : '✗');
          
          // Special debugging for Makwanpur
          if (guess.toLowerCase().includes('makwan')) {
            console.log('🔍 MAKWANPUR DEBUGGING:');
            console.log('  Looking for variations of:', guess);
            
            // Show all districts that might be Makwanpur
            const possibleMatches = districts.filter(d => 
              d.id.toLowerCase().includes('makw') || 
              d.name.toLowerCase().includes('makw') ||
              d.id.toLowerCase().includes('bagmati') ||
              d.id.toLowerCase().includes('narayani')
            );
            
            console.log('  Possible Makwanpur matches found:', possibleMatches);
            
            // Show all district IDs for manual inspection
            console.log('  All district IDs containing "mak":', 
              districts.filter(d => d.id.toLowerCase().includes('mak')).map(d => d.id)
            );
          }
        });
        
      } catch (err) {
        console.error('Map loading failed:', err);
        setError('Map not available');
      } finally {
        setIsLoading(false);
      }
    };

    loadMap();
  }, [startDistrict, endDistrict, correctGuesses]);

  // Enhanced SVG parser with comprehensive district name mapping
  const parseSVG = (content: string): DistrictPathData[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'image/svg+xml');
    const paths = doc.querySelectorAll('path[id], path[data-name], path[data-district], path[title], path[class]');
    
    const results: DistrictPathData[] = [];
    
    Array.from(paths).forEach(path => {
      const id = path.getAttribute('id') || '';
      const dataName = path.getAttribute('data-name') || '';
      const dataDistrict = path.getAttribute('data-district') || '';
      const title = path.getAttribute('title') || '';
      const className = path.getAttribute('class') || '';
      const pathData = path.getAttribute('d') || '';
      
      if (!pathData) return;
      
      // Try multiple sources for district name with enhanced mapping
      const name = mapIdToName(id) || 
                   mapIdToName(dataName) || 
                   mapIdToName(dataDistrict) || 
                   mapIdToName(title) ||
                   mapIdToName(className) ||
                   id;
      
      if (name && name !== id) {
        results.push({ id, name, pathData });
        console.log(`Mapped: "${id}" → "${name}"`);
      } else if (id) {
        // Keep unmapped districts for debugging
        results.push({ id, name: id, pathData });
        console.log(`Unmapped: "${id}" (kept as-is)`);
      }
    });
    
    return results.filter(d => d.name && d.pathData);
  };

  // Comprehensive district name mapping with extensive Makwanpur variations
  const mapIdToName = (id: string): string | null => {
    if (!id) return null;
    
    // Enhanced mapping for common variations and problematic districts
    const idMappings: Record<string, string> = {
      // Extensive Makwanpur variations
      'makwanpur': 'Makwanpur',
      'makvanpur': 'Makwanpur',
      'makwanpoor': 'Makwanpur',
      'makwanpur_district': 'Makwanpur',
      'district_makwanpur': 'Makwanpur',
      'np_makwanpur': 'Makwanpur',
      'npl_makwanpur': 'Makwanpur',
      'makwanpurdistrict': 'Makwanpur',
      'makwanpur_bagmati': 'Makwanpur',
      'bagmati_makwanpur': 'Makwanpur',
      'makwanpur_narayani': 'Makwanpur',
      'narayani_makwanpur': 'Makwanpur',
      'makwanpur_zone': 'Makwanpur',
      'zone_makwanpur': 'Makwanpur',
      'makwanpur_province': 'Makwanpur',
      'province_makwanpur': 'Makwanpur',
      'makwanpur_bagmati_province': 'Makwanpur',
      'bagmati_province_makwanpur': 'Makwanpur',
      
      // Alternative spellings and variations
      'makvanpoor': 'Makwanpur',
      'makwanpoor': 'Makwanpur',
      'makwanpurr': 'Makwanpur',
      'makwanpurdistrict': 'Makwanpur',
      'makwanpur1': 'Makwanpur',
      'makwanpur2': 'Makwanpur',
      'makwanpur_1': 'Makwanpur',
      'makwanpur_2': 'Makwanpur',
      
      // Chitwan variations
      'chitwan': 'Chitwan',
      'chitawan': 'Chitwan',
      'chitwon': 'Chitwan',
      'chitvan': 'Chitwan',
      'chitwan_district': 'Chitwan',
      'district_chitwan': 'Chitwan',
      'np_chitwan': 'Chitwan',
      'npl_chitwan': 'Chitwan',
      
      // Kavrepalanchok variations
      'kavrepalanchok': 'Kavrepalanchok',
      'kavrepalanchowk': 'Kavrepalanchok',
      'kavre': 'Kavrepalanchok',
      'kavrepalanchok_district': 'Kavrepalanchok',
      'kavre_palanchok': 'Kavrepalanchok',
      'kavre_palanchowk': 'Kavrepalanchok',
      
      // Sindhupalchok variations
      'sindhupalchok': 'Sindhupalchok',
      'sindhupalchowk': 'Sindhupalchok',
      'sindhuli': 'Sindhuli',
      'sindhupalchok_district': 'Sindhupalchok',
      
      // Other common mappings
      'kapilbastu': 'Kapilvastu',
      'kapilavastu': 'Kapilvastu', 
      'kapilvastu': 'Kapilvastu',
      'sunsari': 'Sunsari',
      'kathmandu': 'Kathmandu',
      'lalitpur': 'Lalitpur',
      'bhaktapur': 'Bhaktapur',
      'morang': 'Morang',
      'dhankuta': 'Dhankuta',
      'udayapur': 'Udayapur',
      'tanahu': 'Tanahu',
      'syangja': 'Syangja',
      'ilam': 'Ilam',
      
      // City to district mappings
      'pokhara': 'Kaski',
      'biratnagar': 'Morang',
      
      // Handle common variations
      'nawalparasi': 'Nawalpur',
      'nawalparasi_east': 'Parasi',
      'nawalparasi_west': 'Nawalpur',
      'rukum': 'Rukum East',
      'rukum_east': 'Rukum East',
      'rukum_west': 'Rukum West',
      
      // Additional variations that might exist in SVG
      'bagmati': 'Makwanpur', // Sometimes Makwanpur is labeled under old province names
      'narayani': 'Makwanpur', // Old zone name that might be used for Makwanpur
      'hetauda': 'Makwanpur', // Capital city of Makwanpur
    };
    
    const normalized = id.toLowerCase().replace(/[-_\s]/g, '');
    
    // Check direct mapping first
    if (idMappings[normalized]) {
      return idMappings[normalized];
    }
    
    // Special handling for specific districts - check if ID contains district-like patterns
    if (normalized.includes('makw') || normalized.includes('makv')) {
      return 'Makwanpur';
    }
    if (normalized.includes('chitw') || normalized.includes('chitv')) {
      return 'Chitwan';
    }
    if (normalized.includes('kavre') || normalized.includes('palanchok') || normalized.includes('palanchowk')) {
      return 'Kavrepalanchok';
    }
    if (normalized.includes('sindhup') && normalized.includes('chok')) {
      return 'Sindhupalchok';
    }
    if (normalized.includes('dhankut')) {
      return 'Dhankuta';
    }
    if (normalized.includes('udayap')) {
      return 'Udayapur';
    }
    if (normalized.includes('tanah')) {
      return 'Tanahu';
    }
    if (normalized.includes('syangj')) {
      return 'Syangja';
    }
    
    // Check if it might be Makwanpur based on common alternative names
    if (normalized.includes('hetaud') || // Hetauda is the capital
        normalized.includes('bagmat') || // Old province name
        normalized.includes('narayan')) { // Old zone name
      return 'Makwanpur';
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

  // Get district visual state with enhanced debugging and correct guess checking
  const getDistrictState = (districtName: string): DistrictState => {
    const normalized = normalizeDistrictName(districtName);
    const startNormalized = normalizeDistrictName(startDistrict);
    const endNormalized = normalizeDistrictName(endDistrict);
    
    // Enhanced debug logging for problematic districts
    if (districtName.toLowerCase().includes('makwan') || 
        districtName.toLowerCase().includes('chitwan') || 
        districtName.toLowerCase().includes('kavre') ||
        districtName.toLowerCase().includes('sindhup') ||
        districtName.toLowerCase().includes('dhankut') ||
        districtName.toLowerCase().includes('udayap') ||
        districtName.toLowerCase().includes('tanah') ||
        districtName.toLowerCase().includes('syangj')) {
      console.log(`🔍 Checking district: "${districtName}"`);
      console.log(`   Normalized: "${normalized}"`);
      console.log(`   Start normalized: "${startNormalized}"`);
      console.log(`   End normalized: "${endNormalized}"`);
      console.log(`   Is start: ${normalized === startNormalized}`);
      console.log(`   Is end: ${normalized === endNormalized}`);
      
      // Check correct guesses
      const isCorrect = correctGuesses.some(guess => {
        const guessNormalized = normalizeDistrictName(guess);
        console.log(`   Checking against guess "${guess}" (normalized: "${guessNormalized}"): ${normalized === guessNormalized}`);
        return normalized === guessNormalized;
      });
      console.log(`   Is correct guess: ${isCorrect}`);
    }
    
    if (normalized === startNormalized) return 'start';
    if (normalized === endNormalized) return 'end';
    
    // Enhanced correct guess checking with detailed logging
    const isCorrect = correctGuesses.some(guess => {
      const guessNormalized = normalizeDistrictName(guess);
      return normalized === guessNormalized;
    });
    
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

  // Count districts by state for debugging
  const stateCount = {
    start: 0,
    end: 0,
    correct: 0,
    default: 0
  };
  
  districtPaths.forEach(({ name }) => {
    const state = getDistrictState(name);
    stateCount[state]++;
  });

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
        
        {/* Simplified Legend - only Start and End */}
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
          </div>
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
  // Enhanced sample districts with more accurate positioning including all mentioned districts
  const sampleDistricts = [
    { name: 'Kathmandu', path: 'M380 180 L420 180 L420 220 L380 220 Z' },
    { name: 'Lalitpur', path: 'M380 220 L420 220 L420 260 L380 260 Z' },
    { name: 'Bhaktapur', path: 'M420 180 L460 180 L460 220 L420 220 Z' },
    { name: 'Chitwan', path: 'M340 280 L440 280 L440 320 L340 320 Z' },
    { name: 'Makwanpur', path: 'M340 240 L440 240 L440 280 L340 280 Z' },
    { name: 'Kavrepalanchok', path: 'M420 220 L480 220 L480 280 L420 280 Z' },
    { name: 'Sindhupalchok', path: 'M420 120 L480 120 L480 180 L420 180 Z' },
    { name: 'Kaski', path: 'M200 160 L280 160 L280 240 L200 240 Z' },
    { name: 'Sunsari', path: 'M600 200 L650 200 L650 240 L600 240 Z' },
    { name: 'Kapilvastu', path: 'M150 300 L200 300 L200 340 L150 340 Z' },
    { name: 'Morang', path: 'M650 200 L700 200 L700 240 L650 240 Z' },
    { name: 'Dhankuta', path: 'M650 160 L700 160 L700 200 L650 200 Z' },
    { name: 'Udayapur', path: 'M600 160 L650 160 L650 200 L600 200 Z' },
    { name: 'Tanahu', path: 'M280 160 L340 160 L340 200 L280 200 Z' },
    { name: 'Syangja', path: 'M240 200 L300 200 L300 240 L240 240 Z' },
    { name: 'Ilam', path: 'M700 160 L750 160 L750 200 L700 200 Z' },
  ];

  const getState = (name: string) => {
    if (normalizeDistrictName(name) === normalizeDistrictName(startDistrict)) return 'start';
    if (normalizeDistrictName(name) === normalizeDistrictName(endDistrict)) return 'end';
    if (correctGuesses.some(guess => normalizeDistrictName(guess) === normalizeDistrictName(name))) return 'correct';
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
    </div>
  );
};

export default NepalMap;