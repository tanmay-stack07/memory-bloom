import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Download, Film, Upload, ChevronLeft, ChevronRight,
  Layers, Palette, Settings, Eye, ZoomIn, ZoomOut, Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Photo, PhotoSlot, FilmTemplate, ExportFormat } from './types';
import { filmStyles } from './filmStyles';
import defaultTemplate from '@/assets/film-template-1.png';

interface FilmStudioProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
}

// Built-in templates
const builtInTemplates: FilmTemplate[] = [
  {
    id: 'default',
    name: 'Classic Strip',
    description: 'Traditional film strip layout',
    src: defaultTemplate,
    slots: 4,
    aspectRatio: '3:4',
    style: 'vertical',
  },
  {
    id: '35mm-vertical',
    name: '35mm Vertical',
    description: '4-frame vertical strip',
    src: '', // Will use canvas-generated
    slots: 4,
    aspectRatio: '2:3',
    style: 'vertical',
  },
  {
    id: '35mm-horizontal',
    name: '35mm Horizontal',
    description: 'Horizontal film strip',
    src: '',
    slots: 4,
    aspectRatio: '3:2',
    style: 'horizontal',
  },
  {
    id: 'contact-sheet',
    name: 'Contact Sheet',
    description: '3x4 grid layout',
    src: '',
    slots: 12,
    aspectRatio: '1:1',
    style: 'contact',
  },
  {
    id: 'super8',
    name: 'Super 8',
    description: 'Vintage movie film',
    src: '',
    slots: 6,
    aspectRatio: '4:3',
    style: 'super8',
  },
];

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
    const brightness = (r + g + b) / 3;
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;
    return brightness > 220 && saturation < 0.15 && a > 200;
  };
  
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
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    const slotWidth = maxX - minX;
    const slotHeight = maxY - minY;
    const minSize = Math.min(width, height) * 0.06;
    
    if (slotWidth > minSize && slotHeight > minSize && pixelCount > minSize * minSize * 0.4) {
      return { x: minX, y: minY, width: slotWidth, height: slotHeight };
    }
    return null;
  };
  
  const step = Math.max(1, Math.floor(Math.min(width, height) / 100));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = y * width + x;
      if (!visited[idx] && isWhite(x, y)) {
        const slot = floodFill(x, y);
        if (slot) {
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
  
  slots.sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 30) return yDiff;
    return a.x - b.x;
  });
  
  // Add frame numbers
  return slots.map((slot, i) => ({ ...slot, frameNumber: i + 1 }));
};

