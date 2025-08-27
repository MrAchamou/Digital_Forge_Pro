import { storage } from "../storage";
import type { Effect, InsertEffect } from "@shared/schema";

interface LibrarySearchOptions {
  query?: string;
  category?: string;
  type?: string;
  platform?: string;
  tags?: string[];
  complexity?: number;
  performance?: string;
  sortBy?: 'name' | 'rating' | 'downloads' | 'createdAt' | 'complexity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface LibraryStats {
  totalEffects: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  byPlatform: Record<string, number>;
  averageRating: number;
  totalDownloads: number;
  complexityDistribution: Record<string, number>;
}

class LibraryDatabase {
  // Advanced search with filtering and sorting
  async search(options: LibrarySearchOptions = {}): Promise<{
    effects: Effect[];
    total: number;
    stats: {
      avgComplexity: number;
      avgRating: number;
      totalDownloads: number;
    };
  }> {
    try {
      const {
        query,
        category,
        type,
        platform,
        tags,
        complexity,
        performance,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limit = 20,
        offset = 0
      } = options;

      // Get all effects from storage
      const allEffectsResult = await storage.getEffects({
        category,
        type,
        platform,
        search: query,
        limit: 1000, // Get all for advanced filtering
        offset: 0
      });

      let filteredEffects = allEffectsResult.effects;

      // Apply advanced filters
      if (tags && tags.length > 0) {
        filteredEffects = filteredEffects.filter(effect =>
          tags.some(tag => effect.tags.includes(tag))
        );
      }

      if (complexity !== undefined) {
        filteredEffects = filteredEffects.filter(effect =>
          effect.complexity === complexity
        );
      }

      if (performance) {
        filteredEffects = filteredEffects.filter(effect =>
          effect.performance === performance
        );
      }

      // Apply sorting
      filteredEffects.sort((a, b) => {
        let compareValue = 0;

        switch (sortBy) {
          case 'name':
            compareValue = a.name.localeCompare(b.name);
            break;
          case 'rating':
            compareValue = (a.rating || 0) - (b.rating || 0);
            break;
          case 'downloads':
            compareValue = (a.downloads || 0) - (b.downloads || 0);
            break;
          case 'complexity':
            compareValue = a.complexity - b.complexity;
            break;
          case 'createdAt':
          default:
            compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }

        return sortOrder === 'desc' ? -compareValue : compareValue;
      });

      // Calculate stats for filtered results
      const stats = {
        avgComplexity: filteredEffects.length > 0 
          ? filteredEffects.reduce((sum, e) => sum + e.complexity, 0) / filteredEffects.length 
          : 0,
        avgRating: filteredEffects.length > 0 
          ? filteredEffects.reduce((sum, e) => sum + (e.rating || 0), 0) / filteredEffects.length 
          : 0,
        totalDownloads: filteredEffects.reduce((sum, e) => sum + (e.downloads || 0), 0)
      };

      // Apply pagination
      const paginatedEffects = filteredEffects.slice(offset, offset + limit);

      return {
        effects: paginatedEffects,
        total: filteredEffects.length,
        stats
      };
    } catch (error) {
      console.error('Library search error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get library statistics
  async getStats(): Promise<LibraryStats> {
    try {
      const allEffectsResult = await storage.getEffects({ limit: 10000 });
      const effects = allEffectsResult.effects;

      const stats: LibraryStats = {
        totalEffects: effects.length,
        byCategory: {},
        byType: {},
        byPlatform: {},
        averageRating: 0,
        totalDownloads: 0,
        complexityDistribution: {}
      };

      // Calculate distributions
      effects.forEach(effect => {
        // Category distribution
        stats.byCategory[effect.category] = (stats.byCategory[effect.category] || 0) + 1;

        // Type distribution
        stats.byType[effect.type] = (stats.byType[effect.type] || 0) + 1;

        // Platform distribution
        stats.byPlatform[effect.platform] = (stats.byPlatform[effect.platform] || 0) + 1;

        // Complexity distribution
        const complexityRange = this.getComplexityRange(effect.complexity);
        stats.complexityDistribution[complexityRange] = (stats.complexityDistribution[complexityRange] || 0) + 1;

        // Accumulate totals
        stats.totalDownloads += effect.downloads || 0;
      });

      // Calculate average rating
      const effectsWithRating = effects.filter(e => e.rating && e.rating > 0);
      stats.averageRating = effectsWithRating.length > 0
        ? effectsWithRating.reduce((sum, e) => sum + (e.rating || 0), 0) / effectsWithRating.length
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting library stats:', error);
      throw new Error(`Failed to get library stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getComplexityRange(complexity: number): string {
    if (complexity <= 3) return 'Simple';
    if (complexity <= 6) return 'Medium';
    if (complexity <= 8) return 'Complex';
    return 'Advanced';
  }

  // Get similar effects based on tags and type
  async getSimilarEffects(effectId: string, limit = 5): Promise<Effect[]> {
    try {
      const targetEffect = await storage.getEffect(effectId);
      if (!targetEffect) return [];

      const allEffectsResult = await storage.getEffects({ limit: 1000 });
      const allEffects = allEffectsResult.effects.filter(e => e.id !== effectId);

      // Calculate similarity scores
      const scored = allEffects.map(effect => ({
        effect,
        score: this.calculateSimilarityScore(targetEffect, effect)
      }));

      // Sort by similarity score and return top results
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.effect);
    } catch (error) {
      console.error('Error getting similar effects:', error);
      return [];
    }
  }

  private calculateSimilarityScore(effect1: Effect, effect2: Effect): number {
    let score = 0;

    // Type match (highest weight)
    if (effect1.type === effect2.type) score += 10;

    // Category match (high weight)
    if (effect1.category === effect2.category) score += 8;

    // Platform match (medium weight)
    if (effect1.platform === effect2.platform) score += 5;

    // Complexity similarity (medium weight)
    const complexityDiff = Math.abs(effect1.complexity - effect2.complexity);
    score += Math.max(0, 5 - complexityDiff);

    // Tag overlap (variable weight based on number of matching tags)
    const commonTags = effect1.tags.filter(tag => effect2.tags.includes(tag));
    score += commonTags.length * 2;

    // Performance match (low weight)
    if (effect1.performance === effect2.performance) score += 2;

    return score;
  }

  // Get trending effects (high download rate, recent, good ratings)
  async getTrendingEffects(limit = 10): Promise<Effect[]> {
    try {
      const allEffectsResult = await storage.getEffects({ limit: 1000 });
      const effects = allEffectsResult.effects;

      // Calculate trending score
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      const scored = effects.map(effect => {
        const daysOld = (now - new Date(effect.createdAt).getTime()) / oneDayMs;
        const recencyFactor = Math.max(0, 1 - daysOld / 30); // Favor effects less than 30 days old
        
        const downloadScore = (effect.downloads || 0) / 100; // Normalize downloads
        const ratingScore = (effect.rating || 0) * 2; // Rating out of 5, weight by 2
        
        return {
          effect,
          score: (downloadScore + ratingScore) * recencyFactor
        };
      });

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.effect);
    } catch (error) {
      console.error('Error getting trending effects:', error);
      return [];
    }
  }

  // Auto-tag effects based on content analysis
  async autoTagEffect(effectId: string): Promise<string[]> {
    try {
      const effect = await storage.getEffect(effectId);
      if (!effect) return [];

      const newTags = new Set(effect.tags);
      const codeContent = effect.code.toLowerCase();
      const descriptionContent = effect.description.toLowerCase();
      const allContent = `${codeContent} ${descriptionContent}`;

      // Define auto-tagging rules
      const tagRules = [
        { keywords: ['particle', 'spark', 'dust', 'debris'], tag: 'particles' },
        { keywords: ['explosion', 'burst', 'blast', 'boom'], tag: 'explosion' },
        { keywords: ['fire', 'flame', 'burn', 'ember'], tag: 'fire' },
        { keywords: ['water', 'liquid', 'splash', 'wave'], tag: 'water' },
        { keywords: ['light', 'glow', 'shine', 'bright'], tag: 'lighting' },
        { keywords: ['smoke', 'fog', 'mist', 'vapor'], tag: 'atmospheric' },
        { keywords: ['electric', 'lightning', 'bolt', 'shock'], tag: 'electric' },
        { keywords: ['magic', 'spell', 'enchant', 'mystical'], tag: 'magic' },
        { keywords: ['energy', 'power', 'force', 'aura'], tag: 'energy' },
        { keywords: ['transform', 'morph', 'change', 'shift'], tag: 'transformation' },
        { keywords: ['trail', 'path', 'trace', 'follow'], tag: 'trail' },
        { keywords: ['dissolve', 'fade', 'disappear'], tag: 'fade' },
        { keywords: ['appear', 'materialize', 'spawn'], tag: 'spawn' },
        { keywords: ['rotate', 'spin', 'twist', 'swirl'], tag: 'rotation' },
        { keywords: ['scale', 'grow', 'shrink', 'resize'], tag: 'scaling' }
      ];

      // Apply tagging rules
      tagRules.forEach(rule => {
        if (rule.keywords.some(keyword => allContent.includes(keyword))) {
          newTags.add(rule.tag);
        }
      });

      // Extract color tags
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'white', 'black'];
      colors.forEach(color => {
        if (allContent.includes(color)) {
          newTags.add(color);
        }
      });

      // Extract size tags
      const sizes = ['small', 'large', 'tiny', 'huge', 'massive', 'mini', 'big'];
      sizes.forEach(size => {
        if (allContent.includes(size)) {
          newTags.add(size);
        }
      });

      const updatedTags = Array.from(newTags);
      
      // Update the effect with new tags
      await storage.updateEffect(effectId, { tags: updatedTags });
      
      return updatedTags;
    } catch (error) {
      console.error('Error auto-tagging effect:', error);
      return [];
    }
  }

  // Cleanup and maintenance methods
  async cleanupLibrary(): Promise<{
    duplicatesRemoved: number;
    invalidEffectsRemoved: number;
    tagsUpdated: number;
  }> {
    try {
      const allEffectsResult = await storage.getEffects({ limit: 10000 });
      const effects = allEffectsResult.effects;

      let duplicatesRemoved = 0;
      let invalidEffectsRemoved = 0;
      let tagsUpdated = 0;

      // Find and remove duplicates (same name and code)
      const seen = new Set<string>();
      for (const effect of effects) {
        const signature = `${effect.name}:${effect.code.slice(0, 100)}`;
        if (seen.has(signature)) {
          await storage.deleteEffect(effect.id);
          duplicatesRemoved++;
        } else {
          seen.add(signature);
        }
      }

      // Remove invalid effects (empty code, invalid data)
      for (const effect of effects) {
        if (!effect.code || effect.code.trim().length < 50 || !effect.name || effect.name.trim().length === 0) {
          await storage.deleteEffect(effect.id);
          invalidEffectsRemoved++;
        }
      }

      // Update tags for effects with few tags
      for (const effect of effects) {
        if (effect.tags.length < 3) {
          const newTags = await this.autoTagEffect(effect.id);
          if (newTags.length > effect.tags.length) {
            tagsUpdated++;
          }
        }
      }

      return {
        duplicatesRemoved,
        invalidEffectsRemoved,
        tagsUpdated
      };
    } catch (error) {
      console.error('Error cleaning up library:', error);
      throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export/Import functionality
  async exportLibrary(options: { format: 'json' | 'csv'; filters?: LibrarySearchOptions } = { format: 'json' }): Promise<string> {
    try {
      const searchResult = await this.search(options.filters || {});
      const effects = searchResult.effects;

      if (options.format === 'csv') {
        return this.exportToCSV(effects);
      } else {
        return JSON.stringify({
          exportedAt: new Date().toISOString(),
          count: effects.length,
          effects: effects
        }, null, 2);
      }
    } catch (error) {
      console.error('Error exporting library:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private exportToCSV(effects: Effect[]): string {
    const headers = ['id', 'name', 'description', 'type', 'category', 'platform', 'complexity', 'performance', 'rating', 'downloads', 'tags', 'createdAt'];
    
    const csvRows = [headers.join(',')];
    
    effects.forEach(effect => {
      const row = [
        effect.id,
        `"${effect.name.replace(/"/g, '""')}"`,
        `"${effect.description.replace(/"/g, '""')}"`,
        effect.type,
        effect.category,
        effect.platform,
        effect.complexity,
        effect.performance,
        effect.rating || 0,
        effect.downloads || 0,
        `"${effect.tags.join(', ')}"`,
        effect.createdAt
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Get recommendations for a user based on their usage patterns
  async getRecommendations(recentDownloads: string[], limit = 10): Promise<Effect[]> {
    try {
      if (recentDownloads.length === 0) {
        // If no download history, return trending effects
        return this.getTrendingEffects(limit);
      }

      // Get effects user has downloaded
      const downloadedEffects = await Promise.all(
        recentDownloads.map(id => storage.getEffect(id))
      );

      const validDownloaded = downloadedEffects.filter(Boolean) as Effect[];

      // Analyze user preferences
      const preferredTypes = this.getTopValues(validDownloaded.map(e => e.type));
      const preferredCategories = this.getTopValues(validDownloaded.map(e => e.category));
      const preferredTags = this.getTopValues(validDownloaded.flatMap(e => e.tags));

      // Get similar effects
      const recommendations = new Set<Effect>();
      
      for (const effect of validDownloaded) {
        const similar = await this.getSimilarEffects(effect.id, 3);
        similar.forEach(e => recommendations.add(e));
      }

      // Add effects matching user preferences
      const searchResult = await this.search({
        type: preferredTypes[0],
        category: preferredCategories[0],
        tags: preferredTags.slice(0, 3),
        limit: limit * 2
      });

      searchResult.effects.forEach(e => {
        if (!recentDownloads.includes(e.id)) {
          recommendations.add(e);
        }
      });

      return Array.from(recommendations).slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getTrendingEffects(limit);
    }
  }

  private getTopValues<T>(values: T[]): T[] {
    const counts = new Map<T, number>();
    values.forEach(value => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value]) => value);
  }
}

export const libraryDatabase = new LibraryDatabase();
