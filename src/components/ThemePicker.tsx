import { useState } from 'react';
import { Palette, Check } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  preview: string;
}

interface Theme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  card: string;
  muted: string;
  cream: string;
  preview: string;
}

const themes: Theme[] = [
  { 
    id: 'vintage', 
    name: 'Vintage Camera', 
    primary: '24 60% 65%', 
    accent: '340 35% 75%', 
    background: '36 33% 97%',
    card: '40 30% 96%',
    muted: '36 20% 92%',
    cream: '40 30% 96%',
    preview: 'bg-[hsl(24,60%,65%)]' 
  },
  { 
    id: 'pastel', 
    name: 'Soft Pastel', 
    primary: '340 35% 75%', 
    accent: '200 30% 85%', 
    background: '340 30% 97%',
    card: '340 25% 96%',
    muted: '340 20% 93%',
    cream: '340 25% 96%',
    preview: 'bg-[hsl(340,35%,75%)]' 
  },
  { 
    id: 'ocean', 
    name: 'Ocean Dream', 
    primary: '200 40% 60%', 
    accent: '180 35% 75%', 
    background: '200 30% 96%',
    card: '200 25% 95%',
    muted: '200 20% 92%',
    cream: '200 25% 95%',
    preview: 'bg-[hsl(200,40%,60%)]' 
  },
  { 
    id: 'film', 
    name: 'Film Lab', 
    primary: '45 50% 55%', 
    accent: '30 40% 70%', 
    background: '45 35% 96%',
    card: '45 30% 95%',
    muted: '45 25% 92%',
    cream: '45 30% 95%',
    preview: 'bg-[hsl(45,50%,55%)]' 
  },
  { 
    id: 'rose', 
    name: 'Dusty Rose', 
    primary: '350 35% 65%', 
    accent: '20 30% 80%', 
    background: '350 25% 97%',
    card: '350 20% 96%',
    muted: '350 15% 93%',
    cream: '350 20% 96%',
    preview: 'bg-[hsl(350,35%,65%)]' 
  },
  { 
    id: 'sage', 
    name: 'Quiet Sage', 
    primary: '140 25% 55%', 
    accent: '100 20% 75%', 
    background: '140 20% 96%',
    card: '140 18% 95%',
    muted: '140 15% 92%',
    cream: '140 18% 95%',
    preview: 'bg-[hsl(140,25%,55%)]' 
  },
];

interface ThemePickerProps {
  isOpen: boolean;
  onToggle: () => void;
  onThemeChange?: (theme: Theme) => void;
}

export const ThemePicker = ({ isOpen, onToggle, onThemeChange }: ThemePickerProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('vintage');

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.id);
    
    // Apply theme to CSS variables - including background
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--background', theme.background);
    document.documentElement.style.setProperty('--card', theme.card);
    document.documentElement.style.setProperty('--muted', theme.muted);
    document.documentElement.style.setProperty('--cream', theme.cream);
    
    onThemeChange?.(theme);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="btn-soft flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Palette className="w-4 h-4" />
        <span>Theme</span>
      </button>

      {/* Theme Panel */}
      {isOpen && (
        <div className="absolute top-full mt-3 right-0 w-64 p-4 bg-card rounded-2xl shadow-soft-xl animate-scale-in origin-top-right z-50">
          <h3 className="text-sm font-medium text-foreground mb-3">Choose Theme</h3>
          
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className={`
                  relative group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all
                  hover:bg-muted/50
                  ${selectedTheme === theme.id ? 'bg-muted' : ''}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full ${theme.preview} shadow-soft
                  transition-transform group-hover:scale-110
                  ${selectedTheme === theme.id ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card' : ''}
                `}>
                  {selectedTheme === theme.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground text-center leading-tight">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