// Generate a film strip template programmatically
const generateFilmTemplate = (
  template: FilmTemplate, 
  width: number, 
  height: number
): { canvas: HTMLCanvasElement; slots: PhotoSlot[] } => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  
  const slots: PhotoSlot[] = [];
  const sprocketSize = Math.min(width, height) * 0.02;
  const sprocketGap = sprocketSize * 2;
  const margin = sprocketSize * 3;
  
  // Draw sprocket holes
  ctx.fillStyle = '#0a0a0a';
  
  if (template.style === 'vertical' || template.style === 'super8') {
    // Vertical sprockets
    const sprocketCount = Math.floor((height - margin * 2) / sprocketGap);
    for (let i = 0; i < sprocketCount; i++) {
      const y = margin + i * sprocketGap;
      // Left side
      ctx.beginPath();
      ctx.roundRect(sprocketSize * 0.5, y, sprocketSize, sprocketSize * 0.8, 2);
      ctx.fill();
      // Right side
      ctx.beginPath();
      ctx.roundRect(width - sprocketSize * 1.5, y, sprocketSize, sprocketSize * 0.8, 2);
      ctx.fill();
    }
    
    // Calculate frame positions
    const frameMargin = margin + sprocketSize;
    const frameWidth = width - frameMargin * 2;
    const frameGap = height * 0.02;
    const totalFrameHeight = height - margin * 2 - (template.slots - 1) * frameGap;
    const frameHeight = totalFrameHeight / template.slots;
    
    for (let i = 0; i < template.slots; i++) {
      const y = margin + i * (frameHeight + frameGap);
      slots.push({
        x: frameMargin,
        y: y,
        width: frameWidth,
        height: frameHeight,
        frameNumber: i + 1,
      });
      
      // Draw white frame area
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(frameMargin, y, frameWidth, frameHeight);
      
      // Frame number
      ctx.fillStyle = '#ff6600';
      ctx.font = `bold ${sprocketSize}px monospace`;
      ctx.fillText(`${i + 1}`, frameMargin + 5, y + frameHeight - 5);
    }
  } else if (template.style === 'horizontal') {
    // Horizontal sprockets
    const sprocketCount = Math.floor((width - margin * 2) / sprocketGap);
    for (let i = 0; i < sprocketCount; i++) {
      const x = margin + i * sprocketGap;
      // Top
      ctx.beginPath();
      ctx.roundRect(x, sprocketSize * 0.5, sprocketSize * 0.8, sprocketSize, 2);
      ctx.fill();
      // Bottom
      ctx.beginPath();
      ctx.roundRect(x, height - sprocketSize * 1.5, sprocketSize * 0.8, sprocketSize, 2);
      ctx.fill();
    }
    
    const frameMargin = margin + sprocketSize;
    const frameHeight = height - frameMargin * 2;
    const frameGap = width * 0.02;
    const totalFrameWidth = width - margin * 2 - (template.slots - 1) * frameGap;
    const frameWidth = totalFrameWidth / template.slots;
    
    for (let i = 0; i < template.slots; i++) {
      const x = margin + i * (frameWidth + frameGap);
      slots.push({
        x: x,
        y: frameMargin,
        width: frameWidth,
        height: frameHeight,
        frameNumber: i + 1,
      });
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, frameMargin, frameWidth, frameHeight);
      
      ctx.fillStyle = '#ff6600';
      ctx.font = `bold ${sprocketSize}px monospace`;
      ctx.fillText(`${i + 1}`, x + 5, frameMargin + frameHeight - 5);
    }
  } else if (template.style === 'contact') {
    // Contact sheet - grid layout
    const cols = 3;
    const rows = 4;
    const cellPadding = width * 0.02;
    const cellWidth = (width - cellPadding * (cols + 1)) / cols;
    const cellHeight = (height - cellPadding * (rows + 1)) / rows;
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, width, height);
    
    let frameNum = 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = cellPadding + col * (cellWidth + cellPadding);
        const y = cellPadding + row * (cellHeight + cellPadding);
        
        slots.push({
          x: x,
          y: y,
          width: cellWidth,
          height: cellHeight,
          frameNumber: frameNum,
        });
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, cellWidth, cellHeight);
        
        ctx.fillStyle = '#ff6600';
        ctx.font = `bold ${cellPadding * 0.8}px monospace`;
        ctx.fillText(`${frameNum}`, x + 3, y + cellHeight - 3);
        
        frameNum++;
      }
    }
  }
  
  return { canvas, slots };
};

