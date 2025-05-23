import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Enhanced Interactive Map with Click-to-Select and Zoom
export function InteractiveNepalMap({ 
  guessedPath, 
  correctPath, 
  startDistrict, 
  endDistrict,
  onDistrictClick,
  showAdjacencies = false,
  showHints = false,
  className 
}: {
  guessedPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
  onDistrictClick?: (district: string) => void;
  showAdjacencies?: boolean;
  showHints?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // Touch state for pinch-to-zoom
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  
  // Map control functions
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Touch event handlers for pinch-to-zoom and pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current && lastTouchCenter.current) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = newDistance / lastTouchDistance.current;
      setZoom(prev => {
        const nextZoom = Math.max(0.5, Math.min(prev * scaleChange, 3));
        return nextZoom;
      });
      lastTouchDistance.current = newDistance;
      // Optionally, update pan to keep center stable
    } else if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (e.touches.length < 2) {
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
    }
  };
  
  // District click handler
  const handleDistrictClick = useCallback((districtName: string) => {
    if (onDistrictClick && districtName !== startDistrict && districtName !== endDistrict) {
      onDistrictClick(districtName);
    }
  }, [onDistrictClick, startDistrict, endDistrict]);
  
  // Enhanced district styling based on state
  const getDistrictClass = (districtName: string) => {
    const normalizedName = districtName.toLowerCase();
    const isStart = normalizedName === startDistrict.toLowerCase();
    const isEnd = normalizedName === endDistrict.toLowerCase();
    const isGuessed = guessedPath.some(d => d.toLowerCase() === normalizedName);
    const isCorrect = correctPath.some(d => d.toLowerCase() === normalizedName);
    const isHovered = hoveredDistrict === normalizedName;
    let base = '';
    if (isStart) base = 'district-start';
    else if (isEnd) base = 'district-end';
    else if (isGuessed && isCorrect) base = 'district-guessed-correct';
    else if (isGuessed && !isCorrect) base = 'district-guessed-incorrect';
    else if (isCorrect && showHints) base = 'district-hint';
    else if (isHovered) base = 'district-hovered';
    else base = 'district-default';
    // Add larger tap area for mobile
    return `${base} mobile-tap-target`;
  };
  
  // Mock adjacency highlighting (you'll need your actual adjacency data)
  const getAdjacentDistricts = (district: string): string[] => {
    // This would use your actual DISTRICT_ADJACENCY data
    // For demo purposes, returning empty array
    return [];
  };
  
  // Helper: get coordinates for a district name
  const getDistrictCoords = (name: string) => {
    // For demo, use the sample districts array
    const sample = [
      { name: 'kathmandu', x: 400, y: 300, width: 60, height: 40 },
      { name: 'lalitpur', x: 420, y: 320, width: 50, height: 35 },
      { name: 'bhaktapur', x: 450, y: 290, width: 55, height: 38 },
      { name: 'chitwan', x: 350, y: 380, width: 70, height: 45 },
      { name: 'pokhara', x: 250, y: 280, width: 65, height: 42 }
    ];
    const d = sample.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (!d) return null;
    return { x: d.x + d.width / 2, y: d.y + d.height / 2 };
  };

  // Animated path completion logic
  const correctGuesses = guessedPath.filter(d => correctPath.map(x => x.toLowerCase()).includes(d.toLowerCase()));
  const pathDistricts = [startDistrict, ...correctGuesses, endDistrict];
  const pathCoords = pathDistricts.map(getDistrictCoords).filter(Boolean);

  return (
    <div className="relative bg-white rounded-lg border overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button size="sm" variant="outline" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      {/* District Info Panel */}
      {hoveredDistrict && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
          <h4 className="font-semibold capitalize">{hoveredDistrict}</h4>
          <div className="text-sm text-muted-foreground">
            {hoveredDistrict === startDistrict.toLowerCase() && "🟡 Start District"}
            {hoveredDistrict === endDistrict.toLowerCase() && "🔴 End District"}
            {guessedPath.some(d => d.toLowerCase() === hoveredDistrict) && "✅ Your Guess"}
            {correctPath.some(d => d.toLowerCase() === hoveredDistrict) && 
             !guessedPath.some(d => d.toLowerCase() === hoveredDistrict) && 
             showHints && "💡 Correct Path"}
          </div>
          {onDistrictClick && hoveredDistrict !== startDistrict.toLowerCase() && 
           hoveredDistrict !== endDistrict.toLowerCase() && (
            <Button 
              size="sm" 
              className="mt-2 w-full" 
              onClick={() => handleDistrictClick(hoveredDistrict)}
            >
              Select District
            </Button>
          )}
        </div>
      )}
      {/* SVG Map */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-[50vw] max-h-[60vw] min-h-[250px] md:h-[400px] cursor-move touch-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background */}
        <rect width="800" height="600" fill="#f8f9fa" />
        {/* Animated Path Completion */}
        {pathCoords.length > 1 && (
          <g>
            {pathCoords.slice(0, -1).map((pt, i) => {
              const next = pathCoords[i + 1];
              if (!pt || !next) return null;
              // Completed if i < correctGuesses.length
              const isCompleted = i < correctGuesses.length;
              return (
                <line
                  key={i}
                  x1={pt.x}
                  y1={pt.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={isCompleted ? '#22c55e' : '#d1d5db'}
                  strokeWidth={6}
                  strokeDasharray={isCompleted ? '0' : '8,8'}
                  style={{ transition: 'stroke 0.5s, stroke-dasharray 0.5s' }}
                />
              );
            })}
          </g>
        )}
        {/* Sample Districts (replace with your actual SVG paths) */}
        {[
          { name: 'kathmandu', x: 400, y: 300, width: 60, height: 40 },
          { name: 'lalitpur', x: 420, y: 320, width: 50, height: 35 },
          { name: 'bhaktapur', x: 450, y: 290, width: 55, height: 38 },
          { name: 'chitwan', x: 350, y: 380, width: 70, height: 45 },
          { name: 'pokhara', x: 250, y: 280, width: 65, height: 42 }
        ].map((district) => (
          <g key={district.name}>
            {/* District Shape */}
            <rect
              x={district.x}
              y={district.y}
              width={district.width}
              height={district.height}
              rx={10}
              className={getDistrictClass(district.name)}
              onMouseEnter={() => setHoveredDistrict(district.name)}
              onMouseLeave={() => setHoveredDistrict(null)}
              onClick={() => handleDistrictClick(district.name)}
              stroke="#888"
              strokeWidth={2}
              style={{
                cursor: onDistrictClick ? 'pointer' : 'default',
              }}
            />
            {/* District Label */}
            <text
              x={district.x + district.width / 2}
              y={district.y + district.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium pointer-events-none"
              fill="currentColor"
            >
              {district.name.charAt(0).toUpperCase() + district.name.slice(1)}
            </text>
            {/* Adjacency Lines (if enabled) */}
            {showAdjacencies && hoveredDistrict === district.name && 
             getAdjacentDistricts(district.name).map((adjacent) => {
               // You'd calculate actual positions here
               return (
                 <line
                   key={adjacent}
                   x1={district.x + district.width / 2}
                   y1={district.y + district.height / 2}
                   x2={district.x + district.width / 2 + 50} // Mock position
                   y2={district.y + district.height / 2 + 30} // Mock position
                   stroke="#3b82f6"
                   strokeWidth="2"
                   strokeDasharray="5,5"
                   className="animate-pulse"
                 />
               );
             })}
          </g>
        ))}
        {/* Path Visualization */}
        {correctPath.length > 1 && showHints && (
          <g>
            {correctPath.slice(0, -1).map((district, index) => {
              const nextDistrict = correctPath[index + 1];
              // You'd calculate actual positions from your SVG data
              return (
                <line
                  key={`${district}-${nextDistrict}`}
                  x1={300 + index * 50} // Mock positions
                  y1={300}
                  x2={350 + index * 50}
                  y2={300}
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  className="animate-pulse"
                />
              );
            })}
          </g>
        )}
      </svg>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border">
        <h5 className="font-semibold mb-2 text-sm">Legend</h5>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-400 rounded"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-red-400 rounded"></div>
            <span>End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-400 rounded"></div>
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-red-200 rounded"></div>
            <span>Incorrect</span>
          </div>
          {showHints && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-blue-200 rounded border-2 border-blue-400 border-dashed"></div>
              <span>Hint</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hint System Component
export function HintSystem({ 
  puzzle, 
  guessedDistricts, 
  hintsUsed, 
  onUseHint 
}: {
  puzzle: any;
  guessedDistricts: string[];
  hintsUsed: number;
  onUseHint: (hintType: string) => void;
}) {
  const availableHints = [
    {
      id: 'reveal-next',
      name: 'Reveal Next District',
      description: 'Show the next district in the path',
      cost: 1,
      icon: '🎯'
    },
    {
      id: 'show-adjacencies',
      name: 'Show Connections',
      description: 'Highlight districts connected to correct path',
      cost: 1,
      icon: '🔗'
    },
    {
      id: 'eliminate-regions',
      name: 'Eliminate Regions',
      description: 'Gray out districts not in the path',
      cost: 2,
      icon: '❌'
    },
    {
      id: 'show-direction',
      name: 'Show Direction',
      description: 'Indicate general direction of path',
      cost: 1,
      icon: '🧭'
    }
  ];
  
  const maxHints = 3;
  const remainingHints = maxHints - hintsUsed;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Hints Available</h3>
        <span className="text-sm text-muted-foreground">
          {remainingHints}/{maxHints} remaining
        </span>
      </div>
      <div className="grid gap-2">
        {availableHints.map((hint) => (
          <Button
            key={hint.id}
            variant="outline"
            className="justify-start h-auto p-3"
            disabled={remainingHints < hint.cost}
            onClick={() => onUseHint(hint.id)}
          >
            <div className="flex items-start gap-3 w-full">
              <span className="text-lg">{hint.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{hint.name}</div>
                <div className="text-sm text-muted-foreground">
                  {hint.description}
                </div>
              </div>
              <div className="text-xs bg-muted px-2 py-1 rounded">
                {hint.cost} {hint.cost === 1 ? 'hint' : 'hints'}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
} 