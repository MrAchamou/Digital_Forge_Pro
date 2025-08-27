import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DependencyIssue {
  command: string;
  missing: boolean;
  solution: string;
}

export class DependencyChecker {
  private static requiredCommands = [
    'tsx',
    'tsc',
    'vite',
    'drizzle-kit'
  ];

  static async checkAllDependencies(): Promise<DependencyIssue[]> {
    const issues: DependencyIssue[] = [];

    for (const command of this.requiredCommands) {
      try {
        await execAsync(`which ${command}`);
      } catch (error) {
        // Command not found, check if it's in node_modules
        try {
          await execAsync(`npx ${command} --version`);
        } catch (npxError) {
          issues.push({
            command,
            missing: true,
            solution: await this.getSolution(command)
          });
        }
      }
    }

    return issues;
  }

  private static getSolution(command: string): string {
    const solutions: Record<string, string> = {
      'tsx': 'npm install -g tsx',
      'tsc': 'npm install -g typescript',
      'vite': 'npm install vite',
      'drizzle-kit': 'npm install drizzle-kit'
    };

    return solutions[command] || `npm install ${command}`;
  }

  static async autoFixDependencies(): Promise<boolean> {
    try {
      console.log('🔍 Vérification des dépendances...');
      const issues = await this.checkAllDependencies();

      if (issues.length === 0) {
        console.log('✅ Toutes les dépendances sont présentes');
        return true;
      }

      console.log(`❌ ${issues.length} dépendances manquantes détectées`);

      // Auto-installation des dépendances manquantes
      for (const issue of issues) {
        console.log(`📦 Installation de ${issue.command}...`);
        try {
          await execAsync(issue.solution);
          console.log(`✅ ${issue.command} installé avec succès`);
        } catch (installError) {
          console.log(`❌ Échec installation ${issue.command}:`, installError.message);
          return false;
        }
      }

      // Vérification finale
      const finalCheck = await this.checkAllDependencies();
      if (finalCheck.length === 0) {
        console.log('🎉 Toutes les dépendances sont maintenant installées');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des dépendances:', error);
      return false;
    }
  }
}