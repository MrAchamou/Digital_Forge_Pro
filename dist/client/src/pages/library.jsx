import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EffectCard from "@/components/ui/effect-card";
import { Database, Search, ChevronLeft, ChevronRight } from "lucide-react";
var categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "EXPLOSION", label: "Explosion" },
    { value: "TRANSITION", label: "Transition" },
    { value: "ATMOSPHERIC", label: "Atmospheric" },
    { value: "TRANSFORMATION", label: "Transformation" },
    { value: "FIRE", label: "Fire" },
    { value: "DISTORTION", label: "Distortion" },
];
var typeOptions = [
    { value: "all", label: "All Types" },
    { value: "PARTICLE", label: "Particles" },
    { value: "PHYSICS", label: "Physics" },
    { value: "LIGHTING", label: "Lighting" },
    { value: "MORPHING", label: "Morphing" },
    { value: "DIGITAL", label: "Digital" },
];
var platformOptions = [
    { value: "all", label: "All Platforms" },
    { value: "javascript", label: "JavaScript" },
    { value: "react", label: "React" },
    { value: "aftereffects", label: "After Effects" },
    { value: "premiere", label: "Premiere Pro" },
];
export default function Library() {
    var _a = useState(""), search = _a[0], setSearch = _a[1];
    var _b = useState("all"), category = _b[0], setCategory = _b[1];
    var _c = useState("all"), type = _c[0], setType = _c[1];
    var _d = useState("all"), platform = _d[0], setPlatform = _d[1];
    var _e = useState(1), page = _e[0], setPage = _e[1];
    var limit = 12;
    var queryParams = new URLSearchParams();
    if (search)
        queryParams.append("search", search);
    if (category !== "all")
        queryParams.append("category", category);
    if (type !== "all")
        queryParams.append("type", type);
    if (platform !== "all")
        queryParams.append("platform", platform);
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    var _f = useQuery({
        queryKey: ["/api/library/effects", queryParams.toString()],
        refetchOnWindowFocus: false,
    }), data = _f.data, isLoading = _f.isLoading, refetch = _f.refetch;
    var handleSearchChange = function (value) {
        setSearch(value);
        setPage(1);
    };
    var handleFilterChange = function () {
        setPage(1);
        refetch();
    };
    var handlePageChange = function (newPage) {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (<div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-forge-plasma glow-text">
          EFFECT LIBRARY
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Browse and manage your collection of generated visual effects
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
            <Database className="w-6 h-6"/>
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                <Input type="text" placeholder="Search effects..." value={search} onChange={function (e) { return handleSearchChange(e.target.value); }} className="pl-10 bg-forge-dark border-forge-purple text-white placeholder:text-gray-400 focus:border-forge-cyan" data-testid="input-search-effects"/>
              </div>
            </div>
            
            <Select value={category} onValueChange={function (value) { setCategory(value); handleFilterChange(); }}>
              <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-cyan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-forge-dark border-forge-purple">
                {categoryOptions.map(function (option) { return (<SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                    {option.label}
                  </SelectItem>); })}
              </SelectContent>
            </Select>
            
            <Select value={type} onValueChange={function (value) { setType(value); handleFilterChange(); }}>
              <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-cyan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-forge-dark border-forge-purple">
                {typeOptions.map(function (option) { return (<SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                    {option.label}
                  </SelectItem>); })}
              </SelectContent>
            </Select>
            
            <Select value={platform} onValueChange={function (value) { setPlatform(value); handleFilterChange(); }}>
              <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-cyan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-forge-dark border-forge-purple">
                {platformOptions.map(function (option) { return (<SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                    {option.label}
                  </SelectItem>); })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {data && (<div className="flex justify-between items-center text-sm text-gray-400">
          <span data-testid="text-results-count">
            Showing {data.effects.length} of {data.pagination.total} effects
          </span>
          <span>
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
        </div>)}

      {/* Effects Grid */}
      {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map(function (_, i) { return (<div key={i} className="glass-morphism rounded-xl p-6 animate-pulse">
              <div className="w-full h-40 bg-forge-dark/50 rounded-lg mb-4"/>
              <div className="h-4 bg-forge-dark/50 rounded mb-2"/>
              <div className="h-3 bg-forge-dark/50 rounded mb-4"/>
              <div className="flex justify-between">
                <div className="h-3 bg-forge-dark/50 rounded w-20"/>
                <div className="h-6 bg-forge-dark/50 rounded w-16"/>
              </div>
            </div>); })}
        </div>) : (data === null || data === void 0 ? void 0 : data.effects.length) === 0 ? (<Card className="glass-morphism border-forge-purple/30 bg-transparent text-center py-16">
          <CardContent>
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-400"/>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No Effects Found</h3>
            <p className="text-gray-400 mb-4">
              {search || category !== "all" || type !== "all" || platform !== "all"
                ? "Try adjusting your search criteria"
                : "No effects have been generated yet"}
            </p>
            {(search || category !== "all" || type !== "all" || platform !== "all") && (<Button onClick={function () {
                    setSearch("");
                    setCategory("all");
                    setType("all");
                    setPlatform("all");
                    setPage(1);
                }} variant="outline" className="border-forge-cyan text-forge-cyan hover:bg-forge-cyan/10" data-testid="button-clear-filters">
                Clear Filters
              </Button>)}
          </CardContent>
        </Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-effects">
          {data === null || data === void 0 ? void 0 : data.effects.map(function (effect) { return (<EffectCard key={effect.id} effect={effect}/>); })}
        </div>)}

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (<div className="flex justify-center items-center space-x-4">
          <Button onClick={function () { return handlePageChange(page - 1); }} disabled={page === 1} variant="outline" size="sm" className="border-forge-purple text-white hover:bg-forge-purple/20 disabled:opacity-50" data-testid="button-previous-page">
            <ChevronLeft className="w-4 h-4 mr-1"/>
            Previous
          </Button>

          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, data.pagination.pages) }).map(function (_, i) {
                var pageNum = Math.max(1, Math.min(data.pagination.pages - 4, page - 2)) + i;
                if (pageNum > data.pagination.pages)
                    return null;
                return (<Button key={pageNum} onClick={function () { return handlePageChange(pageNum); }} variant={page === pageNum ? "default" : "outline"} size="sm" className={page === pageNum
                        ? "bg-forge-cyan text-white"
                        : "border-forge-purple text-white hover:bg-forge-purple/20"} data-testid={"button-page-".concat(pageNum)}>
                  {pageNum}
                </Button>);
            })}
          </div>

          <Button onClick={function () { return handlePageChange(page + 1); }} disabled={page === data.pagination.pages} variant="outline" size="sm" className="border-forge-purple text-white hover:bg-forge-purple/20 disabled:opacity-50" data-testid="button-next-page">
            Next
            <ChevronRight className="w-4 h-4 ml-1"/>
          </Button>
        </div>)}
    </div>);
}
