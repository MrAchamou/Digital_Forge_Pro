import type { AnimationSpeed } from '../modules/timing-master.module';

export interface ZoneEffectDecision {
  zoneId?: string;
  effet_id: string;
  intensity: number;
  timing?: number;
  delay?: number;
  speed: AnimationSpeed;
  easing?: string;
  color: string;
  opacity?: number;
  raison?: string;
  layers?: LayerDecision[];
  [key: string]: any;
}

export interface LayerDecision {
  category: string;
  effet_id: string;
  intensity: number;
  speed: AnimationSpeed;
  color: string;
  raison: string;
}

export interface ZoneComposition {
  logo?: ZoneEffectDecision;
  nom?: ZoneEffectDecision;
  separateur?: ZoneEffectDecision;
  fond?: ZoneEffectDecision;
  cta?: ZoneEffectDecision;
  titre?: ZoneEffectDecision;
  contact?: ZoneEffectDecision;
  zones?: ZoneEffectDecision[];
  globalTimeline?: number;
  narrativeRole?: string;
  compatibilityScore?: number;
  wcagCompliant?: boolean;
  performanceTier?: 'lite' | 'standard' | 'ultra';
}

export function validateZoneComposition(comp: ZoneComposition): boolean {
  const hasZones = Array.isArray(comp.zones) && comp.zones.length > 0;
  const hasZoneFields = !!(comp.logo || comp.nom || comp.fond || comp.cta || comp.titre || comp.contact);
  const score = comp.compatibilityScore ?? 0;
  return (hasZones || hasZoneFields) && score >= 0;
}
