// src/app/lib/svg/engine.ts
import type { WireframeSection, WireframeElement } from '@/app/types/wireframe';

export class SVGEngine {
  private width: number;
  private height: number;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
  }

  generateElementPath(element: WireframeElement): string {
    const { position, size } = element;
    const x = (position.x / 100) * this.width;
    const y = (position.y / 100) * this.height;
    const width = parseInt(size.width) || 100;
    const height = parseInt(size.height) || 50;

    switch (element.type) {
      case 'nav':
        return `M ${x} ${y} h ${width} v ${height} h -${width} Z`;
      case 'cta':
        return `M ${x} ${y} 
                h ${width} 
                q 5 0 5 5 
                v ${height - 10} 
                q 0 5 -5 5 
                h -${width} 
                q -5 0 -5 -5 
                v -${height - 10} 
                q 0 -5 5 -5`;
      case 'text':
        // Genera líneas simulando texto
        let path = `M ${x} ${y} `;
        const lineHeight = height / 3;
        for (let i = 0; i < 3; i++) {
          const lineWidth = i === 0 ? width : width * 0.8;
          path += `M ${x} ${y + (i * lineHeight)} h ${lineWidth} `;
        }
        return path;
      case 'image':
        // Rectángulo con ícono de imagen
        return `M ${x} ${y} h ${width} v ${height} h -${width} Z
                M ${x + width/4} ${y + height/4} 
                l ${width/2} 0 l -${width/4} ${height/2} l -${width/4} -${height/2}`;
      default:
        return `M ${x} ${y} h ${width} v ${height} h -${width} Z`;
    }
  }

  getElementStyle(element: WireframeElement): { [key: string]: string } {
    const baseStyle = {
      fill: 'none',
      stroke: '#666',
      strokeWidth: '2',
    };

    switch (element.type) {
      case 'nav':
        return {
          ...baseStyle,
          stroke: '#333',
        };
      case 'cta':
        return {
          ...baseStyle,
          stroke: '#0066cc',
          fill: '#e6f0ff',
        };
      case 'text':
        return {
          ...baseStyle,
          strokeWidth: '1',
          stroke: '#999',
        };
      case 'image':
        return {
          ...baseStyle,
          stroke: '#666',
          fill: '#f0f0f0',
        };
      default:
        return baseStyle;
    }
  }

  generateSectionBackground(section: WireframeSection): string {
    // Genera un fondo distintivo para cada tipo de sección
    const y = section.elements[0]?.position.y || 0;
    const height = Math.max(
      ...section.elements.map(el => 
        el.position.y + parseInt(el.size.height) || 0
      )
    );

    return `M 0 ${y} h ${this.width} v ${height} h -${this.width} Z`;
  }

  getSectionStyle(section: WireframeSection): { [key: string]: string } {
    const styles: { [key: string]: { [key: string]: string } } = {
      header: {
        fill: '#f8f9fa',
        stroke: '#dee2e6',
        strokeWidth: '1',
      },
      hero: {
        fill: '#e9ecef',
        stroke: '#dee2e6',
        strokeWidth: '1',
      },
      content: {
        fill: '#ffffff',
        stroke: '#dee2e6',
        strokeWidth: '1',
      },
      footer: {
        fill: '#f8f9fa',
        stroke: '#dee2e6',
        strokeWidth: '1',
      },
    };

    return styles[section.type] || styles.content;
  }

  // Método principal para generar el SVG completo
  generateSVG(sections: WireframeSection[]): string {
    const svgStart = `<svg xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 ${this.width} ${this.height}" 
                          style="max-width: 100%; height: auto;">`;
    const svgEnd = '</svg>';

    const content = sections.map(section => {
      const background = `<path d="${this.generateSectionBackground(section)}" 
                               style="${this.styleToString(this.getSectionStyle(section))}"/>`;
      
      const elements = section.elements.map(element => {
        const path = this.generateElementPath(element);
        const style = this.styleToString(this.getElementStyle(element));
        return `<path d="${path}" style="${style}"/>`;
      }).join('');

      return background + elements;
    }).join('');

    return svgStart + content + svgEnd;
  }

  private styleToString(style: { [key: string]: string }): string {
    return Object.entries(style)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}