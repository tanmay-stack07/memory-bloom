import { useState } from 'react';
import { 
  X, Check, Type, Sparkles, RotateCcw, 
  FlipHorizontal, FlipVertical, SunMedium, Droplets, Palette
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PhotoEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string, caption: string) => void;
}

interface Filter {
  id: string;
  name: string;
  filter: string;
  category: 'mood' | 'film' | 'artistic' | 'color';
}

const filters: Filter[] = [
  // Mood filters
  { id: 'none', name: 'Original', filter: '', category: 'mood' },
  { id: 'memory', name: 'Old Memory', filter: 'sepia(25%) saturate(85%) brightness(105%) contrast(95%)', category: 'mood' },
  { id: 'joy', name: 'Joyful', filter: 'saturate(115%) brightness(108%) contrast(98%)', category: 'mood' },
  { id: 'night', name: 'Quiet Night', filter: 'saturate(70%) brightness(90%) contrast(105%) hue-rotate(10deg)', category: 'mood' },
  { id: 'analog', name: 'Analog', filter: 'sepia(15%) saturate(90%) brightness(102%) contrast(92%)', category: 'mood' },
  { id: 'candle', name: 'Candlelight', filter: 'sepia(30%) saturate(95%) brightness(100%) contrast(95%)', category: 'mood' },
  { id: 'carefree', name: 'Carefree', filter: 'saturate(105%) brightness(105%) contrast(96%) hue-rotate(5deg)', category: 'mood' },
  
  // Film filters
  { id: 'kodak', name: 'Kodak Gold', filter: 'sepia(15%) saturate(120%) brightness(102%) contrast(95%) hue-rotate(-5deg)', category: 'film' },
  { id: 'portra', name: 'Portra 400', filter: 'saturate(95%) brightness(105%) contrast(90%) sepia(8%)', category: 'film' },
  { id: 'fuji', name: 'Fuji Superia', filter: 'saturate(110%) brightness(100%) contrast(105%) hue-rotate(5deg)', category: 'film' },
  { id: 'ektar', name: 'Ektar 100', filter: 'saturate(130%) brightness(100%) contrast(110%)', category: 'film' },
  { id: 'cinestill', name: 'CineStill', filter: 'saturate(105%) brightness(95%) contrast(110%) hue-rotate(-10deg)', category: 'film' },
  { id: 'expired', name: 'Expired Film', filter: 'sepia(20%) saturate(75%) brightness(95%) contrast(85%) hue-rotate(15deg)', category: 'film' },
  
  // Artistic filters
  { id: 'vintage', name: 'Vintage', filter: 'sepia(40%) saturate(70%) brightness(95%) contrast(90%)', category: 'artistic' },
  { id: 'faded', name: 'Faded', filter: 'saturate(60%) brightness(105%) contrast(85%)', category: 'artistic' },
  { id: 'dramatic', name: 'Dramatic', filter: 'saturate(90%) brightness(90%) contrast(130%)', category: 'artistic' },
  { id: 'dreamy', name: 'Dreamy', filter: 'saturate(85%) brightness(110%) contrast(85%) blur(0.3px)', category: 'artistic' },
  { id: 'noir', name: 'Film Noir', filter: 'grayscale(100%) contrast(120%) brightness(95%)', category: 'artistic' },
  { id: 'cross', name: 'Cross Process', filter: 'saturate(120%) contrast(110%) hue-rotate(20deg)', category: 'artistic' },
  
  // Color filters
  { id: 'warm', name: 'Warm', filter: 'sepia(20%) saturate(110%) brightness(105%)', category: 'color' },
  { id: 'cool', name: 'Cool', filter: 'saturate(90%) brightness(100%) hue-rotate(15deg)', category: 'color' },
  { id: 'rose', name: 'Rose', filter: 'saturate(100%) brightness(102%) hue-rotate(-15deg)', category: 'color' },
  { id: 'teal', name: 'Teal', filter: 'saturate(95%) brightness(100%) hue-rotate(30deg)', category: 'color' },
  { id: 'golden', name: 'Golden Hour', filter: 'sepia(25%) saturate(130%) brightness(105%) contrast(95%)', category: 'color' },
  { id: 'lavender', name: 'Lavender', filter: 'saturate(90%) brightness(102%) hue-rotate(-25deg)', category: 'color' },
];

