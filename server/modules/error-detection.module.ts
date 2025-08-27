
import fs from "fs/promises";

interface ErrorReport {
  id: string;
  type: 'SYNTAX' | 'LOGIC' | 'PERFORMANCE' | 'COMPATIBILITY' | 'SECURITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  line?: number;
  column?: number;
  context: string;
  suggestions: string[];
  autoFixable: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: ErrorReport[];
  warnings: ErrorReport[];
  suggestions: string[];
  score: number; // 0-100
  autoFixed: boolean;
  fixedCode?: string;
}

class ErrorDetectionModule {
  private patterns: Map<string, RegExp> = new Map();
  private fixes: Map<string, (code: string, match: RegExpMatchArray) => string> = new Map();
  private performanceRules: Map<string, any> = new Map();
  
  constructor() {
    this.initializePatterns();
    this.initializeFixes();
    this.initializePerformanceRules();
  }

  async validateCode(code: string, context: any = {}): Promise<ValidationResult> {
    console.log('🔍 Validation du code généré...');
    
    const errors: ErrorReport[] = [];
    const warnings: ErrorReport[] = [];
    const suggestions: string[] = [];
    let fixedCode = code;
    let autoFixed = false;
    
    // Phase 1: Détection des erreurs de syntaxe
    const syntaxErrors = await this.detectSyntaxErrors(code);
    errors.push(...syntaxErrors);
    
    // Phase 2: Détection des erreurs logiques
    const logicErrors = await this.detectLogicErrors(code);
    errors.push(...logicErrors);
    
    // Phase 3: Analyse des performances
    const performanceIssues = await this.analyzePerformance(code);
    warnings.push(...performanceIssues);
    
    // Phase 4: Vérification de compatibilité
    const compatibilityIssues = await this.checkCompatibility(code, context);
    warnings.push(...compatibilityIssues);
    
    // Phase 5: Vérification de sécurité
    const securityIssues = await this.checkSecurity(code);
    errors.push(...securityIssues);
    
    // Phase 6: Auto-correction si possible
    const fixResult = await this.attemptAutoFix(code, errors, warnings);
    if (fixResult.fixed) {
      fixedCode = fixResult.code;
      autoFixed = true;
      
      // Re-valider le code corrigé
      const revalidation = await this.quickValidation(fixedCode);
      if (revalidation.errors.length < errors.length) {
        errors.length = 0; // Clear errors that were fixed
        errors.push(...revalidation.errors);
      }
    }
    
    // Calcul du score de qualité
    const score = this.calculateQualityScore(errors, warnings, code);
    
    // Génération de suggestions d'amélioration
    suggestions.push(...this.generateSuggestions(code, errors, warnings));
    
    console.log(`✅ Validation terminée - Score: ${score}/100, Erreurs: ${errors.length}, Avertissements: ${warnings.length}`);
    
    return {
      valid: errors.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length === 0,
      errors,
      warnings,
      suggestions,
      score,
      autoFixed,
      fixedCode: autoFixed ? fixedCode : undefined
    };
  }

  private async detectSyntaxErrors(code: string): Promise<ErrorReport[]> {
    const errors: ErrorReport[] = [];
    
    try {
      // Tentative de parsing basique
      new Function(code);
    } catch (error) {
      if (error instanceof SyntaxError) {
        const lines = code.split('\n');
        const errorLine = this.extractLineNumber(error.message);
        
        errors.push({
          id: `syntax_${Date.now()}`,
          type: 'SYNTAX',
          severity: 'HIGH',
          message: error.message,
          line: errorLine,
          context: lines[errorLine - 1] || '',
          suggestions: this.getSyntaxSuggestions(error.message),
          autoFixable: this.isSyntaxAutoFixable(error.message)
        });
      }
    }
    
    // Vérifications supplémentaires avec regex
    for (const [patternName, pattern] of this.patterns) {
      if (patternName.startsWith('syntax_')) {
        const matches = Array.from(code.matchAll(pattern));
        for (const match of matches) {
          const lineNumber = this.getLineNumber(code, match.index || 0);
          
          errors.push({
            id: `${patternName}_${Date.now()}_${match.index}`,
            type: 'SYNTAX',
            severity: 'MEDIUM',
            message: `Problème détecté: ${patternName.replace('syntax_', '')}`,
            line: lineNumber,
            context: match[0],
            suggestions: [`Corriger: ${match[0]}`],
            autoFixable: this.fixes.has(patternName)
          });
        }
      }
    }
    
    return errors;
  }

