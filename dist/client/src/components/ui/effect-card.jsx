var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Progress } from './progress';
import { Download, Eye, Star, Zap, Cpu, Sparkles } from 'lucide-react';
var AdvancedEffectCard = memo(function (_a) {
    var effect = _a.effect, onPreview = _a.onPreview, onDownload = _a.onDownload, onRate = _a.onRate, _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.showAdvancedMetrics, showAdvancedMetrics = _c === void 0 ? true : _c;
    var _d = useState(false), isHovered = _d[0], setIsHovered = _d[1];
    var _e = useState(effect.rating || 0), rating = _e[0], setRating = _e[1];
    var _f = useState(false), isLoading = _f[0], setIsLoading = _f[1];
    var performanceColor = useMemo(function () {
        switch (effect.performance) {
            case 'high': return 'text-green-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-red-400';
            default: return 'text-gray-400';
        }
    }, [effect.performance]);
    var complexityWidth = useMemo(function () { return (effect.complexity / 10) * 100; }, [effect.complexity]);
    var handlePreview = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onPreview) return [3 /*break*/, 4];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, onPreview(effect)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [effect, onPreview]);
    var handleDownload = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onDownload) return [3 /*break*/, 4];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, onDownload(effect)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [effect, onDownload]);
    var handleRating = useCallback(function (newRating) {
        setRating(newRating);
        if (onRate) {
            onRate(effect.id, newRating);
        }
    }, [effect.id, onRate]);
    return (<motion.div className={"group ".concat(className)} onHoverStart={function () { return setIsHovered(true); }} onHoverEnd={function () { return setIsHovered(false); }} whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="glass-morphism border-forge-purple/30 bg-transparent overflow-hidden relative">
        {/* Animated Background */}
        <motion.div className="absolute inset-0 bg-gradient-to-br from-forge-cyan/5 via-transparent to-forge-plasma/5" animate={{
            opacity: isHovered ? 0.3 : 0.1
        }} transition={{ duration: 0.3 }}/>

        {/* AI Generated Badge */}
        {effect.aiGenerated && (<div className="absolute top-2 right-2 z-10">
            <Badge className="bg-forge-electric/80 text-white border-none">
              <Sparkles className="w-3 h-3 mr-1"/>
              AI
            </Badge>
          </div>)}

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
          {effect.tags && effect.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">
              {effect.tags.slice(0, 3).map(function (tag, index) { return (<Badge key={index} variant="secondary" className="text-xs bg-forge-dark/50 text-forge-cyan border-forge-cyan/30">
                  {tag}
                </Badge>); })}
              {effect.tags.length > 3 && (<Badge variant="secondary" className="text-xs bg-forge-dark/30">
                  +{effect.tags.length - 3}
                </Badge>)}
            </div>)}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Advanced Metrics */}
          {showAdvancedMetrics && (<div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Complexité</span>
                  <span className="text-forge-gold">{effect.complexity}/10</span>
                </div>
                <Progress value={complexityWidth} className="h-1"/>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Performance</span>
                  <span className={performanceColor}>
                    <Cpu className="w-3 h-3 inline mr-1"/>
                    {effect.performance}
                  </span>
                </div>
              </div>
            </div>)}

          {/* Rating System */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map(function (_, i) { return (<button key={i} onClick={function () { return handleRating(i + 1); }} className="text-yellow-400 hover:scale-110 transition-transform">
                  <Star className={"w-4 h-4 ".concat(i < rating ? 'fill-current' : '')}/>
                </button>); })}
              <span className="text-xs text-gray-400 ml-2">
                ({rating}/5)
              </span>
            </div>

            {effect.downloads && (<div className="flex items-center text-xs text-gray-400">
                <Download className="w-3 h-3 mr-1"/>
                {effect.downloads}
              </div>)}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} disabled={isLoading} className="flex-1 border-forge-cyan/30 hover:border-forge-cyan text-forge-cyan hover:bg-forge-cyan/10">
              <Eye className="w-4 h-4 mr-1"/>
              Aperçu
            </Button>

            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading} className="flex-1 border-forge-electric/30 hover:border-forge-electric text-forge-electric hover:bg-forge-electric/10">
              <Download className="w-4 h-4 mr-1"/>
              Télécharger
            </Button>
          </div>

          {/* Optimized Badge */}
          {effect.optimized && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: isHovered ? 1 : 0.7, y: 0 }} className="flex items-center justify-center pt-2">
              <Badge className="bg-gradient-to-r from-forge-plasma to-forge-electric text-white border-none">
                <Zap className="w-3 h-3 mr-1"/>
                Optimisé IA
              </Badge>
            </motion.div>)}
        </CardContent>

        {/* Hover Effects */}
        <AnimatePresence>
          {isHovered && (<motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-forge-cyan/10 to-forge-plasma/10 rounded-lg"/>
              {/* Particle effects on hover */}
              {Array.from({ length: 6 }).map(function (_, i) { return (<motion.div key={i} className="absolute w-1 h-1 bg-forge-electric rounded-full" style={{
                    left: "".concat(20 + i * 10, "%"),
                    top: "".concat(20 + (i % 2) * 60, "%")
                }} animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -20]
                }} transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                }}/>); })}
            </motion.div>)}
        </AnimatePresence>
      </Card>
    </motion.div>);
});
AdvancedEffectCard.displayName = 'AdvancedEffectCard';
export default AdvancedEffectCard;
