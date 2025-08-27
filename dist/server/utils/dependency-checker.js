import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const execAsync = promisify(exec);
export class DependencyChecker {
    static requiredCommands = [
        'tsx',
        'tsc',
        'vite',
        'drizzle-kit'
    ];
    static async checkAllDependencies() {
        const issues = [];
        for (const command of this.requiredCommands) {
            try {
                await execAsync(`which ${command}`);
            }
            catch (error) {
                // Command not found, check if it's in node_modules
                try {
                    await execAsync(`npx ${command} --version`);
                }
                catch (npxError) {
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
    static async getSolution(command) {
        const solutions = {
            'tsx': 'npm install tsx --save-dev',
            'tsc': 'npm install typescript --save-dev',
            'vite': 'npm install vite --save-dev',
            'drizzle-kit': 'npm install drizzle-kit --save-dev'
        };
        return solutions[command] || `npm install ${command}`;
    }
    static async autoFixDependencies() {
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
                }
                catch (installError) {
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
        }
        catch (error) {
            console.error('❌ Erreur lors de la vérification des dépendances:', error);
            return false;
        }
    }
    if(issues, length) { }
}
 > 0;
{
    console.log('⚠️ Dépendances manquantes détectées:');
    issues.forEach(issue => {
        console.log(`  - ${issue.command}: ${issue.solution}`);
    });
    console.log('🛠️ Installation automatique des dépendances...');
    await execAsync('npm install');
    // Vérification post-installation
    console.log('🔄 Re-vérification des dépendances...');
    const remainingIssues = await this.checkAllDependencies();
    if (remainingIssues.length > 0) {
        console.log('⚠️ Certaines dépendances nécessitent une installation spécifique:');
        for (const issue of remainingIssues) {
            try {
                console.log(`🔧 Installation de ${issue.command}...`);
                await execAsync(issue.solution);
            }
            catch (installError) {
                console.error(`❌ Échec installation ${issue.command}:`, installError);
            }
        }
    }
    console.log('✅ Dépendances installées avec succès!');
    return true;
}
console.log('✅ Toutes les dépendances sont présentes');
return true;
try { }
catch (error) {
    console.error('❌ Erreur lors de la vérification des dépendances:', error);
    return false;
}
