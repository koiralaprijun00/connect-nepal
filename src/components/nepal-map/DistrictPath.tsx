import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { 
  DistrictState, 
  getDistrictClasses, 
  isDistrictClickable, 
  normalizeDistrictName,
  debounce,
  getThemedDistrictClasses
} from './map-utils';

export interface DistrictPathProps {
  // Core district data
  id: string;
  name: string;
  pathData: string;
  
  // Visual state
  state: DistrictState;
  theme?: 'default' | 'highContrast' | 'colorBlind';
  
  // Game state for validation
  gameState: {
    startDistrict: string;
    endDistrict: string;
    correctGuesses: string[];
    isGameWon: boolean;
  };
  
  // Interaction handlers
  onClick?: (districtName: string) => void;
  onHover?: (districtName: string | null) => void;
  
  // Visual options
  showTooltip?: boolean;
  isInteractive?: boolean;
  customClasses?: string;
  
  // Accessibility
  tabIndex?: number;
  'aria-label'?: string;
}

export const DistrictPath: React.FC<DistrictPathProps> = memo(({
  id,
  name,
  pathData,
  state,
  theme = 'default',
  gameState,
  onClick,
  onHover,
  showTooltip = true,
  isInteractive = true,
  customClasses = '',
  tabIndex = 0,
  'aria-label': ariaLabel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced hover handler to prevent excessive calls
  const debouncedHover = useCallback(
    debounce((districtName: string | null) => {
      onHover?.(districtName);
    }, 100),
    [onHover]
  );

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    if (!isInteractive) return;
    
    setIsHovered(true);
    debouncedHover(name);
    
    if (showTooltip) {
      // Small delay before showing tooltip
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltipState(true);
      }, 300);
    }
  }, [isInteractive, name, debouncedHover, showTooltip]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (!isInteractive) return;
    
    setIsHovered(false);
    debouncedHover(null);
    
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltipState(false);
  }, [isInteractive, debouncedHover]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isInteractive || !onClick) return;
    
    const clickValidation = isDistrictClickable(name, gameState);
    if (clickValidation.clickable) {
      onClick(name);
    } else {
      console.log(`District ${name} not clickable: ${clickValidation.reason}`);
      // Could show a toast/notification here
    }
  }, [isInteractive, onClick, name, gameState]);

  // Handle keyboard interaction
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isInteractive) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      
      const clickValidation = isDistrictClickable(name, gameState);
      if (clickValidation.clickable && onClick) {
        onClick(name);
      }
    }
  }, [isInteractive, name, gameState, onClick]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Get appropriate CSS classes
  const cssClasses = getThemedDistrictClasses(state, theme, isInteractive);
  const finalClasses = customClasses ? `${cssClasses} ${customClasses}` : cssClasses;

  // Determine if district should be focusable
  const shouldBeFocusable = isInteractive && state !== 'start' && state !== 'end';
  const effectiveTabIndex = shouldBeFocusable ? tabIndex : -1;

  // Generate appropriate aria-label
  const generateAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;
    
    const stateDescriptions = {
      start: 'Start district',
      end: 'End district', 
      correct: 'Correctly guessed district',
      incorrect: 'Incorrectly guessed district',
      hint: 'Hinted district',
      path: 'Part of the solution path',
      default: 'Unguessed district'
    };
    
    const clickable = isDistrictClickable(name, gameState).clickable;
    const interactionHint = clickable ? ', click to select' : '';
    
    return `${name}, ${stateDescriptions[state]}${interactionHint}`;
  };

  // Get bounding box for tooltip positioning (simplified)
  const getBoundingBox = useCallback(() => {
    if (!pathRef.current) return null;
    
    try {
      const bbox = pathRef.current.getBBox();
      return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      };
    } catch (error) {
      console.warn('Could not get bounding box for district:', name);
      return null;
    }
  }, [name]);

  return (
    <>
      <path
        ref={pathRef}
        id={id}
        d={pathData}
        className={finalClasses}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={effectiveTabIndex}
        role={isInteractive ? "button" : "img"}
        aria-label={generateAriaLabel()}
        data-district={name}
        data-state={state}
        data-testid={`district-${normalizeDistrictName(name)}`}
        style={{
          // Add subtle animation on state changes
          transition: 'fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease',
        }}
      />
      
      {/* Tooltip */}
      {showTooltip && showTooltipState && isHovered && (
        <DistrictTooltip
          districtName={name}
          state={state}
          boundingBox={getBoundingBox()}
          gameState={gameState}
        />
      )}
    </>
  );
});

