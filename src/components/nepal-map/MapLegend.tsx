import React from 'react';
import { cn } from '@/lib/utils';

interface MapLegendProps {
  startDistrict: string;
  endDistrict: string;
  correctGuessCount: number;
  incorrectGuessCount?: number;
  showIncorrect?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  variant?: 'compact' | 'detailed' | 'minimal';
  className?: string;
}

interface LegendItem {
  color: string;
  borderColor: string;
  label: string;
  count?: number;
  description?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  startDistrict,
  endDistrict,
  correctGuessCount,
  incorrectGuessCount = 0,
  showIncorrect = false,
  position = 'top-right',
  variant = 'detailed',
  className = ""
}) => {
  // Define legend items
  const legendItems: LegendItem[] = [
    {
      color: 'bg-green-500',
      borderColor: 'border-green-700',
      label: 'Start District',
      description: startDistrict,
    },
    {
      color: 'bg-red-500',
      borderColor: 'border-red-700',
      label: 'End District',
      description: endDistrict,
    },
    {
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-700',
      label: 'Correct Guess',
      count: correctGuessCount,
      description: correctGuessCount === 1 ? '1 correct guess' : `${correctGuessCount} correct guesses`,
    },
  ];

  // Add incorrect guesses if enabled
  if (showIncorrect && incorrectGuessCount > 0) {
    legendItems.push({
      color: 'bg-pink-300',
      borderColor: 'border-pink-500',
      label: 'Incorrect Guess',
      count: incorrectGuessCount,
      description: incorrectGuessCount === 1 ? '1 incorrect guess' : `${incorrectGuessCount} incorrect guesses`,
    });
  }

  // Add default districts item
  legendItems.push({
    color: 'bg-gray-200',
    borderColor: 'border-gray-400',
    label: 'Other Districts',
    description: 'Unguessed districts',
  });

  // Position classes for floating legend
  const positionClasses = {
    'top-right': 'absolute top-4 right-4',
    'top-left': 'absolute top-4 left-4',
    'bottom-right': 'absolute bottom-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    'inline': 'relative',
  };

  // Variant-specific styling
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'compact':
        return 'p-2 text-xs';
      case 'minimal':
        return 'p-2 text-xs bg-white/80';
      case 'detailed':
      default:
        return 'p-3 text-sm';
    }
  };

  const baseClasses = cn(
    "bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200",
    positionClasses[position],
    getVariantClasses(variant),
    className
  );

  // Render minimal version
  if (variant === 'minimal') {
    return (
      <div className={baseClasses}>
        <div className="flex items-center gap-2 flex-wrap">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className={cn("w-3 h-2 rounded-sm border", item.color, item.borderColor)} />
              <span className="text-xs text-gray-700">
                {item.label.split(' ')[0]}
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-1 font-medium">({item.count})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render compact version
  if (variant === 'compact') {
    return (
      <div className={baseClasses}>
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Map Legend</h3>
        <div className="space-y-1">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={cn("w-4 h-3 rounded border", item.color, item.borderColor)} />
              <span className="text-xs text-gray-700">
                {item.label}
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-1 font-medium text-gray-900">({item.count})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render detailed version (default)
  return (
    <div className={baseClasses}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Map Legend</h3>
        {(correctGuessCount > 0 || (showIncorrect && incorrectGuessCount > 0)) && (
          <div className="text-xs text-gray-500">
            Progress: {correctGuessCount} correct
            {showIncorrect && incorrectGuessCount > 0 && `, ${incorrectGuessCount} incorrect`}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={cn("w-5 h-4 rounded border mt-0.5 flex-shrink-0", item.color, item.borderColor)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {item.count}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5 truncate" title={item.description}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional game info */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>Route:</span>
            <span className="font-medium">
              <span className="text-green-600">{startDistrict}</span>
              {" → "}
              <span className="text-red-600">{endDistrict}</span>
            </span>
          </div>
          {correctGuessCount > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span>Progress:</span>
              <span className="font-medium text-yellow-600">
                {correctGuessCount} district{correctGuessCount !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Standalone legend for use outside of map
export const StandaloneLegend: React.FC<Omit<MapLegendProps, 'position'>> = (props) => {
  return <MapLegend {...props} position="inline" />;
};

// Quick legend for mobile or tight spaces
export const QuickLegend: React.FC<{
  correctCount: number;
  incorrectCount?: number;
  className?: string;
}> = ({ correctCount, incorrectCount = 0, className = "" }) => {
  return (
    <div className={cn("flex items-center gap-3 text-xs text-gray-600", className)}>
      <div className="flex items-center gap-1">
        <div className="w-3 h-2 bg-green-500 rounded-sm border border-green-700" />
        <span>Start</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-2 bg-red-500 rounded-sm border border-red-700" />
        <span>End</span>
      </div>
      {correctCount > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-yellow-500 rounded-sm border border-yellow-700" />
          <span>Correct ({correctCount})</span>
        </div>
      )}
      {incorrectCount > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-pink-300 rounded-sm border border-pink-500" />
          <span>Wrong ({incorrectCount})</span>
        </div>
      )}
    </div>
  );
};

export default MapLegend;