  private async detectLogicErrors(code: string): Promise<ErrorReport[]> {
    const errors: ErrorReport[] = [];
    
    // Variables non déclarées
    const undeclaredVars = this.findUndeclaredVariables(code);
    for (const varName of undeclaredVars) {
      errors.push({
        id: `undeclared_${varName}_${Date.now()}`,
        type: 'LOGIC',
        severity: 'HIGH',
        message: `Variable non déclarée: ${varName}`,
        context: varName,
        suggestions: [`Déclarer 'let ${varName};' ou 'const ${varName} = ...;'`],
        autoFixable: true
      });
    }
    
    // Fonctions non définies
    const undefinedFunctions = this.findUndefinedFunctions(code);
    for (const funcName of undefinedFunctions) {
      errors.push({
        id: `undefined_func_${funcName}_${Date.now()}`,
        type: 'LOGIC',
        severity: 'HIGH',
        message: `Fonction non définie: ${funcName}`,
        context: funcName,
        suggestions: [`Définir la fonction ${funcName}() ou l'importer`],
        autoFixable: false
      });
    }
    
    // Conditions illogiques
    const logicIssues = this.findLogicIssues(code);
    errors.push(...logicIssues);
    
    return errors;
  }

  private async analyzePerformance(code: string): Promise<ErrorReport[]> {
    const issues: ErrorReport[] = [];
    
    // Boucles potentiellement coûteuses
    const expensiveLoops = this.findExpensiveLoops(code);
    issues.push(...expensiveLoops);
    
    // Allocations mémoire excessives
    const memoryIssues = this.findMemoryIssues(code);
    issues.push(...memoryIssues);
    
    // Opérations DOM coûteuses
    const domIssues = this.findDOMIssues(code);
    issues.push(...domIssues);
    
    return issues;
  }

  private async checkCompatibility(code: string, context: any): Promise<ErrorReport[]> {
    const issues: ErrorReport[] = [];
    
    // Vérifier les fonctionnalités modernes
    const modernFeatures = ['async', 'await', 'const', 'let', '=>', 'class'];
    for (const feature of modernFeatures) {
      if (code.includes(feature) && context.targetES && context.targetES < 6) {
        issues.push({
          id: `compat_${feature}_${Date.now()}`,
          type: 'COMPATIBILITY',
          severity: 'MEDIUM',
          message: `Fonctionnalité ES6+ utilisée: ${feature}`,
          context: feature,
          suggestions: ['Utiliser un transpiler', 'Adapter pour ES5'],
          autoFixable: false
        });
      }
    }
    
    // API Canvas/WebGL
    if (code.includes('getContext') && context.platform === 'node') {
      issues.push({
        id: `canvas_node_${Date.now()}`,
        type: 'COMPATIBILITY',
        severity: 'HIGH',
        message: 'Canvas API non disponible dans Node.js',
        context: 'getContext',
        suggestions: ['Utiliser canvas pour Node.js', 'Adapter pour environnement serveur'],
        autoFixable: false
      });
    }
    
    return issues;
  }

  private async checkSecurity(code: string): Promise<ErrorReport[]> {
    const issues: ErrorReport[] = [];
    
    // eval() usage
    if (code.includes('eval(')) {
      issues.push({
        id: `security_eval_${Date.now()}`,
        type: 'SECURITY',
        severity: 'CRITICAL',
        message: 'Utilisation dangereuse de eval()',
        context: 'eval(',
        suggestions: ['Éviter eval()', 'Utiliser JSON.parse() si approprié'],
        autoFixable: false
      });
    }
    
    // innerHTML sans validation
    const innerHTMLMatches = code.match(/innerHTML\s*=\s*[^;]+/g);
    if (innerHTMLMatches) {
      for (const match of innerHTMLMatches) {
        issues.push({
          id: `security_innerHTML_${Date.now()}`,
          type: 'SECURITY',
          severity: 'MEDIUM',
          message: 'Utilisation potentiellement dangereuse de innerHTML',
          context: match,
          suggestions: ['Valider le contenu', 'Utiliser textContent si possible'],
          autoFixable: false
        });
      }
    }
    
    return issues;
  }