const categories = [
  { id: 'mood', name: 'Mood', icon: Sparkles },
  { id: 'film', name: 'Film Stock', icon: Palette },
  { id: 'artistic', name: 'Artistic', icon: Droplets },
  { id: 'color', name: 'Color', icon: SunMedium },
];

export const PhotoEditor = ({ imageUrl, isOpen, onClose, onSave }: PhotoEditorProps) => {
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [activeCategory, setActiveCategory] = useState<string>('mood');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [warmth, setWarmth] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [grain, setGrain] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  const getCurrentFilterStyle = () => {
    const filter = filters.find(f => f.id === selectedFilter);
    return filter?.filter || '';
  };

  const getTransformStyle = () => {
    const transforms = [];
    if (flipH) transforms.push('scaleX(-1)');
    if (flipV) transforms.push('scaleY(-1)');
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    return transforms.join(' ');
  };

  const getFilterStyle = () => {
    const baseFilter = getCurrentFilterStyle();
    const adjustments = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${warmth}deg)`;
    return baseFilter ? `${baseFilter} ${adjustments}` : adjustments;
  };

  const handleReset = () => {
    setSelectedFilter('none');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setVignette(0);
    setGrain(0);
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

  const filteredFilters = filters.filter(f => f.category === activeCategory);

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
                  {/* Vignette overlay */}
                  {vignette > 0 && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        background: `radial-gradient(circle, transparent ${100 - vignette}%, rgba(0,0,0,${vignette / 100}) 100%)`
                      }}
                    />
                  )}
                  {/* Grain overlay */}
                  {grain > 0 && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        opacity: grain / 100,
                      }}
                    />
                  )}
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
          <div className="lg:w-96 space-y-4 overflow-y-auto max-h-[60vh] lg:max-h-none">
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

            {/* Filter Categories */}
            <div className="bg-card rounded-2xl p-4">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all
                        ${activeCategory === cat.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {filteredFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden transition-all
                      ${selectedFilter === filter.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : 'hover:opacity-80'}
                    `}
                  >
                    <img
                      src={imageUrl}
                      alt={filter.name}
                      className="w-full h-full object-cover"
                      style={{ filter: filter.filter || undefined }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-1">
                      <span className="text-[9px] text-background font-medium leading-tight block truncate">{filter.name}</span>
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
                  <span className="text-foreground font-medium w-12 text-right">{brightness}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  min={50}
                  max={150}
                  step={1}
                  onValueChange={([v]) => setBrightness(v)}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contrast</span>
                  <span className="text-foreground font-medium w-12 text-right">{contrast}%</span>
                </div>
                <Slider
                  value={[contrast]}
                  min={50}
                  max={150}
                  step={1}
                  onValueChange={([v]) => setContrast(v)}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Saturation</span>
                  <span className="text-foreground font-medium w-12 text-right">{saturation}%</span>
                </div>
                <Slider
                  value={[saturation]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={([v]) => setSaturation(v)}
                  className="w-full"
                />
              </div>

              {/* Warmth */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Warmth</span>
                  <span className="text-foreground font-medium w-12 text-right">{warmth > 0 ? '+' : ''}{warmth}°</span>
                </div>
                <Slider
                  value={[warmth]}
                  min={-30}
                  max={30}
                  step={1}
                  onValueChange={([v]) => setWarmth(v)}
                  className="w-full"
                />
              </div>

              {/* Vignette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vignette</span>
                  <span className="text-foreground font-medium w-12 text-right">{vignette}%</span>
                </div>
                <Slider
                  value={[vignette]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={([v]) => setVignette(v)}
                  className="w-full"
                />
              </div>

              {/* Grain */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Film Grain</span>
                  <span className="text-foreground font-medium w-12 text-right">{grain}%</span>
                </div>
                <Slider
                  value={[grain]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([v]) => setGrain(v)}
                  className="w-full"
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
