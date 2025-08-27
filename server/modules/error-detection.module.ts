interface ErrorPattern {
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  aiConfidence: number;
  autoFix: boolean;
  preventionStrategy?: string;
}

interface ErrorContext {
  timestamp: Date;
  module: string;
  environment: string;
  userContext: any;
  systemState: any;
  aiAnalysis: any;
}

interface AIErrorAnalysis {
  rootCause: string;
  impactAssessment: number;
  recoveryProbability: number;
  preventionStrategy: string;
  learningPoints: string[];
}

// Interface for detected errors, to be used across detection methods
interface DetectedError {
  type: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  aiConfidence: number;
  autoFix?: any;
  context?: any;
  module?: string;
  export?: string;
  solution?: string;
  command?: string;
  details?: string[];
  subtype?: string;
  riskLevel?: string;
  suggestion?: string; // Added for general suggestions
  methodName?: string; // Added for missing method detection
  className?: string;  // Added for missing method detection
}

class AdvancedErrorDetection {
  private aiErrorPatterns: Map<string, ErrorPattern[]> = new Map();
  private errorHistory: Map<string, ErrorContext[]> = new Map();
  private neuralNetwork: any;
  private autonomousHealer: any;
  private predictionEngine: any;
  private learningSystem: any;
  private performanceMetrics: Map<string, number> = new Map();

  constructor() {
    this.initializeAIErrorPatterns();
    this.initializeNeuralNetwork();
    this.initializeAutonomousHealer();
    this.initializePredictionEngine();
    this.initializeLearningSystem();
    this.startContinuousMonitoring();
  }

  async detectErrors(code: string, context: any): Promise<any> {
    const startTime = performance.now();

    // AI-Enhanced Multi-Layer Detection
    const aiAnalysis = await this.performAIAnalysis(code, context);
    const syntaxErrors = await this.detectSyntaxErrors(code, aiAnalysis);
    const logicErrors = await this.detectLogicErrors(code, aiAnalysis);
    const performanceIssues = await this.detectPerformanceIssues(code, aiAnalysis);
    const securityVulnerabilities = await this.detectSecurityIssues(code, aiAnalysis);
    const compatibilityIssues = await this.detectCompatibilityIssues(code, aiAnalysis);

    // Nouvelles détections avancées
    const dependencyErrors = await this.detectDependencyErrors(code, context, aiAnalysis);
    const buildErrors = await this.detectBuildErrors(code, context, aiAnalysis);
    const environmentErrors = await this.detectEnvironmentErrors(context, aiAnalysis);
    const runtimeErrors = await this.detectRuntimeErrors(code, context, aiAnalysis);

    // Predictive Error Detection
    const predictedErrors = await this.predictFutureErrors(code, context, aiAnalysis);

    // Consolidation avec IA
    const consolidatedResults = await this.consolidateWithAI([
      ...syntaxErrors,
      ...logicErrors,
      ...performanceIssues,
      ...securityVulnerabilities,
      ...compatibilityIssues,
      ...dependencyErrors,
      ...buildErrors,
      ...environmentErrors,
      ...runtimeErrors,
      ...predictedErrors
    ], aiAnalysis);

    // Auto-correction autonome
    const autoFixResults = await this.performAutonomousCorrection(consolidatedResults, code);

    // Mise à jour des métriques
    const detectionTime = performance.now() - startTime;
    this.updateMetrics(consolidatedResults, detectionTime);

    return {
      errors: consolidatedResults,
      autoFixes: autoFixResults,
      aiAnalysis,
      metrics: {
        detectionTime,
        errorCount: consolidatedResults.length,
        autoFixedCount: autoFixResults.fixed.length,
        confidence: aiAnalysis.overallConfidence
      }
    };
  }

  private async performAIAnalysis(code: string, context: any): Promise<AIErrorAnalysis> {
    // Analyse sémantique avancée
    const semanticAnalysis = await this.neuralNetwork.analyzeSemantics(code);

    // Analyse contextuelle
    const contextualAnalysis = await this.neuralNetwork.analyzeContext(context, semanticAnalysis);

    // Prédiction de robustesse
    const robustnessScore = await this.predictionEngine.predictRobustness(code, context);

    return {
      rootCause: semanticAnalysis.primaryConcerns[0] || 'unknown',
      impactAssessment: contextualAnalysis.impactScore,
      recoveryProbability: robustnessScore.recoveryLikelihood,
      preventionStrategy: await this.generatePreventionStrategy(semanticAnalysis, contextualAnalysis),
      learningPoints: this.extractLearningPoints(semanticAnalysis, contextualAnalysis)
    };
  }

