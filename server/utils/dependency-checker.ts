
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

  private static async getSolution(command: string): Promise<string> {
    const solutions = {
      'tsx': 'npm install tsx --save-dev',
      'tsc': 'npm install typescript --save-dev',
      'vite': 'npm install vite --save-dev',
      'drizzle-kit': 'npm install drizzle-kit --save-dev'
    };

    return solutions[command] || `npm install ${command}`;
  }

  static async autoFixDependencies(): Promise<boolean> {
    try {
      console.log('🔍 Vérification des dépendances...');
      const issues = await this.checkAllDependencies();

      if (issues.length > 0) {
        console.log('⚠️ Dépendances manquantes détectées:');
        issues.forEach(issue => {
          console.log(`  - ${issue.command}: ${issue.solution}`);
        });

        console.log('🛠️ Installation automatique des dépendances...');
        await execAsync('npm install');
        
        console.log('✅ Dépendances installées avec succès!');
        return true;
      }

      console.log('✅ Toutes les dépendances sont présentes');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des dépendances:', error);
      return false;
    }
  }
}
