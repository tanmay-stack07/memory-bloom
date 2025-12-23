interface CameraIconProps {
  className?: string;
}

export const CameraIcon = ({ className = '' }: CameraIconProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Breathing glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-3xl animate-breathe" />
      
      {/* Camera body */}
      <svg
        viewBox="0 0 120 100"
        fill="none"
        className="relative w-full h-full drop-shadow-soft-lg"
      >
        {/* Camera body gradient */}
        <defs>
          <linearGradient id="cameraBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--cream))" />
            <stop offset="100%" stopColor="hsl(var(--cream-dark))" />
          </linearGradient>
          <linearGradient id="lens" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--foreground) / 0.8)" />
            <stop offset="50%" stopColor="hsl(var(--foreground) / 0.6)" />
            <stop offset="100%" stopColor="hsl(var(--foreground) / 0.4)" />
          </linearGradient>
          <radialGradient id="lensGlass" cx="30%" cy="30%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(var(--foreground) / 0.3)" />
            <stop offset="100%" stopColor="hsl(var(--foreground) / 0.6)" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(var(--shadow-soft))" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Main body */}
        <rect
          x="10"
          y="25"
          width="100"
          height="65"
          rx="12"
          fill="url(#cameraBody)"
          filter="url(#softShadow)"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
        
        {/* Top bump (viewfinder housing) */}
        <rect
          x="25"
          y="12"
          width="30"
          height="18"
          rx="6"
          fill="url(#cameraBody)"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
        
        {/* Flash */}
        <rect
          x="70"
          y="18"
          width="20"
          height="12"
          rx="3"
          fill="hsl(var(--muted))"
          opacity="0.8"
        />
        
        {/* Lens outer ring */}
        <circle
          cx="60"
          cy="57"
          r="28"
          fill="url(#lens)"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        
        {/* Lens inner */}
        <circle
          cx="60"
          cy="57"
          r="22"
          fill="url(#lensGlass)"
        />
        
        {/* Lens reflection */}
        <ellipse
          cx="52"
          cy="50"
          rx="6"
          ry="4"
          fill="white"
          opacity="0.4"
        />
        
        {/* Shutter button */}
        <circle
          cx="95"
          cy="20"
          r="8"
          fill="hsl(var(--primary))"
          className="animate-pulse-soft"
        />
        
        {/* Small decorative elements */}
        <circle cx="22" cy="35" r="3" fill="hsl(var(--muted))" opacity="0.6" />
        <circle cx="98" cy="80" r="2" fill="hsl(var(--accent))" opacity="0.4" />
      </svg>
    </div>
  );
};