  private async attemptAutoFix(code: string, errors: ErrorReport[], warnings: ErrorReport[]): Promise<{ fixed: boolean; code: string }> {
    let fixedCode = code;
    let hasChanges = false;
    
    // Tentative de correction des erreurs auto-fixables
    const fixableErrors = [...errors, ...warnings].filter(e => e.autoFixable);
    
    for (const error of fixableErrors) {
      const fixFunction = this.fixes.get(error.type.toLowerCase() + '_' + error.id.split('_')[0]);
      if (fixFunction) {
        try {
          const newCode = fixFunction(fixedCode, [] as any); // Simplified for now
          if (newCode !== fixedCode) {
            fixedCode = newCode;
            hasChanges = true;
            console.log(`🔧 Auto-correction appliquée pour: ${error.message}`);
          }
        } catch (fixError) {
          console.warn(`Échec de l'auto-correction pour ${error.id}:`, fixError);
        }
      }
    }
    
    // Corrections génériques
    if (!hasChanges) {
      fixedCode = this.applyGenericFixes(fixedCode);
      hasChanges = fixedCode !== code;
    }
    
    return { fixed: hasChanges, code: fixedCode };
  }

  private async quickValidation(code: string): Promise<{ errors: ErrorReport[] }> {
    const errors: ErrorReport[] = [];
    
    try {
      new Function(code);
    } catch (error) {
      if (error instanceof SyntaxError) {
        errors.push({
          id: `quick_syntax_${Date.now()}`,
          type: 'SYNTAX',
          severity: 'HIGH',
          message: error.message,
          context: '',
          suggestions: [],
          autoFixable: false
        });
      }
    }
    
    return { errors };
  }

  private calculateQualityScore(errors: ErrorReport[], warnings: ErrorReport[], code: string): number {
    let score = 100;
    
    // Pénalités pour les erreurs
    for (const error of errors) {
      switch (error.severity) {
        case 'CRITICAL': score -= 25; break;
        case 'HIGH': score -= 15; break;
        case 'MEDIUM': score -= 8; break;
        case 'LOW': score -= 3; break;
      }
    }
    
    // Pénalités pour les avertissements
    for (const warning of warnings) {
      switch (warning.severity) {
        case 'HIGH': score -= 5; break;
        case 'MEDIUM': score -= 3; break;
        case 'LOW': score -= 1; break;
      }
    }
    
    // Bonus pour les bonnes pratiques
    if (code.includes('use strict')) score += 5;
    if (code.includes('try {') && code.includes('catch')) score += 3;
    if (code.includes('const ') || code.includes('let ')) score += 2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private generateSuggestions(code: string, errors: ErrorReport[], warnings: ErrorReport[]): string[] {
    const suggestions: string[] = [];
    
    // Suggestions basées sur les erreurs
    if (errors.some(e => e.type === 'SYNTAX')) {
      suggestions.push('Vérifier la syntaxe JavaScript');
    }
    
    if (warnings.some(w => w.type === 'PERFORMANCE')) {
      suggestions.push('Optimiser les performances');
    }
    
    // Suggestions générales
    if (!code.includes('use strict')) {
      suggestions.push('Ajouter "use strict" en début de fichier');
    }
    
    if (code.split('\n').length > 100 && !code.includes('//')) {
      suggestions.push('Ajouter des commentaires pour améliorer la lisibilité');
    }
    
    return suggestions;
  }

  // Méthodes utilitaires
  private extractLineNumber(errorMessage: string): number {
    const match = errorMessage.match(/line (\d+)/i);
    return match ? parseInt(match[1]) : 1;
  }

  private getLineNumber(code: string, position: number): number {
    return code.substring(0, position).split('\n').length;
  }

  private getSyntaxSuggestions(errorMessage: string): string[] {
    const suggestions = [];
    
    if (errorMessage.includes('Unexpected token')) {
      suggestions.push('Vérifier les parenthèses, crochets et accolades');
      suggestions.push('Vérifier la syntaxe des objets et tableaux');
    }
    
    if (errorMessage.includes('Unexpected end of input')) {
      suggestions.push('Vérifier que toutes les accolades sont fermées');
    }
    
    return suggestions;
  }

  private isSyntaxAutoFixable(errorMessage: string): boolean {
    const autoFixableErrors = [
      'missing semicolon',
      'unexpected semicolon',
      'trailing comma'
    ];
    
    return autoFixableErrors.some(pattern => 
      errorMessage.toLowerCase().includes(pattern)
    );
  }

  private findUndeclaredVariables(code: string): string[] {
    // Implémentation simplifiée
    const declared = new Set<string>();
    const used = new Set<string>();
    
    // Trouver les déclarations
    const declarationMatches = code.matchAll(/(?:var|let|const)\s+(\w+)/g);
    for (const match of declarationMatches) {
      declared.add(match[1]);
    }
    
    // Trouver les utilisations
    const usageMatches = code.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g);
    for (const match of usageMatches) {
      const varName = match[1];
      if (!['var', 'let', 'const', 'function', 'class', 'if', 'for', 'while'].includes(varName)) {
        used.add(varName);
      }
    }
    
    // Variables utilisées mais non déclarées
    return Array.from(used).filter(v => !declared.has(v));
  }

