import { useState } from 'react';
import { Camera, Sparkles, Heart } from 'lucide-react';
import { FloatingElements } from '@/components/FloatingElements';
import { CameraIcon } from '@/components/CameraIcon';
import { ThemePicker } from '@/components/ThemePicker';
import { MoodPicker } from '@/components/MoodPicker';
import { PolaroidCard } from '@/components/PolaroidCard';
import { CameraView } from '@/components/CameraView';

const Index = () => {
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const handleCapture = (imageDataUrl: string) => {
    setCapturedPhotos(prev => [imageDataUrl, ...prev]);
  };

  const getMoodClass = () => {
    if (!selectedMood) return '';
    return `mood-${selectedMood}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient floating elements */}
      <FloatingElements />

      {/* Film grain overlay */}
      <div className="fixed inset-0 pointer-events-none film-grain z-10" />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent fill-accent" />
          <span className="font-handwriting text-2xl text-foreground">Maith</span>
        </div>

        <div className="flex items-center gap-3">
          <MoodPicker 
            selectedMood={selectedMood} 
            onMoodChange={(mood) => setSelectedMood(mood?.id || null)} 
          />
          <ThemePicker 
            isOpen={isThemePickerOpen} 
            onToggle={() => setIsThemePickerOpen(!isThemePickerOpen)} 
          />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 pb-12">
        {/* Hero section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-handwriting text-5xl md:text-7xl text-foreground mb-4">
            Craft Your Memories
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            Capture moments, turn them into polaroids, and make them truly yours.
          </p>
        </div>

        {/* Camera icon - Main CTA */}
        <div 
          className="relative w-40 h-32 md:w-52 md:h-40 mb-12 cursor-pointer group animate-fade-in-up delay-200"
          onClick={() => setIsCameraOpen(true)}
        >
          <CameraIcon className="w-full h-full transition-transform duration-gentle group-hover:scale-105" />
          
          {/* Click prompt */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-4 h-4" />
            <span>Click to capture</span>
          </div>
        </div>

        {/* Feature hints */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in-up delay-400">
          {[
            { icon: Camera, label: 'Photobooth' },
            { icon: Sparkles, label: 'Moods & Filters' },
            { icon: Heart, label: 'Personal Messages' },
          ].map(({ icon: Icon, label }, index) => (
            <div 
              key={label}
              className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full shadow-soft text-sm text-muted-foreground"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Captured photos gallery */}
        {capturedPhotos.length > 0 && (
          <div className="w-full max-w-4xl animate-fade-in-up">
            <h2 className="font-handwriting text-2xl text-foreground mb-6 text-center">
              Your Memories
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
              {capturedPhotos.map((photo, index) => (
                <div 
                  key={index}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PolaroidCard
                    imageUrl={photo}
                    rotation={(Math.random() - 0.5) * 6}
                    mood={getMoodClass()}
                    caption={index === 0 ? 'Just now ✨' : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state with sample polaroids */}
        {capturedPhotos.length === 0 && (
          <div className="flex flex-wrap justify-center gap-8 animate-fade-in-up delay-500">
            <PolaroidCard 
              rotation={-5} 
              paperType="vintage"
              className="w-44 opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setIsCameraOpen(true)}
            >
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-xs">Your photo here</span>
              </div>
            </PolaroidCard>
            
            <PolaroidCard 
              rotation={3} 
              paperType="cream"
              className="w-44 opacity-40 hover:opacity-100 transition-opacity hidden md:block"
              onClick={() => setIsCameraOpen(true)}
            >
              <div className="flex items-center justify-center h-full">
                <Sparkles className="w-6 h-6 text-muted-foreground/40" />
              </div>
            </PolaroidCard>
            
            <PolaroidCard 
              rotation={-2} 
              paperType="kraft"
              className="w-44 opacity-30 hover:opacity-100 transition-opacity hidden lg:block"
              onClick={() => setIsCameraOpen(true)}
            >
              <div className="flex items-center justify-center h-full">
                <Heart className="w-6 h-6 text-muted-foreground/30" />
              </div>
            </PolaroidCard>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center py-6 text-sm text-muted-foreground">
        <p className="font-handwriting text-lg">
          Made with quiet moments in mind
        </p>
      </footer>

      {/* Camera View */}
      <CameraView
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />

      {/* Click outside to close theme picker */}
      {isThemePickerOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsThemePickerOpen(false)} 
        />
      )}
    </div>
  );
};

export default Index;
