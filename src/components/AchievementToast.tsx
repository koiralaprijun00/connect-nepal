import React from 'react';

export function AchievementToast({ 
  achievement, 
  onClose 
}: { 
  achievement: { emoji: string; label: string; description: string };
  onClose: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-xl border-2 border-yellow-300 animate-in slide-in-from-right-5">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{achievement.emoji}</div>
        <div>
          <div className="font-bold text-lg">Achievement Unlocked!</div>
          <div className="font-semibold">{achievement.label}</div>
          <div className="text-sm opacity-90">{achievement.description}</div>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 text-white/80 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
} 