  private findUndefinedFunctions(code: string): string[] {
    // Implémentation simplifiée pour trouver les fonctions non définies
    return [];
  }

  private findLogicIssues(code: string): ErrorReport[] {
    const issues: ErrorReport[] = [];
    
    // Conditions toujours vraies/fausses
    if (code.includes('if (true)')) {
      issues.push({
        id: `logic_always_true_${Date.now()}`,
        type: 'LOGIC',
        severity: 'MEDIUM',
        message: 'Condition toujours vraie détectée',
        context: 'if (true)',
        suggestions: ['Supprimer la condition ou corriger la logique'],
        autoFixable: false
      });
    }
    
    return issues;
  }

  private findExpensiveLoops(code: string): ErrorReport[] {
    const issues: ErrorReport[] = [];
    
    // Boucles imbriquées
    const nestedLoops = (code.match(/for\s*\([^}]*for\s*\(/g) || []).length;
    if (nestedLoops > 0) {
      issues.push({
        id: `perf_nested_loops_${Date.now()}`,
        type: 'PERFORMANCE',
        severity: 'MEDIUM',
        message: `${nestedLoops} boucle(s) imbriquée(s) détectée(s)`,
        context: 'boucles imbriquées',
        suggestions: ['Optimiser l\'algorithme', 'Utiliser des méthodes plus efficaces'],
        autoFixable: false
      });
    }
    
    return issues;
  }

  private findMemoryIssues(code: string): ErrorReport[] {
    const issues: ErrorReport[] = [];
    
    // Créations d'objets en boucle
    if (code.includes('new ') && (code.includes('for (') || code.includes('while ('))) {
      issues.push({
        id: `memory_allocation_loop_${Date.now()}`,
        type: 'PERFORMANCE',
        severity: 'MEDIUM',
        message: 'Allocation d\'objets potentielle en boucle',
        context: 'new Object() dans une boucle',
        suggestions: ['Réutiliser les objets', 'Optimiser les allocations'],
        autoFixable: false
      });
    }
    
    return issues;
  }

  private findDOMIssues(code: string): ErrorReport[] {
    const issues: ErrorReport[] = [];
    
    // Accès DOM répétés
    const domAccess = (code.match(/document\.|getElementById|querySelector/g) || []).length;
    if (domAccess > 5) {
      issues.push({
        id: `dom_access_${Date.now()}`,
        type: 'PERFORMANCE',
        severity: 'LOW',
        message: `${domAccess} accès DOM détectés`,
        context: 'accès DOM multiples',
        suggestions: ['Mettre en cache les références DOM', 'Grouper les modifications DOM'],
        autoFixable: false
      });
    }
    
    return issues;
  }

  private applyGenericFixes(code: string): string {
    let fixedCode = code;
    
    // Ajouter des points-virgules manquants
    fixedCode = fixedCode.replace(/(\w)\n/g, '$1;\n');
    
    // Corriger les espaces autour des opérateurs
    fixedCode = fixedCode.replace(/(\w)=(\w)/g, '$1 = $2');
    
    // Autres corrections génériques...
    
    return fixedCode;
  }

  private initializePatterns(): void {
    // Patterns pour détecter les erreurs communes
    this.patterns.set('syntax_missing_semicolon', /\w\n\s*(?!\})/g);
    this.patterns.set('syntax_trailing_comma', /,\s*[\}\]]/g);
    this.patterns.set('syntax_double_semicolon', /;;/g);
  }

  private initializeFixes(): void {
    // Fonctions de correction automatique
    this.fixes.set('syntax_missing_semicolon', (code: string) => {
      return code.replace(/(\w)\n/g, '$1;\n');
    });
    
    this.fixes.set('syntax_trailing_comma', (code: string) => {
      return code.replace(/,(\s*[\}\]])/g, '$1');
    });
  }

  private initializePerformanceRules(): void {
    // Règles de performance
    this.performanceRules.set('max_loop_depth', 3);
    this.performanceRules.set('max_dom_access', 10);
    this.performanceRules.set('max_function_length', 50);
  }
}

export const errorDetectionModule = new ErrorDetectionModule();
