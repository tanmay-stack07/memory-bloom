import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

interface Mood {
  id: string;
  name: string;
  description: string;
  className: string;
  gradient: string;
}

const moods: Mood[] = [
  { 
    id: 'memory', 
    name: 'Old Memory', 
    description: 'Nostalgic sepia tones',
    className: 'mood-memory',
    gradient: 'from-amber-200/40 to-orange-100/30'
  },
  { 
    id: 'joy', 
    name: 'Joyful Afternoon', 
    description: 'Warm, bright daylight',
    className: 'mood-joy',
    gradient: 'from-yellow-100/40 to-amber-50/30'
  },
  { 
    id: 'night', 
    name: 'Quiet Night', 
    description: 'Cool, muted tones',
    className: 'mood-night',
    gradient: 'from-slate-300/40 to-blue-200/30'
  },
  { 
    id: 'analog', 
    name: 'Analog Tape', 
    description: 'Film camera aesthetic',
    className: 'mood-analog',
    gradient: 'from-stone-200/40 to-amber-100/30'
  },
  { 
    id: 'candle', 
    name: 'Candlelight', 
    description: 'Warm golden glow',
    className: 'mood-candle',
    gradient: 'from-orange-200/40 to-yellow-100/30'
  },
  { 
    id: 'carefree', 
    name: 'Carefree', 
    description: 'Light and airy',
    className: 'mood-carefree',
    gradient: 'from-teal-100/40 to-cyan-50/30'
  },
];

interface MoodPickerProps {
  selectedMood: string | null;
  onMoodChange: (mood: Mood | null) => void;
}

export const MoodPicker = ({ selectedMood, onMoodChange }: MoodPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    if (selectedMood === mood.id) {
      onMoodChange(null);
    } else {
      onMoodChange(mood);
    }
    setIsOpen(false);
  };

  const currentMood = moods.find(m => m.id === selectedMood);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          btn-soft flex items-center gap-2 text-sm transition-all
          ${currentMood ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
        `}
      >
        <Sparkles className="w-4 h-4" />
        <span>{currentMood?.name || 'Mood'}</span>
      </button>

      {/* Mood Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full mt-3 left-0 w-72 p-4 bg-card rounded-2xl shadow-soft-xl animate-scale-in origin-top-left z-50">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Choose a Mood
            </h3>
            
            <div className="space-y-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                    hover:bg-muted/50
                    ${selectedMood === mood.id ? 'bg-muted ring-1 ring-primary/30' : ''}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg bg-gradient-to-br ${mood.gradient}
                    flex items-center justify-center shadow-inner-soft
                  `}>
                    {selectedMood === mood.id && (
                      <Check className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{mood.name}</p>
                    <p className="text-xs text-muted-foreground">{mood.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedMood && (
              <button
                onClick={() => {
                  onMoodChange(null);
                  setIsOpen(false);
                }}
                className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear mood
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