export const FilmStudio = ({ photos, isOpen, onClose }: FilmStudioProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<FilmTemplate>(builtInTemplates[0]);
  const [customTemplate, setCustomTemplate] = useState<string | null>(null);
  const [detectedSlots, setDetectedSlots] = useState<PhotoSlot[]>([]);
  const [selectedFilmStyle, setSelectedFilmStyle] = useState(filmStyles[0]);
  const [photoAssignments, setPhotoAssignments] = useState<(Photo | null)[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'style' | 'adjust'>('templates');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [slotAdjustments, setSlotAdjustments] = useState<{ [key: number]: { x: number; y: number; scale: number } }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize photo assignments when photos or slots change
  useEffect(() => {
    const assignments: (Photo | null)[] = [];
    for (let i = 0; i < detectedSlots.length; i++) {
      assignments.push(photos[i] || null);
    }
    setPhotoAssignments(assignments);
  }, [photos, detectedSlots]);

  // Analyze template and detect slots
  useEffect(() => {
    if (!isOpen) return;
    
    const processTemplate = async () => {
      let templateImage: HTMLImageElement | null = null;
      let slots: PhotoSlot[] = [];
      
      if (customTemplate) {
        // Custom uploaded template
        templateImage = await loadImage(customTemplate);
        const canvas = document.createElement('canvas');
        canvas.width = templateImage.width;
        canvas.height = templateImage.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(templateImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        slots = detectPhotoSlots(imageData);
      } else if (selectedTemplate.src) {
        // Built-in template with image
        templateImage = await loadImage(selectedTemplate.src);
        const canvas = document.createElement('canvas');
        canvas.width = templateImage.width;
        canvas.height = templateImage.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(templateImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        slots = detectPhotoSlots(imageData);
      } else {
        // Generate template programmatically
        const { slots: generatedSlots } = generateFilmTemplate(
          selectedTemplate, 
          800, 
          selectedTemplate.style === 'horizontal' ? 400 : 1200
        );
        slots = generatedSlots;
      }
      
      setDetectedSlots(slots);
    };
    
    processTemplate();
  }, [isOpen, selectedTemplate, customTemplate]);

  // Generate preview whenever assignments or style changes
  useEffect(() => {
    if (!isOpen || detectedSlots.length === 0) return;
    generatePreview();
  }, [isOpen, detectedSlots, photoAssignments, selectedFilmStyle, slotAdjustments, selectedTemplate, customTemplate]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const generatePreview = async () => {
    const canvas = document.createElement('canvas');
    let templateCanvas: HTMLCanvasElement;
    let templateImage: HTMLImageElement | null = null;
    
    if (customTemplate) {
      templateImage = await loadImage(customTemplate);
      canvas.width = templateImage.width;
      canvas.height = templateImage.height;
    } else if (selectedTemplate.src) {
      templateImage = await loadImage(selectedTemplate.src);
      canvas.width = templateImage.width;
      canvas.height = templateImage.height;
    } else {
      const dims = selectedTemplate.style === 'horizontal' ? { w: 1200, h: 500 } : 
                   selectedTemplate.style === 'contact' ? { w: 900, h: 1200 } :
                   { w: 600, h: 1000 };
      canvas.width = dims.w;
      canvas.height = dims.h;
      const { canvas: generatedCanvas } = generateFilmTemplate(selectedTemplate, dims.w, dims.h);
      templateCanvas = generatedCanvas;
    }
    
    const ctx = canvas.getContext('2d')!;
    
    // Draw photos first
    for (let i = 0; i < detectedSlots.length; i++) {
      const slot = detectedSlots[i];
      const photo = photoAssignments[i];
      const adjustment = slotAdjustments[i] || { x: 0, y: 0, scale: 1 };
      
      if (photo) {
        try {
          const img = await loadImage(photo.imageUrl);
          
          // Calculate cover fit with adjustments
          const imgAspect = img.width / img.height;
          const slotAspect = slot.width / slot.height;
          
          let sWidth = img.width;
          let sHeight = img.height;
          let sx = 0;
          let sy = 0;
          
          if (imgAspect > slotAspect) {
            sWidth = img.height * slotAspect;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / slotAspect;
            sy = (img.height - sHeight) / 2;
          }
          
          // Apply adjustments
          sx -= adjustment.x * (sWidth * 0.5);
          sy -= adjustment.y * (sHeight * 0.5);
          sWidth /= adjustment.scale;
          sHeight /= adjustment.scale;
          
          // Apply film style filter
          if (selectedFilmStyle.filter || selectedFilmStyle.colorShift) {
            ctx.filter = `${selectedFilmStyle.filter} ${selectedFilmStyle.colorShift}`.trim();
          }
          
          ctx.drawImage(img, sx, sy, sWidth, sHeight, slot.x, slot.y, slot.width, slot.height);
          ctx.filter = 'none';
          
          // Apply vignette
          if (selectedFilmStyle.vignette > 0) {
            const gradient = ctx.createRadialGradient(
              slot.x + slot.width / 2,
              slot.y + slot.height / 2,
              0,
              slot.x + slot.width / 2,
              slot.y + slot.height / 2,
              Math.max(slot.width, slot.height) * 0.7
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, `rgba(0,0,0,${selectedFilmStyle.vignette / 100})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
          }
        } catch (e) {
          console.error('Failed to load photo:', e);
        }
      }
    }
    
    // Draw template on top
    if (templateImage) {
      ctx.drawImage(templateImage, 0, 0);
    } else if (!customTemplate && !selectedTemplate.src) {
      const { canvas: generatedCanvas } = generateFilmTemplate(selectedTemplate, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(generatedCanvas, 0, 0);
    }
    
    // Apply grain overlay
    if (selectedFilmStyle.grain > 0) {
      const grainCanvas = document.createElement('canvas');
      grainCanvas.width = canvas.width;
      grainCanvas.height = canvas.height;
      const grainCtx = grainCanvas.getContext('2d')!;
      
      const grainData = grainCtx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < grainData.data.length; i += 4) {
        const val = Math.random() * 255;
        grainData.data[i] = val;
        grainData.data[i + 1] = val;
        grainData.data[i + 2] = val;
        grainData.data[i + 3] = selectedFilmStyle.grain * 2.5;
      }
      grainCtx.putImageData(grainData, 0, 0);
      
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(grainCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    // Add light leak effect
    if (selectedFilmStyle.lightLeakOpacity > 0) {
      const leakGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      leakGradient.addColorStop(0, `rgba(255, 100, 50, ${selectedFilmStyle.lightLeakOpacity / 100})`);
      leakGradient.addColorStop(0.5, 'transparent');
      leakGradient.addColorStop(1, `rgba(255, 200, 100, ${selectedFilmStyle.lightLeakOpacity / 200})`);
      ctx.fillStyle = leakGradient;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    setPreviewUrl(canvas.toDataURL('image/png'));
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
        setSelectedTemplate({ ...builtInTemplates[0], id: 'custom', name: 'Custom Template', style: 'custom' });
        toast.success('Template uploaded! Analyzing photo slots...');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    if (photoAssignments.every(p => !p)) {
      toast.error('No photos to export');
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Re-render at high quality
      await generatePreview();
      
      if (exportFormat === 'pdf') {
        const canvas = document.createElement('canvas');
        const img = await loadImage(previewUrl!);
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        
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
        
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Maith Film Studio', pageWidth / 2, margin / 2 + 3, { align: 'center' });
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, pdfWidth, pdfHeight);
        pdf.save('maith-film-strip.pdf');
      } else {
        const link = document.createElement('a');
        link.download = `maith-film-strip.${exportFormat}`;
        link.href = previewUrl!.replace('image/png', `image/${exportFormat}`);
        link.click();
      }
      
      toast.success('Export complete!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const swapPhoto = (slotIndex: number, photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      const newAssignments = [...photoAssignments];
      newAssignments[slotIndex] = photo;
      setPhotoAssignments(newAssignments);
    }
  };

  const removePhotoFromSlot = (slotIndex: number) => {
    const newAssignments = [...photoAssignments];
    newAssignments[slotIndex] = null;
    setPhotoAssignments(newAssignments);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <h1 className="font-handwriting text-2xl">Film Studio</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Controls */}
        <aside className="w-80 border-r border-border/50 overflow-y-auto p-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            {[
              { id: 'templates', label: 'Templates', icon: Layers },
              { id: 'style', label: 'Style', icon: Palette },
              { id: 'adjust', label: 'Adjust', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${
                  activeTab === id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Template selection */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {builtInTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setCustomTemplate(null);
                    }}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      selectedTemplate.id === template.id && !customTemplate
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      {template.src ? (
                        <img src={template.src} alt={template.name} className="w-full h-full object-contain" />
                      ) : (
                        <Film className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{template.name}</p>
                    <p className="text-[10px] text-muted-foreground">{template.slots} frames</p>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/50 transition-all flex flex-col items-center gap-2"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload Custom Template</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Film style selection */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Film Stock</h3>
              <div className="space-y-2">
                {filmStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedFilmStyle(style)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedFilmStyle.id === style.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                  >
                    <p className="text-sm font-medium">{style.name}</p>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adjustments */}
          {activeTab === 'adjust' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click on a frame in the preview to adjust its positioning.
              </p>
              
              {selectedSlot !== null && (
                <div className="space-y-4 p-4 bg-card rounded-xl">
                  <h3 className="text-sm font-medium">Frame {selectedSlot + 1}</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Horizontal Position</label>
                      <Slider
                        value={[slotAdjustments[selectedSlot]?.x || 0]}
                        min={-1}
                        max={1}
                        step={0.05}
                        onValueChange={([v]) => setSlotAdjustments(prev => ({
                          ...prev,
                          [selectedSlot]: { ...prev[selectedSlot], x: v, y: prev[selectedSlot]?.y || 0, scale: prev[selectedSlot]?.scale || 1 }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground">Vertical Position</label>
                      <Slider
                        value={[slotAdjustments[selectedSlot]?.y || 0]}
                        min={-1}
                        max={1}
                        step={0.05}
                        onValueChange={([v]) => setSlotAdjustments(prev => ({
                          ...prev,
                          [selectedSlot]: { ...prev[selectedSlot], x: prev[selectedSlot]?.x || 0, y: v, scale: prev[selectedSlot]?.scale || 1 }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground">Zoom</label>
                      <Slider
                        value={[slotAdjustments[selectedSlot]?.scale || 1]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={([v]) => setSlotAdjustments(prev => ({
                          ...prev,
                          [selectedSlot]: { ...prev[selectedSlot], x: prev[selectedSlot]?.x || 0, y: prev[selectedSlot]?.y || 0, scale: v }
                        }))}
                      />
                    </div>
                  </div>
                  
                  {photoAssignments[selectedSlot] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePhotoFromSlot(selectedSlot)}
                      className="w-full"
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              )}
              
              {/* Available photos */}
              <div>
                <h3 className="text-sm font-medium mb-2">Available Photos</h3>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        if (selectedSlot !== null) {
                          swapPhoto(selectedSlot, photo.id);
                        }
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all"
                    >
                      <img src={photo.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Preview area */}
        <main className="flex-1 flex items-center justify-center p-8 bg-muted/30 overflow-auto">
          <div className="relative">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Film preview" 
                className="max-w-full max-h-[80vh] rounded-lg shadow-xl"
              />
            ) : (
              <div className="w-64 h-96 bg-card rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            
            {/* Slot overlay for clicking */}
            {detectedSlots.map((slot, index) => {
              const previewImg = previewUrl ? document.querySelector(`img[src="${previewUrl}"]`) : null;
              // Simplified click zones - just use index as indicator
              return (
                <button
                  key={index}
                  onClick={() => setSelectedSlot(index)}
                  className={`absolute border-2 transition-all ${
                    selectedSlot === index 
                      ? 'border-primary bg-primary/10' 
                      : 'border-transparent hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  style={{
                    left: `${(slot.x / 800) * 100}%`,
                    top: `${(slot.y / 1200) * 100}%`,
                    width: `${(slot.width / 800) * 100}%`,
                    height: `${(slot.height / 1200) * 100}%`,
                  }}
                  title={`Frame ${index + 1}`}
                />
              );
            })}
          </div>
        </main>

        {/* Right sidebar - Photo slots */}
        <aside className="w-64 border-l border-border/50 overflow-y-auto p-4">
          <h3 className="text-sm font-medium mb-3">Photo Slots</h3>
          <div className="space-y-2">
            {detectedSlots.map((slot, index) => (
              <div
                key={index}
                onClick={() => setSelectedSlot(index)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  selectedSlot === index
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                    {photoAssignments[index] ? (
                      <img 
                        src={photoAssignments[index]!.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Film className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Frame {index + 1}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {photoAssignments[index] ? 'Photo assigned' : 'Empty'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {photos.length > detectedSlots.length && (
            <p className="text-xs text-primary mt-4">
              {photos.length - detectedSlots.length} photos won't fit - add more pages or use a different template
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};
