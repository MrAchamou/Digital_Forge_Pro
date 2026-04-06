/**
 * 🗂️ Hook usePresets — Client-side Preset Manager (P5)
 *
 * Charge les presets depuis l'API, filtre par secteur,
 * et expose les actions create / use / delete.
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PresetConfiguration {
  style:           'minimal' | 'balanced' | 'expressif' | 'dramatique';
  intensite:       'minimal' | 'subtil' | 'expressif' | 'dramatique';
  palette:         string[];
  effects_hint:    Record<string, string>;
  timing_profile:  string;
  sector:          string;
  metadata?:       Record<string, any>;
}

export interface Preset {
  id:            string;
  name:          string;
  description:   string;
  secteur:       string;
  tags:          string[];
  is_smart:      boolean;
  configuration: PresetConfiguration;
  usage_count:   number;
  created_at:    number;
  last_used:     number | null;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function usePresets(secteur?: string) {
  const url = secteur ? `/api/presets/sector/${secteur}` : '/api/presets';

  const presetsQuery = useQuery<Preset[]>({
    queryKey: ['/api/presets', secteur ?? 'all'],
  });

  const smartPresetsQuery = useQuery<Preset[]>({
    queryKey: ['/api/presets/smart', secteur ?? 'default'],
    enabled:  !!secteur,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; secteur: string; configuration: PresetConfiguration; tags?: string[] }) =>
      apiRequest('POST', '/api/presets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presets'] });
    },
  });

  const useMutationFn = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/presets/${id}/use`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/presets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presets'] });
    },
  });

  return {
    presets:       presetsQuery.data ?? [],
    smartPresets:  smartPresetsQuery.data ?? [],
    isLoading:     presetsQuery.isLoading,
    createPreset:  createMutation.mutate,
    usePreset:     useMutationFn.mutate,
    deletePreset:  deleteMutation.mutate,
    isCreating:    createMutation.isPending,
    isDeleting:    deleteMutation.isPending,
  };
}

// ─── Hook préférences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  user_id:             string;
  favorite_effects:    Record<string, number>;
  rejected_effects:    string[];
  preferred_style:     string | null;
  preferred_intensity: number | null;
  sector_history:      string[];
  variation_choices:   Record<string, number>;
  session_count:       number;
  last_active:         number;
  created_at:          number;
}

export function usePreferences(userId: string = 'default') {
  const prefsQuery = useQuery<UserPreferences>({
    queryKey: ['/api/preferences', userId],
  });

  const recordMutation = useMutation({
    mutationFn: (data: { effect_id: string; action: 'select' | 'star' | 'reject'; variation?: string; secteur?: string; intensity?: number }) =>
      apiRequest('POST', `/api/preferences/record?user_id=${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences', userId] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/preferences/reset?user_id=${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences', userId] });
    },
  });

  return {
    preferences:       prefsQuery.data,
    isLoading:         prefsQuery.isLoading,
    recordPreference:  recordMutation.mutate,
    resetPreferences:  resetMutation.mutate,
    isRecording:       recordMutation.isPending,
  };
}