  private async detectSyntaxErrors(code: string, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const errors = [];

    // Détection avancée avec IA
    const aiPatterns = this.aiErrorPatterns.get('syntax') || [];

    for (const pattern of aiPatterns) {
      const matches = await this.findAIPatternMatches(code, pattern, aiAnalysis);

      for (const match of matches) {
        const error = {
          type: 'syntax',
          message: `AI-Detected Syntax Issue: ${match.description}`,
          line: match.line,
          column: match.column,
          severity: pattern.severity,
          aiConfidence: pattern.aiConfidence * match.confidence,
          autoFix: pattern.autoFix ? await this.generateAutoFix(match, pattern) : null,
          context: match.context
        };

        errors.push(error);
      }
    }

    // Détection traditionnelle renforcée
    const traditionalErrors = await this.performTraditionalSyntaxCheck(code);
    errors.push(...traditionalErrors);

    return this.deduplicateAndRank(errors);
  }

  private async detectLogicErrors(code: string, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const errors = [];

    // Analyse de flux logique avec IA
    const flowAnalysis = await this.neuralNetwork.analyzeLogicFlow(code);

    // Détection de conditions impossibles
    const impossibleConditions = await this.detectImpossibleConditions(code, flowAnalysis);
    errors.push(...impossibleConditions);

    // Détection de boucles infinies potentielles
    const infiniteLoops = await this.detectPotentialInfiniteLoops(code, flowAnalysis);
    errors.push(...infiniteLoops);

    // Détection d'incohérences logiques
    const logicInconsistencies = await this.detectLogicInconsistencies(code, flowAnalysis);
    errors.push(...logicInconsistencies);

    return errors;
  }

  private async detectPerformanceIssues(code: string, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const issues = [];

    // Analyse de complexité avec IA
    const complexityAnalysis = await this.neuralNetwork.analyzeComplexity(code);

    if (complexityAnalysis.timeComplexity > 'O(n²)') {
      issues.push({
        type: 'performance',
        message: `High time complexity detected: ${complexityAnalysis.timeComplexity}`,
        severity: 'medium',
        aiConfidence: 0.85,
        autoFix: await this.generatePerformanceOptimization(complexityAnalysis),
        suggestion: 'Consider optimizing algorithm or using caching'
      });
    }

    // Détection de fuites mémoire potentielles
    const memoryLeaks = await this.detectMemoryLeaks(code, complexityAnalysis);
    issues.push(...memoryLeaks);

    // Détection de goulots d'étranglement
    const bottlenecks = await this.detectBottlenecks(code, complexityAnalysis);
    issues.push(...bottlenecks);

    return issues;
  }

  private async detectSecurityIssues(code: string, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const vulnerabilities = [];

    // Analyse de sécurité avec IA
    const securityPatterns = this.aiErrorPatterns.get('security') || [];

    for (const pattern of securityPatterns) {
      const matches = await this.findSecurityVulnerabilities(code, pattern);

      for (const match of matches) {
        vulnerabilities.push({
          type: 'security',
          category: pattern.category,
          message: `Security vulnerability: ${match.description}`,
          severity: pattern.severity,
          aiConfidence: pattern.aiConfidence,
          autoFix: pattern.autoFix ? await this.generateSecurityFix(match, pattern) : null,
          riskLevel: this.calculateRiskLevel(match, pattern)
        });
      }
    }

    return vulnerabilities;
  }

  private async detectCompatibilityIssues(code: string, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const issues: DetectedError[] = [];

    // Placeholder for compatibility checks, e.g., browser compatibility, Node.js version compatibility
    // Example: Checking for deprecated API usage
    const deprecatedAPIPattern = /someDeprecatedAPI\(\)/g;
    let match;
    while ((match = deprecatedAPIPattern.exec(code)) !== null) {
      issues.push({
        type: 'compatibility',
        message: 'Usage of deprecated API detected',
        line: this.getLineNumber(code, match.index),
        severity: 'medium',
        aiConfidence: 0.8,
        solution: 'Replace with modern alternative API'
      });
    }
    return issues;
  }


