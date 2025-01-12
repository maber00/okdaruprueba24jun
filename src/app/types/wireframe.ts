// src/app/types/wireframe.ts

// Tipos base
export type ElementType = 'nav' | 'cta' | 'text' | 'image' | 'logo';
export type SectionType = 'header' | 'hero' | 'content' | 'footer';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementSize {
  width: string;
  height: string;
}

export interface WireframeElement {
  type: ElementType;
  position: ElementPosition;
  size: ElementSize;
  label?: string;
}

export interface WireframeSection {
  type: SectionType;
  elements: WireframeElement[];
}

export interface ComponentDescription {
  navigation: string;
  ctas: string;
  containers: string;
}

export interface WireframeAnalysis {
  layout: WireframeSection[];
  componentDescription: ComponentDescription;
  recommendations: string[];
}

export interface WireframeViewerProps {
  analysis: WireframeAnalysis;
  className?: string;
}