import React from 'react';

interface GameHeaderProps {
  startDistrict: string;
  endDistrict: string;
  mode: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  startDistrict,
  endDistrict,
  mode,
}) => (
  <header className="flex flex-wrap items-center gap-4 px-4 py-2 bg-background/80 rounded-lg border border-border shadow-sm w-fit">
    <div className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
      <span className="text-primary">{startDistrict}</span>
      <span className="text-muted-foreground">→</span>
      <span className="text-primary">{endDistrict}</span>
    </div>
  </header>
);

export default GameHeader; 