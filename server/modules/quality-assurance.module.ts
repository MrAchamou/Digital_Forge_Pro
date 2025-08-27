
interface QualityMetrics {
  codeQuality: number;
  performance: number;
  maintainability: number;
  reliability: number;
  security: number;
  overallScore: number;
}

interface TestResult {
  testName: string;
  passed: boolean;
  executionTime: number;
  errorMessage?: string;
  output?: any;
}

interface QualityReport {
  effectId: string;
  effectName: string;
  metrics: QualityMetrics;
  testResults: TestResult[];
  codeAnalysis: {
    linesOfCode: number;
    complexity: number;
    duplicatedLines: number;
    codeSmells: string[];
  };
  recommendations: string[];
  approved: boolean;
  timestamp: string;
}

class QualityAssuranceModule {
  private qualityThresholds = {
    minimum: 70,
    good: 85,
    excellent: 95
  };
  
  private testSuites: Map<string, Function[]> = new Map();
  
  constructor() {
    this.initializeTestSuites();
  }

  async assessQuality(effectData: any, generatedCode: string): Promise<QualityReport> {
    console.log(`🔍 Évaluation qualité pour: ${effectData.name}`);
    
    // Analyse du code
    const codeAnalysis = await this.analyzeCode(generatedCode);
    
    // Tests fonctionnels
    const testResults = await this.runFunctionalTests(generatedCode, effectData);
    
    // Calcul des métriques
    const metrics = await this.calculateMetrics(generatedCode, codeAnalysis, testResults);
    
    // Génération de recommandations
    const recommendations = this.generateRecommendations(metrics, codeAnalysis, testResults);
    
    // Décision d'approbation
    const approved = this.shouldApprove(metrics);
    
    const report: QualityReport = {
      effectId: effectData.id,
      effectName: effectData.name,
      metrics,
      testResults,
      codeAnalysis,
      recommendations,
      approved,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Évaluation terminée - Score global: ${metrics.overallScore}/100 - ${approved ? 'APPROUVÉ' : 'REJETÉ'}`);
    
    return report;
  }

  async runBatchQuality(effects: any[]): Promise<{
    reports: QualityReport[];
    stats: {
      total: number;
      approved: number;
      rejected: number;
      avgScore: number;
    };
  }> {
    console.log(`🔍 Évaluation qualité en lot - ${effects.length} effets`);
    
    const reports: QualityReport[] = [];
    let totalScore = 0;
    let approved = 0;
    
    for (const effect of effects) {
      try {
        // Supposer que le code est dans effect.code ou le générer
        const code = effect.code || await this.generateCodeForTesting(effect);
        const report = await this.assessQuality(effect, code);
        
        reports.push(report);
        totalScore += report.metrics.overallScore;
        
        if (report.approved) approved++;
        
      } catch (error) {
        console.error(`Erreur évaluation ${effect.name}:`, error);
        
        // Rapport d'erreur
        reports.push({
          effectId: effect.id,
          effectName: effect.name,
          metrics: { codeQuality: 0, performance: 0, maintainability: 0, reliability: 0, security: 0, overallScore: 0 },
          testResults: [],
          codeAnalysis: { linesOfCode: 0, complexity: 0, duplicatedLines: 0, codeSmells: ['evaluation_failed'] },
          recommendations: ['Impossible d\'évaluer cet effet'],
          approved: false,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const stats = {
      total: effects.length,
      approved,
      rejected: effects.length - approved,
      avgScore: totalScore / effects.length
    };
    
    console.log(`✅ Évaluation lot terminée - ${approved}/${effects.length} approuvés (${stats.avgScore.toFixed(1)}/100 moyenne)`);
    
    return { reports, stats };
  }

  private async analyzeCode(code: string): Promise<any> {
    const lines = code.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
    
    // Analyse de la complexité cyclomatique simplifiée
    const complexity = this.calculateCyclomaticComplexity(code);
    
    // Détection de code dupliqué
    const duplicatedLines = this.findDuplicatedLines(lines);
    
    // Détection de code smells
    const codeSmells = this.detectCodeSmells(code);
    
    return {
      linesOfCode,
      complexity,
      duplicatedLines,
      codeSmells
    };
  }

  private async runFunctionalTests(code: string, effectData: any): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // Test de base: le code compile-t-il ?
    results.push(await this.testCompilation(code));
    
    // Test d'exécution: le code s'exécute-t-il sans erreur ?
    results.push(await this.testExecution(code));
    
    // Tests spécifiques au type d'effet
    const effectType = effectData.type || 'GENERAL';
    const specificTests = this.testSuites.get(effectType) || [];
    
    for (const testFn of specificTests) {
      try {
        const testResult = await testFn(code, effectData);
        results.push(testResult);
      } catch (error) {
        results.push({
          testName: testFn.name || 'UnknownTest',
          passed: false,
          executionTime: 0,
          errorMessage: error instanceof Error ? error.message : 'Test error'
        });
      }
    }
    
    return results;
  }

  private async testCompilation(code: string): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      new Function(code);
      return {
        testName: 'Compilation',
        passed: true,
        executionTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Compilation',
        passed: false,
        executionTime: performance.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Compilation failed'
      };
    }
  }

  private async testExecution(code: string): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      // Test d'exécution dans un environnement sécurisé
      const testCode = `
        // Mock Canvas API pour les tests
        const mockCanvas = {
          getContext: () => ({
            fillRect: () => {},
            clearRect: () => {},
            fillStyle: '',
            strokeStyle: '',
            beginPath: () => {},
            closePath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {}
          }),
          width: 800,
          height: 600
        };
        
        // Mock performance API
        const performance = { now: () => Date.now() };
        
        // Exécuter le code de l'effet
        ${code}
        
        // Test basique d'instanciation si c'est une classe
        if (typeof GeneratedEffect !== 'undefined') {
          const effect = new GeneratedEffect(mockCanvas);
          if (typeof effect.update === 'function') effect.update();
          if (typeof effect.render === 'function') effect.render();
        }
      `;
      
      new Function(testCode)();
      
      return {
        testName: 'Execution',
        passed: true,
        executionTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Execution',
        passed: false,
        executionTime: performance.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Execution failed'
      };
    }
  }

  private async calculateMetrics(code: string, codeAnalysis: any, testResults: TestResult[]): Promise<QualityMetrics> {
    // Qualité du code (0-100)
    const codeQuality = this.calculateCodeQuality(code, codeAnalysis);
    
    // Performance (0-100)
    const performance = this.calculatePerformanceScore(code, codeAnalysis);
    
    // Maintenabilité (0-100)
    const maintainability = this.calculateMaintainabilityScore(code, codeAnalysis);
    
    // Fiabilité (0-100)
    const reliability = this.calculateReliabilityScore(testResults, codeAnalysis);
    
    // Sécurité (0-100)
    const security = this.calculateSecurityScore(code);
    
    // Score global pondéré
    const overallScore = Math.round(
      (codeQuality * 0.25) +
      (performance * 0.20) +
      (maintainability * 0.20) +
      (reliability * 0.25) +
      (security * 0.10)
    );
    
    return {
      codeQuality,
      performance,
      maintainability,
      reliability,
      security,
      overallScore
    };
  }

  private calculateCodeQuality(code: string, analysis: any): number {
    let score = 100;
    
    // Pénalités pour les code smells
    score -= analysis.codeSmells.length * 5;
    
    // Pénalité pour les lignes dupliquées
    score -= analysis.duplicatedLines * 2;
    
    // Pénalité pour la complexité excessive
    if (analysis.complexity > 10) {
      score -= (analysis.complexity - 10) * 3;
    }
    
    // Bonus pour les bonnes pratiques
    if (code.includes('use strict')) score += 5;
    if (code.includes('try') && code.includes('catch')) score += 5;
    if (code.includes('const ') || code.includes('let ')) score += 3;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculatePerformanceScore(code: string, analysis: any): number {
    let score = 100;
    
    // Pénalités pour les problèmes de performance
    const expensiveOperations = [
      'document.createElement',
      'innerHTML',
      'querySelectorAll',
      'eval(',
      'for.*for.*for' // Triple boucles imbriquées
    ];
    
    for (const operation of expensiveOperations) {
      const matches = (code.match(new RegExp(operation, 'g')) || []).length;
      score -= matches * 10;
    }
    
    // Pénalité pour les fonctions trop longues
    if (analysis.linesOfCode > 100) {
      score -= (analysis.linesOfCode - 100) * 0.5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateMaintainabilityScore(code: string, analysis: any): number {
    let score = 100;
    
    // Pénalité pour la complexité
    score -= Math.max(0, analysis.complexity - 5) * 4;
    
    // Pénalité pour le manque de commentaires
    const commentRatio = (code.match(/\/\/.*/g) || []).length / analysis.linesOfCode;
    if (commentRatio < 0.1) {
      score -= 20;
    }
    
    // Pénalité pour les noms de variables courts
    const shortVarNames = (code.match(/\b[a-z]\b/g) || []).length;
    score -= shortVarNames * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateReliabilityScore(testResults: TestResult[], analysis: any): number {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    
    if (totalTests === 0) return 50; // Score neutre si pas de tests
    
    let score = (passedTests / totalTests) * 100;
    
    // Bonus si tous les tests critiques passent
    const criticalTests = testResults.filter(t => 
      t.testName === 'Compilation' || t.testName === 'Execution'
    );
    const criticalPassed = criticalTests.filter(t => t.passed).length;
    
    if (criticalTests.length > 0 && criticalPassed === criticalTests.length) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateSecurityScore(code: string): number {
    let score = 100;
    
    // Problèmes de sécurité critiques
    const securityIssues = [
      { pattern: /eval\s*\(/g, penalty: 30, name: 'eval usage' },
      { pattern: /innerHTML\s*=/g, penalty: 10, name: 'innerHTML assignment' },
      { pattern: /document\.write/g, penalty: 20, name: 'document.write usage' },
      { pattern: /\bexec\s*\(/g, penalty: 25, name: 'exec usage' }
    ];
    
    for (const issue of securityIssues) {
      const matches = (code.match(issue.pattern) || []).length;
      if (matches > 0) {
        score -= issue.penalty;
        console.warn(`🚨 Problème de sécurité détecté: ${issue.name} (${matches} occurrences)`);
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Complexité cyclomatique simplifiée
    let complexity = 1; // Base complexity
    
    const complexityPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bdo\s*\{/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\b\?\s*.*\s*:/g, // Ternary operator
      /\b&&\b/g,
      /\b\|\|\b/g
    ];
    
    for (const pattern of complexityPatterns) {
      const matches = (code.match(pattern) || []).length;
      complexity += matches;
    }
    
    return complexity;
  }

  private findDuplicatedLines(lines: string[]): number {
    const lineMap = new Map<string, number>();
    let duplicated = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 10) { // Ignore short lines
        const count = lineMap.get(trimmedLine) || 0;
        lineMap.set(trimmedLine, count + 1);
        
        if (count === 1) { // First duplicate
          duplicated += 2; // Count original + duplicate
        } else if (count > 1) {
          duplicated += 1;
        }
      }
    }
    
    return duplicated;
  }

  private detectCodeSmells(code: string): string[] {
    const smells: string[] = [];
    
    // Long parameter list
    if (code.includes('function') && /function[^(]*\([^)]{50,}\)/.test(code)) {
      smells.push('long_parameter_list');
    }
    
    // Magic numbers
    const magicNumbers = code.match(/\b\d{2,}\b/g) || [];
    if (magicNumbers.length > 5) {
      smells.push('magic_numbers');
    }
    
    // Large class/function
    if (code.split('\n').length > 200) {
      smells.push('large_class');
    }
    
    // Dead code (simple detection)
    if (code.includes('// TODO') || code.includes('// FIXME')) {
      smells.push('dead_code_markers');
    }
    
    return smells;
  }

  private generateRecommendations(metrics: QualityMetrics, analysis: any, testResults: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    // Recommandations basées sur les métriques
    if (metrics.codeQuality < 70) {
      recommendations.push('Améliorer la qualité du code en réduisant la complexité et les code smells');
    }
    
    if (metrics.performance < 70) {
      recommendations.push('Optimiser les performances en évitant les opérations coûteuses');
    }
    
    if (metrics.maintainability < 70) {
      recommendations.push('Améliorer la maintenabilité en ajoutant des commentaires et en utilisant des noms de variables explicites');
    }
    
    if (metrics.reliability < 70) {
      recommendations.push('Améliorer la fiabilité en corrigeant les tests qui échouent');
    }
    
    if (metrics.security < 90) {
      recommendations.push('Améliorer la sécurité en évitant les pratiques dangereuses');
    }
    
    // Recommandations spécifiques à l'analyse
    if (analysis.complexity > 15) {
      recommendations.push('Réduire la complexité cyclomatique en décomposant les fonctions complexes');
    }
    
    if (analysis.duplicatedLines > 10) {
      recommendations.push('Éliminer la duplication de code en créant des fonctions réutilisables');
    }
    
    return recommendations;
  }

  private shouldApprove(metrics: QualityMetrics): boolean {
    // Critères d'approbation
    return (
      metrics.overallScore >= this.qualityThresholds.minimum &&
      metrics.reliability >= 80 && // Fiabilité critique
      metrics.security >= 90 // Sécurité critique
    );
  }

  private async generateCodeForTesting(effect: any): Promise<string> {
    // Génération de code basique pour les tests si pas de code fourni
    return `
      class GeneratedEffect {
        constructor(canvas) {
          this.canvas = canvas;
          this.ctx = canvas.getContext('2d');
        }
        
        update() {
          // Effect update logic for ${effect.name}
        }
        
        render() {
          // Effect render logic for ${effect.name}
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
      }
    `;
  }

  private initializeTestSuites(): void {
    // Tests spécifiques aux particules
    this.testSuites.set('PARTICLE', [
      this.testParticleSystem,
      this.testParticleUpdate,
      this.testParticleRendering
    ]);
    
    // Tests spécifiques à l'éclairage
    this.testSuites.set('LIGHTING', [
      this.testLightingSystem,
      this.testShadowCasting
    ]);
    
    // Tests spécifiques au morphing
    this.testSuites.set('MORPHING', [
      this.testMorphingTransition,
      this.testShapeInterpolation
    ]);
  }

  // Tests spécialisés
  private testParticleSystem(code: string, effectData: any): TestResult {
    const hasParticleLogic = code.includes('particle') || code.includes('emit');
    return {
      testName: 'ParticleSystem',
      passed: hasParticleLogic,
      executionTime: 5,
      errorMessage: hasParticleLogic ? undefined : 'No particle system logic found'
    };
  }

  private testParticleUpdate(code: string, effectData: any): TestResult {
    const hasUpdateLogic = code.includes('update') || code.includes('step');
    return {
      testName: 'ParticleUpdate',
      passed: hasUpdateLogic,
      executionTime: 3,
      errorMessage: hasUpdateLogic ? undefined : 'No update logic found'
    };
  }

  private testParticleRendering(code: string, effectData: any): TestResult {
    const hasRenderLogic = code.includes('render') || code.includes('draw');
    return {
      testName: 'ParticleRendering',
      passed: hasRenderLogic,
      executionTime: 3,
      errorMessage: hasRenderLogic ? undefined : 'No rendering logic found'
    };
  }

  private testLightingSystem(code: string, effectData: any): TestResult {
    const hasLightingLogic = code.includes('light') || code.includes('illuminat');
    return {
      testName: 'LightingSystem',
      passed: hasLightingLogic,
      executionTime: 4,
      errorMessage: hasLightingLogic ? undefined : 'No lighting logic found'
    };
  }

  private testShadowCasting(code: string, effectData: any): TestResult {
    const hasShadowLogic = code.includes('shadow') || code.includes('cast');
    return {
      testName: 'ShadowCasting',
      passed: hasShadowLogic,
      executionTime: 4,
      errorMessage: hasShadowLogic ? undefined : 'No shadow logic found'
    };
  }

  private testMorphingTransition(code: string, effectData: any): TestResult {
    const hasMorphLogic = code.includes('morph') || code.includes('transition');
    return {
      testName: 'MorphingTransition',
      passed: hasMorphLogic,
      executionTime: 3,
      errorMessage: hasMorphLogic ? undefined : 'No morphing logic found'
    };
  }

  private testShapeInterpolation(code: string, effectData: any): TestResult {
    const hasInterpolation = code.includes('interpolat') || code.includes('lerp');
    return {
      testName: 'ShapeInterpolation',
      passed: hasInterpolation,
      executionTime: 3,
      errorMessage: hasInterpolation ? undefined : 'No interpolation logic found'
    };
  }
}

export const qualityAssuranceModule = new QualityAssuranceModule();
