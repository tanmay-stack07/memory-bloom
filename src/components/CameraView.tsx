import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X, Aperture, Sun, Moon, Loader2 } from 'lucide-react';

interface CameraViewProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

type CameraMode = 'instant' | 'film-strip' | 'vintage' | 'daylight';

const cameraModes = [
  { id: 'instant', name: 'Instant', icon: Aperture },
  { id: 'daylight', name: 'Daylight', icon: Sun },
  { id: 'vintage', name: 'Vintage', icon: Moon },
];

export const CameraView = ({ isOpen, onClose, onCapture }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cameraMode, setCameraMode] = useState<CameraMode>('instant');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setIsVideoReady(false);
    setError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsVideoReady(false);
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  const flipCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) return;

    const video = videoRef.current;
    
    // Double-check video dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video not ready');
      return;
    }

    setIsCountingDown(true);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          
          // Capture the photo
          const canvas = canvasRef.current!;
          const ctx = canvas.getContext('2d')!;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Apply mode-specific filters
          if (cameraMode === 'vintage') {
            ctx.filter = 'sepia(30%) saturate(80%) contrast(90%)';
          } else if (cameraMode === 'daylight') {
            ctx.filter = 'brightness(110%) saturate(105%)';
          } else {
            ctx.filter = 'none';
          }
          
          ctx.drawImage(video, 0, 0);
          
          // Reset filter before getting image data
          ctx.filter = 'none';
          
          // Add film grain effect
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const noise = (Math.random() - 0.5) * 15;
              data[i] = Math.min(255, Math.max(0, data[i] + noise));
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
            
            ctx.putImageData(imageData, 0, 0);
          } catch (e) {
            console.warn('Could not apply grain effect:', e);
          }
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          onCapture(dataUrl);
          setIsCountingDown(false);
          onClose();
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/90 animate-fade-in">
      <div className="h-full flex flex-col items-center justify-center p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-background/20 text-background hover:bg-background/30 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Error state */}
        {error && (
          <div className="text-center text-background">
            <p className="mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-background/20 rounded-lg hover:bg-background/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Camera viewport */}
        {!error && (
          <div className="relative max-w-2xl w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-soft-xl">
            {/* Loading state */}
            {!isVideoReady && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/80">
                <Loader2 className="w-8 h-8 text-background animate-spin" />
              </div>
            )}

            {/* Film frame overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="absolute inset-4 border-4 border-background/20 rounded-lg" />
              <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-background/40 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-background/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-background/40 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-background/40 rounded-br-lg" />
            </div>

            {/* Video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={handleVideoReady}
              className={`
                w-full h-full object-cover
                ${cameraMode === 'vintage' ? 'sepia-[0.3] saturate-[0.8]' : ''}
                ${cameraMode === 'daylight' ? 'brightness-110 saturate-105' : ''}
              `}
            />

            {/* Grain overlay */}
            <div className="absolute inset-0 z-20 opacity-10 pointer-events-none film-grain" />

            {/* Countdown overlay */}
            {isCountingDown && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/50">
                <span className="text-8xl font-handwriting text-background animate-scale-in">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        {!error && (
          <div className="mt-8 flex flex-col items-center gap-6">
            {/* Camera modes */}
            <div className="flex gap-2 p-1.5 bg-background/10 rounded-full">
              {cameraModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setCameraMode(mode.id as CameraMode)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all
                      ${cameraMode === mode.id 
                        ? 'bg-background text-foreground' 
                        : 'text-background/70 hover:text-background'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Capture controls */}
            <div className="flex items-center gap-8">
              {/* Flip camera */}
              <button
                onClick={flipCamera}
                className="p-4 rounded-full bg-background/20 text-background hover:bg-background/30 transition-colors"
              >
                <RefreshCw className="w-6 h-6" />
              </button>

              {/* Capture button */}
              <button
                onClick={capturePhoto}
                disabled={isCountingDown || !isVideoReady}
                className="relative p-2 rounded-full bg-background group disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-95 group-active:scale-90">
                  <Camera className="w-8 h-8 text-primary-foreground" />
                </div>
                {/* Pulse ring */}
                {isVideoReady && !isCountingDown && (
                  <div className="absolute inset-0 rounded-full border-4 border-background/50 animate-ripple" />
                )}
              </button>

              {/* Placeholder for symmetry */}
              <div className="w-14 h-14" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
