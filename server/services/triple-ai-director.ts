export interface CreativeBrief {
  theme: string;
  tone: string;
  targetAudience: string;
  keyMessages: string[];
  visualStyle: string;
  callToAction: string;
  sectorId: string;
  [key: string]: any;
}

export interface NarrativeScenario {
  title: string;
  arc: string;
  acts: Array<{ name: string; description: string; duration: number }>;
  emotionalJourney: string[];
  climax: string;
  resolution: string;
  [key: string]: any;
}

export interface TechnicalConfig {
  width: number;
  height: number;
  fps: number;
  duration: number;
  format: 'svg' | 'html' | 'gif' | 'png';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  effects: string[];
  palette: string[];
  [key: string]: any;
}
