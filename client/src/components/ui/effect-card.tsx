import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  Star, 
  Calendar,
  Eye,
  Sparkles,
  Atom,
  Lightbulb,
  Shapes,
  Code
} from "lucide-react";
import type { Effect } from "@shared/schema";

interface EffectCardProps {
  effect: Effect;
}

const typeIcons = {
  PARTICLE: Sparkles,
  PHYSICS: Atom,
  LIGHTING: Lightbulb,
  MORPHING: Shapes,
  DIGITAL: Code
};

const typeColors = {
  PARTICLE: "text-forge-cyan bg-forge-cyan/20",
  PHYSICS: "text-forge-plasma bg-forge-plasma/20",
  LIGHTING: "text-forge-gold bg-forge-gold/20",
  MORPHING: "text-purple-400 bg-purple-400/20",
  DIGITAL: "text-green-400 bg-green-400/20"
};

const categoryColors = {
  EXPLOSION: "bg-orange-500/20 text-orange-400",
  TRANSITION: "bg-blue-500/20 text-blue-400",
  ATMOSPHERIC: "bg-purple-500/20 text-purple-400",
  TRANSFORMATION: "bg-green-500/20 text-green-400",
  FIRE: "bg-red-500/20 text-red-400",
  DISTORTION: "bg-pink-500/20 text-pink-400"
};

export default function EffectCard({ effect }: EffectCardProps) {
  const { toast } = useToast();
  const TypeIcon = typeIcons[effect.type as keyof typeof typeIcons] || Sparkles;

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/effects/${effect.id}/download?format=js`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${effect.name.replace(/\s+/g, '_')}.js`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `${effect.name} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download effect",
        variant: "destructive"
      });
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview modal or navigation to preview page
    toast({
      title: "Preview",
      description: "Preview functionality coming soon",
    });
  };

  return (
    <Card className="glass-morphism border-forge-purple/30 bg-transparent hover:border-forge-cyan/50 transition-all duration-300 group">
      <CardContent className="p-0">
        {/* Preview Area */}
        <div className="relative w-full h-40 bg-forge-dark rounded-t-lg overflow-hidden">
          {/* Animated background representing the effect type */}
          <div className={`absolute inset-0 opacity-20 ${typeColors[effect.type as keyof typeof typeColors]?.includes('forge-cyan') ? 'bg-gradient-to-br from-forge-cyan/30 to-transparent' : ''}`}>
            {effect.type === 'PARTICLE' && (
              <div className="absolute inset-0 bg-gradient-to-br from-forge-cyan/20 via-transparent to-forge-plasma/20" />
            )}
            {effect.type === 'LIGHTING' && (
              <div className="absolute inset-0 bg-gradient-to-r from-forge-gold/20 via-transparent to-yellow-400/20" />
            )}
            {effect.type === 'PHYSICS' && (
              <div className="absolute inset-0 bg-gradient-to-br from-forge-plasma/20 via-transparent to-purple-400/20" />
            )}
          </div>
          
          {/* Type icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-forge-dark/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <TypeIcon className={`w-8 h-8 ${typeColors[effect.type as keyof typeof typeColors]?.split(' ')[0] || 'text-forge-cyan'}`} />
            </div>
          </div>
          
          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${categoryColors[effect.category as keyof typeof categoryColors] || 'bg-gray-500/20 text-gray-400'}`}
            >
              {effect.category}
            </Badge>
          </div>
          
          {/* Platform badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-xs border-forge-purple/50 text-forge-purple bg-forge-dark/80">
              {effect.platform}
            </Badge>
          </div>
          
          {/* Preview button overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              onClick={handlePreview}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              data-testid={`button-preview-${effect.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <h4 className="text-lg font-semibold text-white mb-1 line-clamp-1" data-testid={`text-effect-name-${effect.id}`}>
              {effect.name}
            </h4>
            <p className="text-sm text-gray-400 line-clamp-2 mb-3" data-testid={`text-effect-description-${effect.id}`}>
              {effect.description}
            </p>
          </div>
          
          {/* Tags */}
          {effect.tags && effect.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {effect.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-forge-purple/20 text-forge-purple border-forge-purple/30"
                >
                  {tag}
                </Badge>
              ))}
              {effect.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-400">
                  +{effect.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-forge-gold fill-forge-gold" />
                <span data-testid={`text-rating-${effect.id}`}>{effect.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span data-testid={`text-downloads-${effect.id}`}>
                  {effect.downloads > 1000 
                    ? `${(effect.downloads / 1000).toFixed(1)}k` 
                    : effect.downloads}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(effect.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Complexity and Performance */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Complexity:</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < effect.complexity 
                        ? effect.complexity <= 3 ? 'bg-green-400' : effect.complexity <= 6 ? 'bg-yellow-400' : 'bg-red-400'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${
                effect.performance === 'high' 
                  ? 'border-green-400 text-green-400' 
                  : effect.performance === 'medium'
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-red-400 text-red-400'
              }`}
            >
              {effect.performance} perf
            </Badge>
          </div>
          
          {/* Download Button */}
          <Button
            onClick={handleDownload}
            className="w-full bg-forge-electric hover:bg-forge-cyan text-white font-medium transition-colors"
            data-testid={`button-download-${effect.id}`}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
