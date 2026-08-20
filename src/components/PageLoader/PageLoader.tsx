import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ripple */}
        <div className="absolute w-16 h-16 rounded-full bg-orange-500/20 animate-ping" />
        {/* Spinning gradient ring */}
        <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-orange-500 border-r-orange-400 animate-spin" />
        {/* Center dot */}
        <div className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 shadow-lg shadow-orange-500/50" />
      </div>
      <div className="flex flex-col items-center space-y-1">
        <p className="text-sm font-semibold tracking-wide bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 bg-clip-text text-transparent animate-pulse">
          Loading Freshers Hub
        </p>
        <p className="text-xs text-muted-foreground">Preparing your campus experience...</p>
      </div>
    </div>
  );
};

export default PageLoader;
