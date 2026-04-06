import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EffectCard from "@/components/ui/effect-card";
import { Database, Search, ChevronLeft, ChevronRight, Layers, RefreshCw } from "lucide-react";
import type { Effect } from "@shared/schema";

interface EffectsResponse {
  effects: Effect[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface LibraryStats {
  totalDescriptions: number;
  effectsGenerated: number;
  categories: Record<string, number>;
  qualityScore: number;
}

const categoryOptions = [
  { value: "all", label: "Toutes les catégories" },
  { value: "VIVANT", label: "Vivants" },
  { value: "LUMINEUX", label: "Lumineux" },
  { value: "ELECTRIQUE", label: "Électrique" },
  { value: "CRISTAL", label: "Cristal / Glace" },
  { value: "LIQUIDE", label: "Liquide / Vague" },
  { value: "MORPHING", label: "Morphing" },
  { value: "PARTICULE", label: "Particules" },
  { value: "COSMIQUE", label: "Cosmique" },
  { value: "ATMOSPHERIQUE", label: "Atmosphérique" },
  { value: "DIGITAL", label: "Digital / Quantique" },
  { value: "FEU", label: "Feu" },
  { value: "PHYSIQUE", label: "Physique / Gravité" },
  { value: "TEMPOREL", label: "Temporel" },
  { value: "ENERGIE", label: "Énergie" },
  { value: "TRANSFORMATION", label: "Transformation" },
  { value: "TRANSITION", label: "Transition" },
  { value: "EXPLOSION", label: "Explosion" },
  { value: "FIRE", label: "Fire" },
  { value: "DISTORTION", label: "Distortion" },
];

const typeOptions = [
  { value: "all", label: "Tous les types" },
  { value: "ORGANIC", label: "Organique" },
  { value: "LIGHTING", label: "Lumière" },
  { value: "CRYSTALLINE", label: "Cristallin" },
  { value: "MORPHING", label: "Morphing" },
  { value: "PARTICLE", label: "Particules" },
  { value: "DIGITAL", label: "Digital" },
  { value: "FIRE", label: "Feu" },
  { value: "ATMOSPHERIC", label: "Atmosphérique" },
  { value: "PHYSICS", label: "Physique" },
  { value: "TEMPORAL", label: "Temporel" },
  { value: "ENERGY", label: "Énergie" },
  { value: "COSMIC", label: "Cosmique" },
  { value: "TRANSFORMATION", label: "Transformation" },
  { value: "TRANSITION", label: "Transition" },
];

export default function Library() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Build URL with real query params
  const buildUrl = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (category !== "all") params.append("category", category);
    if (type !== "all") params.append("type", type);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return `/api/library/effects?${params.toString()}`;
  };

  const url = buildUrl();

  const { data, isLoading, isFetching } = useQuery<EffectsResponse>({
    queryKey: [url],
    refetchOnWindowFocus: false,
  });

