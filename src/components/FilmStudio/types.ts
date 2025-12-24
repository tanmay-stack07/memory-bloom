export interface Photo {
  id: string;
  imageUrl: string;
  caption?: string;
  mood?: string;
}

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  frameNumber?: number;
}

export interface FilmTemplate {
  id: string;
  name: string;
  description: string;
  src: string;
  slots: number;
  aspectRatio: string;
  style: 'vertical' | 'horizontal' | 'contact' | 'super8' | 'custom';
}

export interface FilmStyle {
  id: string;
  name: string;
  description: string;
  filter: string;
  grain: number;
  vignette: number;
  dustOpacity: number;
  lightLeakOpacity: number;
  colorShift: string;
}

export type ExportFormat = 'png' | 'jpeg' | 'pdf';
