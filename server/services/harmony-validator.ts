import type { AnimationSpeed } from '../modules/timing-master.module';

export interface ZoneEffectDecision {
  zoneId: string;
  effet_id: string;
  intensity: number;
  timing: number;
  delay: number;
  speed: AnimationSpeed;
  easing: string;
  color: string;
  opacity: number;
  [key: string]: any;
}

export interface ZoneComposition {
  zones: ZoneEffectDecision[];
  globalTimeline: number;
  narrativeRole: string;
  compatibilityScore: number;
  wcagCompliant: boolean;
  performanceTier: 'lite' | 'standard' | 'ultra';
}

export function validateZoneComposition(comp: ZoneComposition): boolean {
  return comp.zones.length > 0 && comp.compatibilityScore >= 0;
}
