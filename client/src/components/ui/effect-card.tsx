
import React, { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Progress } from './progress';
import { 
  Play, 
  Download, 
  Eye, 
  Star, 
  Zap, 
  Code, 
  Share2,
  Cpu,
  Clock,
  Sparkles
} from 'lucide-react';

interface AdvancedEffectCardProps {
  effect: {
    id: string;
    name: string;
    description: string;
    category: string;
    complexity: number;
    performance: 'high' | 'medium' | 'low';
    code: string;
    preview?: string;
    rating?: number;
    downloads?: number;
    tags?: string[];
    createdAt: string;
    aiGenerated?: boolean;
    optimized?: boolean;
  };
  onPreview?: (effect: any) => void;
  onDownload?: (effect: any) => void;
  onRate?: (effectId: string, rating: number) => void;
  className?: string;
  showAdvancedMetrics?: boolean;
}

const AdvancedEffectCard = memo(({ 
  effect, 
  onPreview, 
  onDownload, 
  onRate,
  className = "",
  showAdvancedMetrics = true
}: AdvancedEffectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rating, setRating] = useState(effect.rating || 0);
  const [isLoading, setIsLoading] = useState(false);

  const performanceColor = useMemo(() => {
    switch (effect.performance) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }, [effect.performance]);

  const complexityWidth = useMemo(() => (effect.complexity / 10) * 100, [effect.complexity]);

  const handlePreview = useCallback(async () => {
    if (onPreview) {
      setIsLoading(true);
      try {
        await onPreview(effect);
      } finally {
        setIsLoading(false);
      }
    }
  }, [effect, onPreview]);

  const handleDownload = useCallback(async () => {
    if (onDownload) {
      setIsLoading(true);
      try {
        await onDownload(effect);
      } finally {
        setIsLoading(false);
      }
    }
  }, [effect, onDownload]);

  const handleRating = useCallback((newRating: number) => {
    setRating(newRating);
    if (onRate) {
      onRate(effect.id, newRating);
    }
  }, [effect.id, onRate]);

  return (
    <motion.div
      className={`group ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-morphism border-forge-purple/30 bg-transparent overflow-hidden relative">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-forge-cyan/5 via-transparent to-forge-plasma/5"
          animate={{
            opacity: isHovered ? 0.3 : 0.1
          }}
          transition={{ duration: 0.3 }}
        />

        {/* AI Generated Badge */}
        {effect.aiGenerated && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-forge-electric/80 text-white border-none">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          </div>
        )}

        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-forge-cyan group-hover:text-forge-electric transition-colors">
                {effect.name}
              </CardTitle>
              <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                {effect.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          {effect.tags && effect.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {effect.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="text-xs bg-forge-dark/50 text-forge-cyan border-forge-cyan/30"
                >
                  {tag}
                </Badge>
              ))}
              {effect.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-forge-dark/30">
                  +{effect.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Advanced Metrics */}
          {showAdvancedMetrics && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Complexité</span>
                  <span className="text-forge-gold">{effect.complexity}/10</span>
                </div>
                <Progress value={complexityWidth} className="h-1" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Performance</span>
                  <span className={performanceColor}>
                    <Cpu className="w-3 h-3 inline mr-1" />
                    {effect.performance}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rating System */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleRating(i + 1)}
                  className="text-yellow-400 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`w-4 h-4 ${i < rating ? 'fill-current' : ''}`} 
                  />
                </button>
              ))}
              <span className="text-xs text-gray-400 ml-2">
                ({rating}/5)
              </span>
            </div>

            {effect.downloads && (
              <div className="flex items-center text-xs text-gray-400">
                <Download className="w-3 h-3 mr-1" />
                {effect.downloads}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={isLoading}
              className="flex-1 border-forge-cyan/30 hover:border-forge-cyan text-forge-cyan hover:bg-forge-cyan/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              Aperçu
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading}
              className="flex-1 border-forge-electric/30 hover:border-forge-electric text-forge-electric hover:bg-forge-electric/10"
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger
            </Button>
          </div>

          {/* Optimized Badge */}
          {effect.optimized && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0.7, y: 0 }}
              className="flex items-center justify-center pt-2"
            >
              <Badge className="bg-gradient-to-r from-forge-plasma to-forge-electric text-white border-none">
                <Zap className="w-3 h-3 mr-1" />
                Optimisé IA
              </Badge>
            </motion.div>
          )}
        </CardContent>

        {/* Hover Effects */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-forge-cyan/10 to-forge-plasma/10 rounded-lg" />
              {/* Particle effects on hover */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-forge-electric rounded-full"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${20 + (i % 2) * 60}%`
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -20]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
});

AdvancedEffectCard.displayName = 'AdvancedEffectCard';

export default AdvancedEffectCard;