DistrictPath.displayName = 'DistrictPath';

// Tooltip component for district information
interface DistrictTooltipProps {
  districtName: string;
  state: DistrictState;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  gameState: {
    startDistrict: string;
    endDistrict: string;
    correctGuesses: string[];
    isGameWon: boolean;
  };
}

const DistrictTooltip: React.FC<DistrictTooltipProps> = memo(({
  districtName,
  state,
  boundingBox,
  gameState
}) => {
  if (!boundingBox) return null;

  const getTooltipContent = (): { title: string; description: string; color: string } => {
    switch (state) {
      case 'start':
        return {
          title: districtName,
          description: 'Starting point',
          color: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'end':
        return {
          title: districtName,
          description: 'Destination',
          color: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'correct':
        return {
          title: districtName,
          description: 'Correctly guessed',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
      case 'incorrect':
        return {
          title: districtName,
          description: 'Incorrect guess',
          color: 'bg-pink-100 text-pink-800 border-pink-300'
        };
      case 'hint':
        return {
          title: districtName,
          description: 'Hint revealed',
          color: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'path':
        return {
          title: districtName,
          description: 'Part of solution',
          color: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      default:
        const clickable = isDistrictClickable(districtName, gameState).clickable;
        return {
          title: districtName,
          description: clickable ? 'Click to guess' : 'Cannot select',
          color: clickable ? 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-gray-50 text-gray-500 border-gray-200'
        };
    }
  };

  const { title, description, color } = getTooltipContent();

  return (
    <g className="pointer-events-none">
      <foreignObject
        x={boundingBox.x - 60}
        y={boundingBox.y - 40}
        width="120"
        height="35"
        className="overflow-visible"
      >
        <div
          className={`px-2 py-1 rounded-md shadow-lg border text-xs font-medium text-center ${color}`}
          style={{
            transform: 'translateX(-50%)',
            maxWidth: '120px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <div className="font-semibold">{title}</div>
          <div className="text-xs opacity-90">{description}</div>
        </div>
      </foreignObject>
    </g>
  );
});

DistrictTooltip.displayName = 'DistrictTooltip';

// SVG Map Processor - Sample implementation for when you get the real Nepal map
export class SVGMapProcessor {
  private svgContent: string;
  private districtPaths: Map<string, { id: string; name: string; path: string }> = new Map();
  
  constructor(svgContent: string) {
    this.svgContent = svgContent;
    this.processSVG();
  }

  /**
   * Process the SVG content and extract district paths
   */
  private processSVG(): void {
    // Parse SVG content (in a real implementation, you'd use a proper XML parser)
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(this.svgContent, 'image/svg+xml');
    
    // Find all path elements that represent districts
    const pathElements = svgDoc.querySelectorAll('path[id], path[data-district]');
    
    pathElements.forEach((pathElement) => {
      const id = pathElement.getAttribute('id') || '';
      const dataDistrict = pathElement.getAttribute('data-district') || '';
      const pathData = pathElement.getAttribute('d') || '';
      
      if (!pathData) return;
      
      // Try to determine district name from various attributes
      let districtName = this.extractDistrictName(id, dataDistrict, pathElement);
      
      if (districtName) {
        this.districtPaths.set(normalizeDistrictName(districtName), {
          id: id || `district-${normalizeDistrictName(districtName)}`,
          name: districtName,
          path: pathData
        });
      }
    });

    console.log(`Processed ${this.districtPaths.size} districts from SVG`);
  }

  /**
   * Extract district name from various SVG attributes
   */
  private extractDistrictName(id: string, dataDistrict: string, element: Element): string | null {
    // Try different sources for district name
    const candidates = [
      dataDistrict,
      id,
      element.getAttribute('title'),
      element.getAttribute('name'),
      element.getAttribute('aria-label'),
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (!candidate) continue;
      
      // Clean up the candidate name
      const cleaned = candidate
        .toLowerCase()
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
      
      // Try to validate against known districts
      const validName = this.findValidDistrictName(cleaned);
      if (validName) return validName;
    }

    return null;
  }

  /**
   * Find valid district name from candidate
   */
  private findValidDistrictName(candidate: string): string | null {
    // Import districts list
    const { DISTRICTS_NEPAL, validateDistrictName } = require('@/lib/puzzle');
    
    // Direct match
    const exactMatch = DISTRICTS_NEPAL.find((d: string) => 
      d.toLowerCase() === candidate.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Use validation function
    return validateDistrictName(candidate);
  }

  /**
   * Get all district paths
   */
  getDistrictPaths(): Array<{ id: string; name: string; path: string }> {
    return Array.from(this.districtPaths.values());
  }

  /**
   * Get specific district path
   */
  getDistrictPath(districtName: string): { id: string; name: string; path: string } | null {
    return this.districtPaths.get(normalizeDistrictName(districtName)) || null;
  }

  /**
   * Get SVG viewBox dimensions
   */
  getViewBox(): { x: number; y: number; width: number; height: number } | null {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(this.svgContent, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (!svgElement) return null;
    
    const viewBox = svgElement.getAttribute('viewBox');
    if (!viewBox) {
      // Try to get from width/height
      const width = parseFloat(svgElement.getAttribute('width') || '800');
      const height = parseFloat(svgElement.getAttribute('height') || '400');
      return { x: 0, y: 0, width, height };
    }
    
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    return { x, y, width, height };
  }

  /**
   * Validate that all expected districts are present
   */
  validateCompleteness(): { missing: string[]; extra: string[]; total: number } {
    const { DISTRICTS_NEPAL } = require('@/lib/puzzle');
    
    const foundDistricts = new Set(Array.from(this.districtPaths.values()).map(d => d.name));
    const expectedDistricts = new Set(DISTRICTS_NEPAL);
    
    const missing = DISTRICTS_NEPAL.filter((d: string) => !foundDistricts.has(d));
    const extra = Array.from(foundDistricts).filter(d => !expectedDistricts.has(d));
    
    return {
      missing,
      extra,
      total: this.districtPaths.size
    };
  }

  /**
   * Generate React components for all districts
   */
  generateDistrictComponents(
    gameState: {
      startDistrict: string;
      endDistrict: string;
      correctGuesses: string[];
      isGameWon: boolean;
    },
    handlers: {
      onClick?: (districtName: string) => void;
      onHover?: (districtName: string | null) => void;
    }
  ): React.ReactElement[] {
    const { getDistrictState } = require('./map-utils');
    
    return Array.from(this.districtPaths.values()).map(({ id, name, path }) => {
      const state = getDistrictState(name, gameState);
      
      return React.createElement(DistrictPath, {
        key: id,
        id,
        name,
        pathData: path,
        state,
        gameState,
        onClick: handlers.onClick,
        onHover: handlers.onHover,
      });
    });
  }
}

// Utility function to load and process SVG map
export const loadSVGMap = async (svgUrl: string): Promise<SVGMapProcessor> => {
  try {
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.statusText}`);
    }
    
    const svgContent = await response.text();
    return new SVGMapProcessor(svgContent);
  } catch (error) {
    console.error('Error loading SVG map:', error);
    throw error;
  }
};

export default DistrictPath;