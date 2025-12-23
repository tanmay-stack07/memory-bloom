import { useState, useRef, useEffect } from 'react';
import { Download, X, Film, Upload, ImagePlus } from 'lucide-react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import defaultTemplate from '@/assets/film-template-1.png';

interface Photo {
  id: string;
  imageUrl: string;
  caption?: string;
  mood?: string;
}

interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FilmStripExportProps {
  photos: Photo[];
}

// Detect white/light rectangular areas in a template image
const detectPhotoSlots = (imageData: ImageData): PhotoSlot[] => {
  const { width, height, data } = imageData;
  const visited = new Array(width * height).fill(false);
  const slots: PhotoSlot[] = [];
  
  const isWhite = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    // Check if pixel is white/light (high brightness and low saturation)
    const brightness = (r + g + b) / 3;
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;
    return brightness > 220 && saturation < 0.15 && a > 200;
  };
  
  // Find connected white regions using flood fill
  const floodFill = (startX: number, startY: number): PhotoSlot | null => {
    const stack: [number, number][] = [[startX, startY]];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    let pixelCount = 0;
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const idx = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[idx] || !isWhite(x, y)) continue;
      
      visited[idx] = true;
      pixelCount++;
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add neighbors (use step to speed up processing)
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    const slotWidth = maxX - minX;
    const slotHeight = maxY - minY;
    
    // Only return if it's a reasonable sized rectangle (at least 5% of image size)
    const minSize = Math.min(width, height) * 0.08;
    if (slotWidth > minSize && slotHeight > minSize && pixelCount > minSize * minSize * 0.5) {
      return { x: minX, y: minY, width: slotWidth, height: slotHeight };
    }
    return null;
  };
  
  // Scan for white regions (sample grid for performance)
  const step = Math.max(1, Math.floor(Math.min(width, height) / 100));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = y * width + x;
      if (!visited[idx] && isWhite(x, y)) {
        const slot = floodFill(x, y);
        if (slot) {
          // Add small padding
          const padding = 4;
          slots.push({
            x: slot.x + padding,
            y: slot.y + padding,
            width: slot.width - padding * 2,
            height: slot.height - padding * 2,
          });
        }
      }
    }
  }
  
  // Sort slots by Y position then X position (top to bottom, left to right)
  slots.sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 30) return yDiff;
    return a.x - b.x;
  });
  
  return slots;
};