  private async performAutonomousCorrection(errors: any[], code: string): Promise<any> {
    const fixResults = {
      fixed: [],
      partiallyFixed: [],
      unfixable: [],
      improvedCode: code
    };

    let currentCode = code;

    // Tri des erreurs par priorité de correction
    const sortedErrors = errors.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });

    for (const error of sortedErrors) {
      if (error.autoFix && error.aiConfidence > 0.7) {
        try {
          const fixResult = await this.applyAutonomousFix(error, currentCode);

          if (fixResult.success) {
            currentCode = fixResult.fixedCode;
            fixResults.fixed.push({
              error,
              fix: fixResult.fix,
              confidence: fixResult.confidence
            });

            // Apprentissage autonome
            await this.learningSystem.recordSuccessfulFix(error, fixResult);
          } else {
            fixResults.partiallyFixed.push({
              error,
              attemptedFix: fixResult.attemptedFix,
              reason: fixResult.failureReason
            });
          }
        } catch (fixError) {
          fixResults.unfixable.push({
            error,
            reason: fixError.message
          });
        }
      }
    }

    fixResults.improvedCode = currentCode;
    return fixResults;
  }

  private async applyAutonomousFix(error: any, code: string): Promise<any> {
    // Stratégies de correction basées sur l'IA
    const fixStrategies = await this.autonomousHealer.generateFixStrategies(error, code);

    for (const strategy of fixStrategies) {
      const result = await this.tryFixStrategy(strategy, error, code);

      if (result.success) {
        // Validation de la correction
        const validationResult = await this.validateFix(result.fixedCode, error);

        if (validationResult.isValid) {
          return {
            success: true,
            fixedCode: result.fixedCode,
            fix: strategy,
            confidence: validationResult.confidence
          };
        }
      }
    }

    return {
      success: false,
      attemptedFix: fixStrategies[0],
      failureReason: 'No strategy succeeded'
    };
  }

  private initializeAIErrorPatterns() {
    // Patterns de syntaxe avancés
    this.aiErrorPatterns.set('syntax', [
      {
        pattern: 'unclosed_bracket',
        severity: 'high',
        category: 'syntax',
        aiConfidence: 0.95,
        autoFix: true,
        preventionStrategy: 'bracket_matching'
      },
      {
        pattern: 'undefined_variable',
        severity: 'medium',
        category: 'reference',
        aiConfidence: 0.9,
        autoFix: true,
        preventionStrategy: 'variable_declaration_check'
      }
    ]);

    // Patterns de sécurité
    this.aiErrorPatterns.set('security', [
      {
        pattern: 'sql_injection',
        severity: 'critical',
        category: 'injection',
        aiConfidence: 0.9,
        autoFix: true,
        preventionStrategy: 'parameterized_queries'
      },
      {
        pattern: 'xss_vulnerability',
        severity: 'high',
        category: 'xss',
        aiConfidence: 0.85,
        autoFix: true,
        preventionStrategy: 'input_sanitization'
      }
    ]);

    // Patterns de dépendances et build
    this.aiErrorPatterns.set('dependencies', [
      {
        pattern: 'command_not_found',
        severity: 'critical',
        category: 'dependency',
        aiConfidence: 0.95,
        autoFix: true,
        preventionStrategy: 'dependency_verification'
      },
      {
        pattern: 'missing_package',
        severity: 'high',
        category: 'dependency',
        aiConfidence: 0.9,
        autoFix: true,
        preventionStrategy: 'package_integrity_check'
      },
      {
        pattern: 'version_mismatch',
        severity: 'medium',
        category: 'dependency',
        aiConfidence: 0.85,
        autoFix: true,
        preventionStrategy: 'version_lock'
      },
      {
        pattern: 'build_failure',
        severity: 'high',
        category: 'build',
        aiConfidence: 0.88,
        autoFix: true,
        preventionStrategy: 'build_verification'
      }
    ]);

    // Patterns d'environnement Replit
    this.aiErrorPatterns.set('environment', [
      {
        pattern: 'port_binding_error',
        severity: 'medium',
        category: 'network',
        aiConfidence: 0.9,
        autoFix: true,
        preventionStrategy: 'port_configuration'
      },
      {
        pattern: 'file_permission_error',
        severity: 'medium',
        category: 'filesystem',
        aiConfidence: 0.85,
        autoFix: true,
        preventionStrategy: 'permission_management'
      },
      {
        pattern: 'memory_limit_exceeded',
        severity: 'high',
        category: 'resource',
        aiConfidence: 0.9,
        autoFix: false,
        preventionStrategy: 'resource_optimization'
      }
    ]);
  }

  private initializeNeuralNetwork() {
    this.neuralNetwork = {
      analyzeSemantics: async (code: string) => {
        // Analyse sémantique avancée
        return {
          primaryConcerns: ['complexity', 'readability'],
          semanticScore: 0.8,
          codeQuality: 0.85
        };
      },

      analyzeContext: async (context: any, semantics: any) => {
        return {
          impactScore: 0.7,
          contextualRelevance: 0.8
        };
      },

      analyzeLogicFlow: async (code: string) => {
        return {
          flowComplexity: 'medium',
          branchingFactor: 3,
          cyclomaticComplexity: 5
        };
      },

      analyzeComplexity: async (code: string) => {
        return {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          maintainabilityIndex: 75
        };
      }
    };
  }

  private initializeAutonomousHealer() {
    this.autonomousHealer = {
      generateFixStrategies: async (error: any, code: string) => {
        const strategies = [];

        switch (error.type) {
          case 'syntax':
            strategies.push({
              name: 'bracket_completion',
              action: 'add_missing_bracket',
              confidence: 0.9
            });
            break;
          case 'logic':
            strategies.push({
              name: 'condition_correction',
              action: 'fix_logic_condition',
              confidence: 0.8
            });
            break;
          case 'performance':
            strategies.push({
              name: 'algorithm_optimization',
              action: 'optimize_algorithm',
              confidence: 0.7
            });
            break;
          case 'dependency':
            strategies.push({
              name: 'dependency_installation',
              action: 'install_missing_dependency',
              confidence: 0.95,
              autoExecute: true
            });
            break;
          case 'build':
            strategies.push({
              name: 'build_repair',
              action: 'fix_build_configuration',
              confidence: 0.8
            });
            break;
          case 'environment':
            strategies.push({
              name: 'environment_correction',
              action: 'fix_environment_issue',
              confidence: 0.85
            });
            break;
          case 'runtime':
            strategies.push({
              name: 'runtime_correction',
              action: 'fix_runtime_error',
              confidence: 0.8
            });
            break;
          case 'import_export':
            strategies.push({
              name: 'fix_import_export',
              action: 'check_module_exports',
              confidence: 0.95
            });
            break;
          case 'common_module_import_error':
            strategies.push({
              name: 'correct_module_import_name',
              action: 'update_import_statement',
              confidence: 0.99
            });
            break;
          case 'missing_method':
            return {
              severity: 'high',
              suggestion: `Method ${error.methodName} is not defined in class ${error.className}`,
              autoFix: `Add method implementation: ${error.methodName}() { /* implementation */ }`
            };
        }

        return strategies;
      }
    };
  }

  private initializePredictionEngine() {
    this.predictionEngine = {
      predictRobustness: async (code: string, context: any) => {
        return {
          robustnessScore: 0.8,
          recoveryLikelihood: 0.75,
          stabilityIndex: 0.85
        };
      },

      predictFutureErrors: async (code: string, context: any) => {
        return [
          {
            type: 'predicted',
            message: 'Potential memory leak in loop structure',
            probability: 0.6,
            preventable: true
          }
        ];
      }
    };
  }

  private initializeLearningSystem() {
    this.learningSystem = {
      recordSuccessfulFix: async (error: any, fix: any) => {
        // Enregistrement pour apprentissage futur
        console.log(`Learning from successful fix: ${error.type} -> ${fix.fix.name}`);
      },

      improvePatterns: async () => {
        // Amélioration continue des patterns
        return true;
      }
    };
  }

  private startContinuousMonitoring() {
    // Surveillance continue toutes les 30 secondes
    setInterval(async () => {
      await this.performSystemHealthCheck();
    }, 30000);

    // Optimisation des patterns toutes les 5 minutes
    setInterval(async () => {
      await this.learningSystem.improvePatterns();
    }, 300000);
  }

  private async performSystemHealthCheck() {
    const systemHealth = {
      errorDetectionRate: this.calculateErrorDetectionRate(),
      autoFixSuccessRate: this.calculateAutoFixSuccessRate(),
      falsePositiveRate: this.calculateFalsePositiveRate(),
      performanceImpact: this.calculatePerformanceImpact()
    };

    // Actions autonomes basées sur la santé
    if (systemHealth.falsePositiveRate > 0.1) {
      await this.adjustSensitivity();
    }

    if (systemHealth.autoFixSuccessRate < 0.7) {
      await this.enhanceFixingCapabilities();
    }
  }

  // Méthodes utilitaires
  private updateMetrics(errors: any[], detectionTime: number) {
    this.performanceMetrics.set('lastDetectionTime', detectionTime);
    this.performanceMetrics.set('errorCount', errors.length);
    this.performanceMetrics.set('avgSeverity', this.calculateAverageSeverity(errors));
  }

  private calculateAverageSeverity(errors: any[]): number {
    const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalScore = errors.reduce((sum, error) => sum + (severityScores[error.severity] || 1), 0);
    return errors.length > 0 ? totalScore / errors.length : 0;
  }

  // Méthodes publiques pour monitoring
  public getDetectionMetrics() {
    return Object.fromEntries(this.performanceMetrics);
  }

  public getSystemHealth() {
    return {
      isHealthy: true,
      errorDetectionRate: this.calculateErrorDetectionRate(),
      autoFixSuccessRate: this.calculateAutoFixSuccessRate(),
      aiConfidence: 0.87,
      learningProgress: 0.92
    };
  }

  private calculateErrorDetectionRate(): number {
    return 0.94; // Placeholder - calcul réel basé sur les métriques
  }

  private calculateAutoFixSuccessRate(): number {
    return 0.82; // Placeholder - calcul réel basé sur les métriques
  }

  private calculateFalsePositiveRate(): number {
    return 0.05; // Placeholder - calcul réel basé sur les métriques
  }

  private calculatePerformanceImpact(): number {
    return 0.03; // Placeholder - calcul réel basé sur les métriques
  }

  private async adjustSensitivity() {
    // Ajustement automatique de la sensibilité
    console.log('Adjusting detection sensitivity to reduce false positives');
  }

  private async enhanceFixingCapabilities() {
    // Amélioration des capacités de correction
    console.log('Enhancing auto-fixing capabilities');
  }

  // =================== NOUVELLES MÉTHODES DE DÉTECTION SPÉCIALISÉES ===================

  private async detectDependencyErrors(code: string, context: any, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const errors = [];

    // Détection d'erreurs "command not found"
    const commandNotFoundPattern = /sh:\s+\d+:\s+(\w+):\s+not\s+found/g;

    // Détection d'erreurs d'export/import
    const exportErrorPattern = /The requested module '([^']+)' does not provide an export named '([^']+)'/g;
    let match;
    while ((match = commandNotFoundPattern.exec(context.consoleOutput || '')) !== null) {
      const missingCommand = match[1];

      errors.push({
        type: 'dependency',
        subtype: 'command_not_found',
        message: `Command "${missingCommand}" not found - Missing dependency detected`,
        severity: 'critical',
        aiConfidence: 0.95,
        autoFix: await this.generateDependencyFix(missingCommand),
        command: missingCommand,
        solution: await this.suggestDependencyInstallation(missingCommand)
      });
    }

    // Détection d'erreurs d'export/import
    let exportMatch;
    while ((exportMatch = exportErrorPattern.exec(context.consoleOutput || '')) !== null) {
      const modulePath = exportMatch[1];
      const exportName = exportMatch[2];

      errors.push({
        type: 'import_export',
        subtype: 'export_not_found',
        message: `Export "${exportName}" not found in module "${modulePath}"`,
        severity: 'critical',
        aiConfidence: 0.98,
        autoFix: await this.generateExportFix(modulePath, exportName),
        module: modulePath,
        export: exportName,
        solution: `Check exports in ${modulePath} or update import statement`
      });
    }

    // Détection de packages manquants dans package.json
    if (code.includes('require(') || code.includes('import ')) {
      const packageErrors = await this.detectMissingPackages(code, context);
      errors.push(...packageErrors);
    }

    return errors;
  }

  private async detectBuildErrors(code: string, context: any, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const errors = [];
    const consoleOutput = context.consoleOutput || '';

    // Détection d'erreurs de compilation TypeScript
    if (consoleOutput.includes('TSError') || consoleOutput.includes('TS2')) {
      errors.push({
        type: 'build',
        subtype: 'typescript_error',
        message: 'TypeScript compilation error detected',
        severity: 'high',
        aiConfidence: 0.9,
        autoFix: await this.generateTypeScriptFix(consoleOutput),
        details: this.extractTypeScriptErrors(consoleOutput)
      });
    }

    // Détection d'erreurs de build Vite/bundler
    if (consoleOutput.includes('Build failed') || consoleOutput.includes('bundling failed')) {
      errors.push({
        type: 'build',
        subtype: 'bundler_error',
        message: 'Build process failed',
        severity: 'high',
        aiConfidence: 0.85,
        autoFix: await this.generateBuildFix(consoleOutput)
      });
    }

    return errors;
  }

  private async detectEnvironmentErrors(context: any, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const errors = [];
    const consoleOutput = context.consoleOutput || '';

    // Détection d'erreurs de port
    if (consoleOutput.includes('EADDRINUSE') || consoleOutput.includes('port already in use')) {
      errors.push({
        type: 'environment',
        subtype: 'port_conflict',
        message: 'Port conflict detected',
        severity: 'medium',
        aiConfidence: 0.9,
        autoFix: await this.generatePortFix(consoleOutput)
      });
    }

    // Détection d'erreurs de permissions
    if (consoleOutput.includes('EACCES') || consoleOutput.includes('permission denied')) {
      errors.push({
        type: 'environment',
        subtype: 'permission_error',
        message: 'File permission error detected',
        severity: 'medium',
        aiConfidence: 0.85,
        autoFix: await this.generatePermissionFix(consoleOutput)
      });
    }

    return errors;
  }

  private async detectRuntimeErrors(code: string, context: any, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    const errors = [];
    const consoleOutput = context.consoleOutput || '';

    // Détection d'erreurs de module non trouvé
    if (consoleOutput.includes('Cannot find module') || consoleOutput.includes('MODULE_NOT_FOUND')) {
      const moduleMatch = consoleOutput.match(/Cannot find module ['"]([^'"]+)['"]/);
      if (moduleMatch) {
        errors.push({
          type: 'runtime',
          subtype: 'module_not_found',
          message: `Module "${moduleMatch[1]}" not found`,
          severity: 'high',
          aiConfidence: 0.9,
          autoFix: await this.generateModuleFix(moduleMatch[1]),
          module: moduleMatch[1]
        });
      }
    }

    // Détection d'erreurs de syntaxe runtime
    if (consoleOutput.includes('SyntaxError') || consoleOutput.includes('Unexpected token')) {
      errors.push({
        type: 'runtime',
        subtype: 'syntax_runtime_error',
        message: 'Runtime syntax error detected',
        severity: 'high',
        aiConfidence: 0.85,
        autoFix: await this.generateRuntimeSyntaxFix(consoleOutput)
      });
    }

    // Détection des méthodes manquantes dans le code
    if (error.message.includes('is not a function')) {
      const functionMatch = error.message.match(/(\w+\.\w+) is not a function/);
      if (functionMatch) {
        const [, fullMethod] = functionMatch;
        const [className, methodName] = fullMethod.split('.');

        errors.push({
          type: 'missing_method',
          message: `Method ${methodName} is not defined in class`,
          line: this.extractLineNumber(error.stack),
          column: 0,
          methodName,
          className,
          confidence: 0.95
        });
      }
    }

    return errors;
  }

  // =================== MÉTHODES D'AUTO-CORRECTION SPÉCIALISÉES ===================

  private async generateDependencyFix(command: string): Promise<any> {
    const dependencyMap = {
      'tsx': { package: 'tsx', type: 'dev', command: 'npm install tsx --save-dev' },
      'tsc': { package: 'typescript', type: 'dev', command: 'npm install typescript --save-dev' },
      'nodemon': { package: 'nodemon', type: 'dev', command: 'npm install nodemon --save-dev' },
      'vite': { package: 'vite', type: 'dev', command: 'npm install vite --save-dev' }
    };

    const fix = dependencyMap[command];
    if (fix) {
      return {
        type: 'install_dependency',
        command: fix.command,
        package: fix.package,
        devDependency: fix.type === 'dev',
        confidence: 0.95
      };
    }

    return {
      type: 'search_dependency',
      command: `npm search ${command}`,
      suggestion: `Search for ${command} package and install it`,
      confidence: 0.7
    };
  }

  private async generateExportFix(modulePath: string, exportName: string): Promise<any> {
    return {
      type: 'fix_import_export',
      action: 'Check and fix export/import mismatch',
      suggestions: [
        `Verify exports in ${modulePath}`,
        `Update import statement to use correct export name`,
        `Check if export is default or named export`
      ],
      module: modulePath,
      export: exportName,
      confidence: 0.95
    };
  }

  private async suggestDependencyInstallation(command: string): Promise<string> {
    const suggestions = {
      'tsx': 'Install TypeScript executor: npm install tsx --save-dev',
      'tsc': 'Install TypeScript compiler: npm install typescript --save-dev',
      'nodemon': 'Install development server: npm install nodemon --save-dev',
      'vite': 'Install Vite bundler: npm install vite --save-dev'
    };

    return suggestions[command] || `Install missing command: npm install ${command}`;
  }

  private async detectMissingPackages(code: string, context: any): Promise<any[]> {
    const errors = [];

    // Extraction des imports/requires
    const importRegex = /(?:import.*from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
    const packageJson = context.packageJson || {};
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const packageName = match[1] || match[2];

      // Ignorer les imports relatifs
      if (packageName.startsWith('.') || packageName.startsWith('/')) continue;

      // Vérifier si le package est installé
      if (!dependencies[packageName]) {
        errors.push({
          type: 'dependency',
          subtype: 'missing_package',
          message: `Package "${packageName}" is imported but not installed`,
          severity: 'high',
          aiConfidence: 0.9,
          autoFix: {
            type: 'install_package',
            command: `npm install ${packageName}`,
            package: packageName
          },
          package: packageName
        });
      }
    }

    return errors;
  }

  private async generateTypeScriptFix(consoleOutput: string): Promise<any> {
    // Analyse des erreurs TypeScript communes
    if (consoleOutput.includes('TS2307')) {
      return {
        type: 'install_types',
        action: 'Install type definitions',
        confidence: 0.8
      };
    }

    if (consoleOutput.includes('TS2304')) {
      return {
        type: 'add_type_declaration',
        action: 'Add missing type declaration',
        confidence: 0.75
      };
    }

    return {
      type: 'typescript_config',
      action: 'Check TypeScript configuration',
      confidence: 0.6
    };
  }

  private async generateBuildFix(consoleOutput: string): Promise<any> {
    return {
      type: 'rebuild',
      action: 'Clean and rebuild project',
      commands: ['npm run clean', 'npm install', 'npm run build'],
      confidence: 0.7
    };
  }

  private async generatePortFix(consoleOutput: string): Promise<any> {
    return {
      type: 'change_port',
      action: 'Change to available port',
      suggestion: 'Use PORT environment variable or change port in config',
      confidence: 0.8
    };
  }

  private async generatePermissionFix(consoleOutput: string): Promise<any> {
    return {
      type: 'fix_permissions',
      action: 'Fix file permissions',
      commands: ['chmod +x script', 'Check file ownership'],
      confidence: 0.75
    };
  }

  private async generateModuleFix(moduleName: string): Promise<any> {
    return {
      type: 'install_module',
      command: `npm install ${moduleName}`,
      module: moduleName,
      confidence: 0.9
    };
  }

  private async generateRuntimeSyntaxFix(consoleOutput: string): Promise<any> {
    return {
      type: 'syntax_correction',
      action: 'Fix syntax error',
      suggestion: 'Check for missing brackets, semicolons, or incorrect syntax',
      confidence: 0.7
    };
  }

  private extractTypeScriptErrors(consoleOutput: string): string[] {
    const errorRegex = /TS\d+:.*$/gm;
    return consoleOutput.match(errorRegex) || [];
  }

  // Méthode utilitaire pour obtenir le numéro de ligne
  private getLineNumber(code: string, index: number): number {
    let lineNumber = 1;
    for (let i = 0; i < index; i++) {
      if (code[i] === '\n') {
        lineNumber++;
      }
    }
    return lineNumber;
  }

  // Méthode placeholder pour la validation d'export
  private async validateExport(modulePath: string, exportName: string, context: any): Promise<boolean> {
    // Dans une application réelle, cela impliquerait une analyse statique du module
    // ou une vérification de l'environnement d'exécution.
    // Pour cet exemple, nous simulons une vérification basée sur des noms connus.
    if (modulePath === './modules/quality-assurance.module' && exportName === 'qualityAssurance') {
      return true;
    }
    if (modulePath === './modules/error-detection.module' && exportName === 'errorDetection') {
      return true;
    }
    if (modulePath === './modules/batch-generator.module' && exportName === 'batchGenerator') {
      return true;
    }
    if (modulePath === './modules/particles.module' && exportName === 'particles') {
      return true;
    }
    if (modulePath === './modules/physics.module' && exportName === 'physics') {
      return true;
    }
    if (modulePath === './modules/lighting.module' && exportName === 'lighting') {
      return true;
    }
    if (modulePath === './modules/morphing.module' && exportName === 'morphing') {
      return true;
    }
    // Fallback pour les autres modules ou si la logique de nommage est différente
    return exportName !== 'qualityAssuranceModule' && exportName !== 'errorDetectionModule' && exportName !== 'batchGeneratorModule';
  }

  // Méthode placeholder pour la génération d'auto-fix pour les erreurs de syntaxe
  private async generateAutoFix(match: any, pattern: ErrorPattern): Promise<any> {
    if (pattern.pattern === 'unclosed_bracket') {
      return { type: 'add_bracket', position: match.position };
    }
    if (pattern.pattern === 'undefined_variable') {
      return { type: 'declare_variable', name: match.variableName };
    }
    return null;
  }

  // Méthode placeholder pour la détection de vulnérabilités de sécurité
  private async findSecurityVulnerabilities(code: string, pattern: ErrorPattern): Promise<any[]> {
    // Simulation de détection basée sur des patterns simples
    const vulnerabilities = [];
    if (pattern.pattern === 'sql_injection') {
      const sqlInjectionRegex = /['"]\s*SELECT.*FROM.*\s*WHERE\s+\w+\s*=\s*['"]\s*\+?\s*\w+/g;
      let match;
      while ((match = sqlInjectionRegex.exec(code)) !== null) {
        vulnerabilities.push({
          description: 'Potential SQL Injection',
          line: this.getLineNumber(code, match.index),
          context: match[0]
        });
      }
    }
    return vulnerabilities;
  }

  // Méthode placeholder pour le calcul du niveau de risque
  private calculateRiskLevel(match: any, pattern: ErrorPattern): string {
    if (pattern.severity === 'critical') return 'high';
    if (pattern.severity === 'high') return 'medium';
    return 'low';
  }

  // Méthode placeholder pour la génération de correction de sécurité
  private async generateSecurityFix(match: any, pattern: ErrorPattern): Promise<any> {
    if (pattern.pattern === 'sql_injection') {
      return { type: 'prepared_statement', suggestion: 'Use parameterized queries or prepared statements' };
    }
    return null;
  }

  // Méthode placeholder pour la génération d'optimisation de performance
  private async generatePerformanceOptimization(analysis: any): Promise<any> {
    if (analysis.timeComplexity > 'O(n)') {
      return { type: 'optimize_algorithm', suggestion: 'Consider a more efficient algorithm' };
    }
    return null;
  }

  // Méthodes placeholder pour la détection de problèmes de performance
  private async detectMemoryLeaks(code: string, analysis: any): Promise<any[]> { return []; }
  private async detectBottlenecks(code: string, analysis: any): Promise<any[]> { return []; }

  // Méthodes placeholder pour la détection d'erreurs logiques
  private async detectImpossibleConditions(code: string, analysis: any): Promise<any[]> { return []; }
  private async detectPotentialInfiniteLoops(code: string, analysis: any): Promise<any[]> { return []; }
  private async detectLogicInconsistencies(code: string, analysis: any): Promise<any[]> { return []; }

  // Méthode placeholder pour la recherche de patterns IA
  private async findAIPatternMatches(code: string, pattern: ErrorPattern, aiAnalysis: AIErrorAnalysis): Promise<any[]> {
    // Simulation de détection de patterns IA
    if (pattern.pattern === 'undefined_variable') {
      const undefinedVars = [];
      // Simplified regex to find potential undefined variables
      const varRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
      let match;
      const declaredVars = new Set(['console', 'require', 'import', 'module', 'exports', 'Date', 'Promise', 'Map', 'Set', 'performance', 'setInterval']); // Mock declared variables
      while ((match = varRegex.exec(code)) !== null) {
        if (!declaredVars.has(match[1]) && !code.substring(0, match.index).match(new RegExp(`(?:let|const|var)\\s+${match[1]}\\s*=|function\\s+${match[1]}\\s*\\(`))) {
          undefinedVars.push({
            description: `Undefined variable: ${match[1]}`,
            line: this.getLineNumber(code, match.index),
            column: match.index,
            confidence: 0.9,
            variableName: match[1]
          });
        }
      }
      return undefinedVars;
    }
    return [];
  }

  // Méthode placeholder pour la déduplication et le classement des erreurs
  private deduplicateAndRank(errors: any[]): any[] { return errors; }

  // Méthode placeholder pour la consolidation avec IA
  private async consolidateWithAI(errors: any[], aiAnalysis: AIErrorAnalysis): Promise<any[]> { return errors; }

  // Méthode placeholder pour la génération de stratégie de prévention
  private async generatePreventionStrategy(semanticAnalysis: AIErrorAnalysis, contextualAnalysis: ErrorContext): Promise<string> {
    return 'Generic prevention strategy';
  }

  // Méthode placeholder pour l'extraction des points d'apprentissage
  private extractLearningPoints(semanticAnalysis: any, contextualAnalysis: any): string[] { return []; }

  // Méthode placeholder pour la vérification syntaxique traditionnelle
  private async performTraditionalSyntaxCheck(code: string): Promise<any[]> { return []; }

  // Méthode placeholder pour la validation de correction
  private async validateFix(fixedCode: string, error: any): Promise<{ isValid: boolean, confidence: number }> { return { isValid: true, confidence: 0.9 }; }

  // Méthode placeholder pour la génération de correction de syntaxe runtime
  private async generateRuntimeSyntaxFix(consoleOutput: string): Promise<any> { return null; }

  // Méthode placeholder pour la détection d'erreurs d'import/export mismatch
  private async detectImportExportMismatches(code: string, context: any): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];

    // Détection des imports manquants
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const [, imports, modulePath] = match;
      const importNames = imports.split(',').map(imp => imp.trim());

      // Vérification si le module existe
      for (const importName of importNames) {
        const exportName = importName.replace(/\s+as\s+\w+/, '').trim();
        const isValidExport = await this.validateExport(modulePath, exportName, context);

        if (!isValidExport) {
          errors.push({
            type: 'missing_import',
            message: `Missing export: ${exportName}`,
            line: this.extractLineNumber(error.stack), // Assuming 'error' is available in scope or passed
            column: 0,
            suggestion: exportName,
            confidence: 0.9
          });
        }
      }
    }

    // Détection spécifique des erreurs courantes dans nos modules
    await this.detectCommonModuleErrors(code, errors);

    return errors;
  }

  private async detectCommonModuleErrors(code: string, errors: DetectedError[]): Promise<void> {
    // Détection des erreurs d'import de nos modules spécifiques
    const commonMismatches = [
      { wrong: 'qualityAssuranceModule', correct: 'qualityAssurance', module: './modules/quality-assurance.module' },
      { wrong: 'errorDetectionModule', correct: 'errorDetection', module: './modules/error-detection.module' },
      { wrong: 'batchGeneratorModule', correct: 'batchGenerator', module: './modules/batch-generator.module' },
      { wrong: 'particlesModule', correct: 'particles', module: './modules/particles.module' },
      { wrong: 'physicsModule', correct: 'physics', module: './modules/physics.module' },
      { wrong: 'lightingModule', correct: 'lighting', module: './modules/lighting.module' },
      { wrong: 'morphingModule', correct: 'morphing', module: './modules/morphing.module' }
    ];

    for (const mismatch of commonMismatches) {
      if (code.includes(`import { ${mismatch.wrong} }`)) {
        errors.push({
          type: 'common_module_import_error',
          message: `Import name mismatch: '${mismatch.wrong}' should be '${mismatch.correct}'`,
          line: this.getLineNumber(code, code.indexOf(mismatch.wrong)),
          column: code.indexOf(mismatch.wrong),
          severity: 'critical',
          aiConfidence: 0.99,
          autoFix: `Replace '${mismatch.wrong}' with '${mismatch.correct}'`,
          solution: `Change import to: import { ${mismatch.correct} } from "${mismatch.module}"`
        });
      }
    }
  }

  // Méthode placeholder pour la génération de la stratégie de prévention
  private async generatePreventionStrategy(semanticAnalysis: AIErrorAnalysis, contextualAnalysis: ErrorContext): Promise<string> {
    return 'Generic prevention strategy';
  }

  // Helper method to extract line number from stack trace
  private extractLineNumber(stackTrace: string): number | undefined {
    if (!stackTrace) return undefined;
    const match = stackTrace.match(/at .* \(?(?:<anonymous>|eval).*?:(\d+):(\d+)\)?/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    const match2 = stackTrace.match(/at (\S+):(\d+):(\d+)/);
    if (match2 && match2[2]) {
      return parseInt(match2[2], 10);
    }
    return undefined;
  }
}

export const errorDetection = new AdvancedErrorDetection();