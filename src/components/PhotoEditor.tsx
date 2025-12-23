import { useState } from 'react';
import { 
  X, Check, Type, Sparkles, RotateCcw, 
  FlipHorizontal, FlipVertical, SunMedium, Contrast
} from 'lucide-react';

interface PhotoEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string, caption: string) => void;
}

interface Mood {
  id: string;
  name: string;
  filter: string;
}

const moods: Mood[] = [
  { id: 'none', name: 'Original', filter: '' },
  { id: 'memory', name: 'Old Memory', filter: 'sepia(25%) saturate(85%) brightness(105%) contrast(95%)' },
  { id: 'joy', name: 'Joyful', filter: 'saturate(115%) brightness(108%) contrast(98%)' },
  { id: 'night', name: 'Quiet Night', filter: 'saturate(70%) brightness(90%) contrast(105%) hue-rotate(10deg)' },
  { id: 'analog', name: 'Analog', filter: 'sepia(15%) saturate(90%) brightness(102%) contrast(92%)' },
  { id: 'candle', name: 'Candlelight', filter: 'sepia(30%) saturate(95%) brightness(100%) contrast(95%)' },
  { id: 'carefree', name: 'Carefree', filter: 'saturate(105%) brightness(105%) contrast(96%) hue-rotate(5deg)' },
];

export const PhotoEditor = ({ imageUrl, isOpen, onClose, onSave }: PhotoEditorProps) => {
  const [caption, setCaption] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  const getCurrentMoodFilter = () => {
    const mood = moods.find(m => m.id === selectedMood);
    return mood?.filter || '';
  };

  const getTransformStyle = () => {
    const transforms = [];
    if (flipH) transforms.push('scaleX(-1)');
    if (flipV) transforms.push('scaleY(-1)');
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    return transforms.join(' ');
  };

  const getFilterStyle = () => {
    const baseFilter = getCurrentMoodFilter();
    const adjustments = `brightness(${brightness}%) contrast(${contrast}%)`;
    return baseFilter ? `${baseFilter} ${adjustments}` : adjustments;
  };

  const handleReset = () => {
    setSelectedMood('none');
    setBrightness(100);
    setContrast(100);
    setFlipH(false);
    setFlipV(false);
    setRotation(0);
  };

  const handleSave = () => {
    // For now, just pass the original image with caption
    // In a full implementation, we'd apply the filters to a canvas
    onSave(imageUrl, caption);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 animate-fade-in overflow-auto">
      <div className="min-h-full flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
          
          <h2 className="font-handwriting text-2xl text-foreground">Edit Photo</h2>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <Check className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Photo preview */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Polaroid frame */}
              <div className="bg-polaroid-white p-3 pb-16 rounded-lg shadow-polaroid">
                <div className="relative aspect-square rounded-sm overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt="Edit preview"
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      filter: getFilterStyle(),
                      transform: getTransformStyle(),
                    }}
                  />
                </div>
                
                {/* Caption area */}
                <div className="absolute bottom-3 left-3 right-3">
                  {showCaptionInput ? (
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write something..."
                      className="w-full bg-transparent border-none outline-none font-handwriting text-xl text-ink-warm placeholder:text-muted-foreground/50"
                      autoFocus
                      onBlur={() => !caption && setShowCaptionInput(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowCaptionInput(true)}
                      className="w-full text-left font-handwriting text-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      {caption || 'Tap to add caption...'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit tools */}
          <div className="lg:w-80 space-y-6">
            {/* Quick actions */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`p-3 rounded-xl transition-all ${flipH ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`p-3 rounded-xl transition-all ${flipV ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
              >
                <FlipVertical className="w-5 h-5" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-3 rounded-xl bg-card hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-card hover:bg-muted transition-colors text-muted-foreground"
              >
                Reset
              </button>
            </div>

            {/* Moods */}
            <div className="bg-card rounded-2xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                Moods
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden transition-all
                      ${selectedMood === mood.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : 'hover:opacity-80'}
                    `}
                  >
                    <img
                      src={imageUrl}
                      alt={mood.name}
                      className="w-full h-full object-cover"
                      style={{ filter: mood.filter || undefined }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-1">
                      <span className="text-[10px] text-background font-medium">{mood.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments */}
            <div className="bg-card rounded-2xl p-4 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <SunMedium className="w-4 h-4 text-primary" />
                Adjustments
              </h3>
              
              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Brightness</span>
                  <span className="text-foreground font-medium">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contrast</span>
                  <span className="text-foreground font-medium">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="bg-card rounded-2xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <Type className="w-4 h-4 text-primary" />
                Caption
              </h3>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something memorable..."
                className="w-full h-24 p-3 bg-muted rounded-xl resize-none font-handwriting text-lg text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