export const FilmStripExport = ({ photos }: FilmStripExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customTemplate, setCustomTemplate] = useState<string | null>(null);
  const [detectedSlots, setDetectedSlots] = useState<PhotoSlot[]>([]);
  const [templateDimensions, setTemplateDimensions] = useState({ width: 0, height: 0 });
  const [previewCanvas, setPreviewCanvas] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTemplate = customTemplate || defaultTemplate;

  // Analyze template when it changes
  useEffect(() => {
    const analyzeTemplate = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const slots = detectPhotoSlots(imageData);
          setDetectedSlots(slots);
          setTemplateDimensions({ width: img.width, height: img.height });
          
          // Generate preview with photos
          generatePreview(img, slots);
        }
      };
      
      img.src = currentTemplate;
    };
    
    analyzeTemplate();
  }, [currentTemplate, photos]);

  const generatePreview = (templateImg: HTMLImageElement, slots: PhotoSlot[]) => {
    const canvas = document.createElement('canvas');
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw photos first (behind template)
    slots.forEach((slot, index) => {
      if (index < photos.length) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Calculate cover fit
          const imgAspect = img.width / img.height;
          const slotAspect = slot.width / slot.height;
          
          let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
          
          if (imgAspect > slotAspect) {
            sWidth = img.height * slotAspect;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / slotAspect;
            sy = (img.height - sHeight) / 2;
          }
          
          ctx.drawImage(img, sx, sy, sWidth, sHeight, slot.x, slot.y, slot.width, slot.height);
          
          // Draw template on top
          ctx.drawImage(templateImg, 0, 0);
          setPreviewCanvas(canvas.toDataURL('image/png'));
        };
        img.src = photos[index].imageUrl;
      }
    });
    
    // If no photos, just draw template
    if (photos.length === 0 || slots.length === 0) {
      ctx.drawImage(templateImg, 0, 0);
      setPreviewCanvas(canvas.toDataURL('image/png'));
    }
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomTemplate(event.target?.result as string);
        toast.success('Template uploaded! Analyzing photo slots...');
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToPDF = async () => {
    if (photos.length === 0) {
      toast.error('No photos to export');
      return;
    }

    if (detectedSlots.length === 0) {
      toast.error('No photo slots detected in template');
      return;
    }

    setIsExporting(true);

    try {
      // Load template image
      const templateImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = currentTemplate;
      });

      // Create composite canvas
      const canvas = document.createElement('canvas');
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');

      // Draw photos into slots
      for (let i = 0; i < Math.min(photos.length, detectedSlots.length); i++) {
        const slot = detectedSlots[i];
        const photo = photos[i];
        
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Calculate cover fit
            const imgAspect = img.width / img.height;
            const slotAspect = slot.width / slot.height;
            
            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
            
            if (imgAspect > slotAspect) {
              sWidth = img.height * slotAspect;
              sx = (img.width - sWidth) / 2;
            } else {
              sHeight = img.width / slotAspect;
              sy = (img.height - sHeight) / 2;
            }
            
            ctx.drawImage(img, sx, sy, sWidth, sHeight, slot.x, slot.y, slot.width, slot.height);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = photo.imageUrl;
        });
      }

      // Draw template on top (decorative elements overlay the photos)
      ctx.drawImage(templateImg, 0, 0);

      // Create PDF
      const pdf = new jsPDF({
        orientation: templateImg.width > templateImg.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      // Calculate image dimensions to fit page
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const imgAspect = canvas.width / canvas.height;
      
      let pdfWidth, pdfHeight;
      if (maxWidth / maxHeight > imgAspect) {
        pdfHeight = maxHeight;
        pdfWidth = pdfHeight * imgAspect;
      } else {
        pdfWidth = maxWidth;
        pdfHeight = pdfWidth / imgAspect;
      }

      const x = (pageWidth - pdfWidth) / 2;
      const y = (pageHeight - pdfHeight) / 2;

      // Add title
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(12);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Maith Memories', pageWidth / 2, margin, { align: 'center' });

      // Add composite image
      const compositeData = canvas.toDataURL('image/png');
      pdf.addImage(compositeData, 'PNG', x, y, pdfWidth, pdfHeight);

      // Handle additional photos if more than slots
      if (photos.length > detectedSlots.length) {
        const remainingPhotos = photos.slice(detectedSlots.length);
        let pageIndex = 1;
        
        for (let i = 0; i < remainingPhotos.length; i += detectedSlots.length) {
          pdf.addPage();
          pageIndex++;
          
          // Create another composite for remaining photos
          const canvas2 = document.createElement('canvas');
          canvas2.width = templateImg.width;
          canvas2.height = templateImg.height;
          const ctx2 = canvas2.getContext('2d');
          
          if (ctx2) {
            for (let j = 0; j < Math.min(detectedSlots.length, remainingPhotos.length - i); j++) {
              const slot = detectedSlots[j];
              const photo = remainingPhotos[i + j];
              
              await new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  const imgAspect = img.width / img.height;
                  const slotAspect = slot.width / slot.height;
                  
                  let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
                  
                  if (imgAspect > slotAspect) {
                    sWidth = img.height * slotAspect;
                    sx = (img.width - sWidth) / 2;
                  } else {
                    sHeight = img.width / slotAspect;
                    sy = (img.height - sHeight) / 2;
                  }
                  
                  ctx2.drawImage(img, sx, sy, sWidth, sHeight, slot.x, slot.y, slot.width, slot.height);
                  resolve();
                };
                img.onerror = () => resolve();
                img.src = photo.imageUrl;
              });
            }
            
            ctx2.drawImage(templateImg, 0, 0);
            pdf.addImage(canvas2.toDataURL('image/png'), 'PNG', x, y, pdfWidth, pdfHeight);
          }
        }
      }

      pdf.save('maith-film-memories.pdf');
      toast.success('Film strip PDF exported!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (photos.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(!showPreview)}
        className="gap-2 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card"
      >
        <Film className="w-4 h-4" />
        Export as Film
      </Button>

      {showPreview && (
        <div className="absolute top-12 right-0 z-50 bg-card rounded-xl shadow-xl border border-border/50 p-4 w-80 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Film Strip Export</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Template selector */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground block mb-2">Film Template</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCustomTemplate(null)}
                className={`flex-1 p-2 rounded-lg border transition-all ${
                  !customTemplate 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
              >
                <img 
                  src={defaultTemplate} 
                  alt="Default template" 
                  className="w-full h-16 object-contain rounded"
                />
                <span className="text-xs text-muted-foreground mt-1 block">Default</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 p-2 rounded-lg border border-dashed transition-all ${
                  customTemplate 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
              >
                {customTemplate ? (
                  <>
                    <img 
                      src={customTemplate} 
                      alt="Custom template" 
                      className="w-full h-16 object-contain rounded"
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">Custom</span>
                  </>
                ) : (
                  <div className="h-16 flex flex-col items-center justify-center text-muted-foreground">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">Upload</span>
                  </div>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleTemplateUpload}
              className="hidden"
            />
          </div>

          {/* Preview */}
          <div className="mb-4 rounded-lg overflow-hidden bg-muted/50 p-2">
            {previewCanvas ? (
              <img 
                src={previewCanvas} 
                alt="Export preview" 
                className="w-full rounded"
              />
            ) : (
              <div className="aspect-[3/4] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground mb-4 space-y-1">
            <p>{detectedSlots.length} photo slot{detectedSlots.length !== 1 ? 's' : ''} detected</p>
            <p>{photos.length} photo{photos.length !== 1 ? 's' : ''} to export</p>
            {photos.length > detectedSlots.length && (
              <p className="text-xs text-primary">
                Multiple pages will be created
              </p>
            )}
          </div>

          <Button
            onClick={exportToPDF}
            disabled={isExporting || detectedSlots.length === 0}
            className="w-full gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
