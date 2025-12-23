import { ReactNode } from 'react';

interface PolaroidCardProps {
  imageUrl?: string;
  caption?: string;
  rotation?: number;
  mood?: string;
  paperType?: 'vintage' | 'cream' | 'kraft' | 'white';
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const paperStyles = {
  vintage: 'bg-paper-vintage',
  cream: 'bg-cream',
  kraft: 'bg-paper-kraft',
  white: 'bg-polaroid-white',
};

export const PolaroidCard = ({
  imageUrl,
  caption,
  rotation = -2,
  mood,
  paperType = 'white',
  children,
  className = '',
  onClick,
}: PolaroidCardProps) => {
  return (
    <div
      className={`
        polaroid-card film-grain cursor-pointer
        ${paperStyles[paperType]}
        ${className}
      `}
      style={{ '--rotation': `${rotation}deg` } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Photo area */}
      <div className={`
        relative aspect-square rounded-sm overflow-hidden
        bg-muted shadow-inner-soft
        ${mood || ''}
      `}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Polaroid photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {children || (
              <span className="text-muted-foreground/50 text-sm">
                Click to capture
              </span>
            )}
          </div>
        )}
        
        {/* Film grain overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
      
      {/* Caption area */}
      {caption && (
        <div className="mt-3 px-1">
          <p className="font-handwriting text-lg text-ink-warm leading-snug">
            {caption}
          </p>
        </div>
      )}
      
      {/* Paper texture overlay */}
      <div className="absolute inset-0 rounded-lg pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </div>
  );
};
