import { useEffect, useState } from 'react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'lily' | 'bubble' | 'dust';
}

export const FloatingElements = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const newElements: FloatingElement[] = [];
    
    // Create floating elements
    for (let i = 0; i < 12; i++) {
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 4,
        type: i % 3 === 0 ? 'lily' : i % 3 === 1 ? 'bubble' : 'dust',
      });
    }
    
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute opacity-20"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: el.size,
            height: el.size,
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
          }}
        >
          {el.type === 'lily' && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-full h-full animate-float-gentle text-primary"
              style={{ animationDelay: `${el.delay}s` }}
            >
              <path
                d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c2.5 0 4.5 2 4.5 4.5S14.5 14 12 14s-4.5-2-4.5-4.5S9.5 5 12 5z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
          )}
          {el.type === 'bubble' && (
            <div
              className="w-full h-full rounded-full bg-secondary animate-float-slow"
              style={{ 
                animationDelay: `${el.delay}s`,
                opacity: 0.3,
              }}
            />
          )}
          {el.type === 'dust' && (
            <div
              className="w-full h-full rounded-full bg-primary animate-pulse-soft"
              style={{ 
                animationDelay: `${el.delay}s`,
                opacity: 0.2,
              }}
            />
          )}
        </div>
      ))}
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-background/20" />
    </div>
  );
};
