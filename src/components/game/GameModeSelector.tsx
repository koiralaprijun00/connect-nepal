import React from 'react';

interface GameMode {
  id: string;
  name: string;
  description: string;
}

interface GameModeSelectorProps {
  currentMode: string;
  modes: GameMode[];
  onModeChange: (mode: string) => void;
}

export function GameModeSelector({ currentMode, modes, onModeChange }: GameModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`px-4 py-2 rounded-lg font-semibold border transition-colors shadow-sm text-sm
            ${currentMode === mode.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted border-border text-foreground'}`}
        >
          <div>{mode.name}</div>
          <div className="text-xs opacity-70 font-normal">{mode.description}</div>
        </button>
      ))}
    </div>
  );
} 