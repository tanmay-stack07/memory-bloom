import { useState } from 'react';
import { Download, FileImage, X, Film } from 'lucide-react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Photo {
  id: string;
  imageUrl: string;
  caption?: string;
  mood?: string;
}

interface FilmStripExportProps {
  photos: Photo[];
}

export const FilmStripExport = ({ photos }: FilmStripExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const exportToPDF = async () => {
    if (photos.length === 0) {
      toast.error('No photos to export');
      return;
    }

    setIsExporting(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      
      // Film strip dimensions
      const stripWidth = pageWidth - margin * 2;
      const frameWidth = (stripWidth - 20) / 3; // 3 frames per row
      const frameHeight = frameWidth * 1.3;
      const sprocketSize = 4;
      const sprocketGap = 8;

      // Add title
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(24);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Your Memories', pageWidth / 2, margin + 5, { align: 'center' });

      let yOffset = margin + 20;
      let photoIndex = 0;

      while (photoIndex < photos.length) {
        // Draw film strip background
        const stripHeight = frameHeight + 24;
        
        // Main film strip body
        pdf.setFillColor(30, 30, 30);
        pdf.roundedRect(margin, yOffset, stripWidth, stripHeight, 3, 3, 'F');
        
        // Sprocket holes - top row
        pdf.setFillColor(20, 20, 20);
        for (let x = margin + 6; x < margin + stripWidth - 6; x += sprocketGap) {
          pdf.roundedRect(x, yOffset + 3, sprocketSize, sprocketSize - 1, 1, 1, 'F');
        }
        
        // Sprocket holes - bottom row
        for (let x = margin + 6; x < margin + stripWidth - 6; x += sprocketGap) {
          pdf.roundedRect(x, yOffset + stripHeight - sprocketSize - 2, sprocketSize, sprocketSize - 1, 1, 1, 'F');
        }

        // Draw up to 3 frames per strip
        for (let i = 0; i < 3 && photoIndex < photos.length; i++) {
          const photo = photos[photoIndex];
          const frameX = margin + 10 + i * (frameWidth + 5);
          const frameY = yOffset + 10;

          // Frame border (white)
          pdf.setFillColor(250, 248, 245);
          pdf.roundedRect(frameX - 2, frameY - 2, frameWidth + 4, frameHeight + 4, 2, 2, 'F');

          // Add image
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                // Calculate aspect ratio crop
                const imgAspect = img.width / img.height;
                const frameAspect = frameWidth / (frameHeight - 12);
                
                let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
                
                if (imgAspect > frameAspect) {
                  sWidth = img.height * frameAspect;
                  sx = (img.width - sWidth) / 2;
                } else {
                  sHeight = img.width / frameAspect;
                  sy = (img.height - sHeight) / 2;
                }

                // Create cropped canvas
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300 / frameAspect;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                  const croppedData = canvas.toDataURL('image/jpeg', 0.9);
                  pdf.addImage(croppedData, 'JPEG', frameX, frameY, frameWidth, frameHeight - 12);
                }
                resolve();
              };
              img.onerror = reject;
              img.src = photo.imageUrl;
            });
          } catch (e) {
            console.error('Failed to load image:', e);
          }

          // Caption area
          if (photo.caption) {
            pdf.setFontSize(7);
            pdf.setTextColor(80, 80, 80);
            pdf.setFont('helvetica', 'italic');
            const caption = photo.caption.substring(0, 25) + (photo.caption.length > 25 ? '...' : '');
            pdf.text(caption, frameX + frameWidth / 2, frameY + frameHeight - 3, { align: 'center' });
          }

          // Frame number
          pdf.setFontSize(5);
          pdf.setTextColor(200, 180, 150);
          pdf.text(`${photoIndex + 1}`, frameX + 2, frameY + frameHeight - 14);

          photoIndex++;
        }

        yOffset += stripHeight + 8;

        // Add new page if needed
        if (yOffset + stripHeight > pageHeight - margin && photoIndex < photos.length) {
          pdf.addPage();
          yOffset = margin;
        }
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Created with Maith', pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save('maith-memories.pdf');
      toast.success('PDF exported successfully!');
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
            <h3 className="font-medium text-foreground">Export Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Film strip preview */}
          <div className="bg-neutral-900 rounded-lg p-3 mb-4">
            {/* Sprockets top */}
            <div className="flex justify-between mb-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-2 h-1.5 bg-neutral-800 rounded-sm" />
              ))}
            </div>
            
            {/* Frames preview */}
            <div className="flex gap-1.5">
              {photos.slice(0, 3).map((photo, index) => (
                <div key={photo.id} className="flex-1">
                  <div className="bg-cream rounded-sm p-0.5">
                    <img
                      src={photo.imageUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-[3/4] object-cover rounded-sm"
                    />
                  </div>
                </div>
              ))}
              {photos.length > 3 && (
                <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
                  +{photos.length - 3} more
                </div>
              )}
            </div>

            {/* Sprockets bottom */}
            <div className="flex justify-between mt-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-2 h-1.5 bg-neutral-800 rounded-sm" />
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} will be exported as a vintage film strip PDF
          </div>

          <Button
            onClick={exportToPDF}
            disabled={isExporting}
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