  const { data: stats } = useQuery<LibraryStats>({
    queryKey: ["/api/library/real-time-stats"],
    refetchInterval: 5000,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("all");
    setType("all");
    setPage(1);
  };

  const hasFilters = debouncedSearch || category !== "all" || type !== "all";

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-forge-plasma/20 via-forge-purple/20 to-forge-cyan/20 rounded-3xl blur-3xl -z-10" />
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-forge-plasma via-forge-cyan to-forge-purple bg-clip-text text-transparent">
          NEURAL LIBRARY
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
          Catalogue complet de vos effets premium — tous réels, tous chargés depuis la base de données
        </p>

        {/* Live count badge */}
        <div className="flex justify-center items-center gap-3 flex-wrap">
          <Badge className="bg-forge-cyan text-forge-dark px-4 py-2 text-base font-bold" data-testid="badge-total-effects">
            <Database className="w-4 h-4 mr-2 inline" />
            {stats?.totalDescriptions ?? data?.pagination.total ?? "..."} effets
          </Badge>
          {stats?.categories && (
            <Badge className="bg-forge-purple text-white px-3 py-2" data-testid="badge-categories-count">
              <Layers className="w-4 h-4 mr-1 inline" />
              {Object.keys(stats.categories).length} catégories
            </Badge>
          )}
          {isFetching && (
            <Badge className="bg-forge-gold/20 border border-forge-gold text-forge-gold px-3 py-2">
              <RefreshCw className="w-3 h-3 mr-1 inline animate-spin" />
              Synchronisation...
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
            <Search className="w-5 h-5" />
            Recherche & Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher un effet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-forge-dark border-forge-purple text-white placeholder:text-gray-400 focus:border-forge-cyan"
                data-testid="input-search-effects"
              />
            </div>

            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-cyan" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-forge-dark border-forge-purple max-h-64">
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white focus:bg-forge-purple">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-cyan" data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-forge-dark border-forge-purple max-h-64">
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white focus:bg-forge-purple">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Filtres actifs :</span>
              {debouncedSearch && <Badge className="bg-forge-cyan/20 border border-forge-cyan text-forge-cyan text-xs">"{debouncedSearch}"</Badge>}
              {category !== "all" && <Badge className="bg-forge-purple/20 border border-forge-purple text-forge-purple text-xs">{category}</Badge>}
              {type !== "all" && <Badge className="bg-forge-plasma/20 border border-forge-plasma text-forge-plasma text-xs">{type}</Badge>}
              <Button onClick={clearFilters} variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white h-6 px-2" data-testid="button-clear-filters">
                × Effacer tout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      {data && (
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span data-testid="text-results-count">
            {hasFilters
              ? `${data.pagination.total} résultat${data.pagination.total !== 1 ? "s" : ""} — page ${data.pagination.page}/${data.pagination.pages || 1}`
              : `${data.pagination.total} effets dans la bibliothèque`}
          </span>
          <span className="text-xs text-gray-500">
            Affichage : {((page - 1) * limit) + 1}–{Math.min(page * limit, data.pagination.total)} / {data.pagination.total}
          </span>
        </div>
      )}

      {/* Effects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-morphism rounded-xl p-6 animate-pulse">
              <div className="w-full h-40 bg-forge-dark/50 rounded-lg mb-4" />
              <div className="h-4 bg-forge-dark/50 rounded mb-2" />
              <div className="h-3 bg-forge-dark/50 rounded mb-4" />
              <div className="flex justify-between">
                <div className="h-3 bg-forge-dark/50 rounded w-20" />
                <div className="h-6 bg-forge-dark/50 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.effects.length === 0 ? (
        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center py-16">
          <CardContent>
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-300">Aucun effet trouvé</h3>
            <p className="text-gray-400 mb-4">
              {hasFilters ? "Essaie d'ajuster tes critères de recherche" : "Aucun effet disponible"}
            </p>
            {hasFilters && (
              <Button onClick={clearFilters} variant="outline" className="border-forge-cyan text-forge-cyan hover:bg-forge-cyan/10" data-testid="button-clear-filters">
                Effacer les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-effects">
          {data?.effects.map((effect) => (
            <EffectCard key={effect.id} effect={effect} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-3 pt-4">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            variant="outline"
            size="sm"
            className="border-forge-purple text-white hover:bg-forge-purple/20 disabled:opacity-40"
            data-testid="button-previous-page"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(7, data.pagination.pages) }).map((_, i) => {
              const start = Math.max(1, Math.min(data.pagination.pages - 6, page - 3));
              const pageNum = start + i;
              if (pageNum > data.pagination.pages) return null;
              return (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className={page === pageNum
                    ? "bg-forge-cyan text-white min-w-[36px]"
                    : "border-forge-purple text-white hover:bg-forge-purple/20 min-w-[36px]"
                  }
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data.pagination.pages}
            variant="outline"
            size="sm"
            className="border-forge-purple text-white hover:bg-forge-purple/20 disabled:opacity-40"
            data-testid="button-next-page"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Category breakdown */}
      {stats?.categories && Object.keys(stats.categories).length > 0 && (
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-forge-gold flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Répartition par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(stats.categories)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setPage(1); }}
                    className="flex items-center justify-between p-3 bg-forge-dark/40 hover:bg-forge-dark/70 rounded-lg border border-forge-purple/20 hover:border-forge-cyan/40 transition-all text-left"
                    data-testid={`button-category-${cat}`}
                  >
                    <span className="text-sm text-white font-medium truncate">{cat}</span>
                    <Badge className="bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/30 text-xs ml-2 flex-shrink-0">
                      {count}
                    </Badge>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
