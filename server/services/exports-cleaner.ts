import path from 'path';
import fs from 'fs/promises';
import { log } from '../vite';

const EXPORTS_DIR = path.join(process.cwd(), 'exports');

export interface CleanupResult {
  filesDeleted: number;
  bytesFreed: number;
  errors: number;
}

/**
 * Supprime tous les fichiers du dossier exports/ dont la date de
 * modification dépasse maxAgeDays jours.
 * Appelé au démarrage du serveur (> 7 jours) et en background après livraison.
 */
export async function cleanOldExports(maxAgeDays = 7): Promise<CleanupResult> {
  const result: CleanupResult = { filesDeleted: 0, bytesFreed: 0, errors: 0 };

  try {
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    const entries = await fs.readdir(EXPORTS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Traiter les sous-dossiers (ex: exports/preview/)
        const subDir = path.join(EXPORTS_DIR, entry.name);
        try {
          const subEntries = await fs.readdir(subDir, { withFileTypes: true });
          for (const sub of subEntries) {
            if (!sub.isFile()) continue;
            const subPath = path.join(subDir, sub.name);
            const sub$ = await cleanFile(subPath, cutoff);
            result.filesDeleted += sub$.deleted;
            result.bytesFreed   += sub$.bytes;
            result.errors       += sub$.error;
          }
        } catch {
          // sous-dossier inaccessible, on passe
        }
        continue;
      }

      if (!entry.isFile()) continue;
      const filePath = path.join(EXPORTS_DIR, entry.name);
      const r = await cleanFile(filePath, cutoff);
      result.filesDeleted += r.deleted;
      result.bytesFreed   += r.bytes;
      result.errors       += r.error;
    }
  } catch (err) {
    log(`cleanOldExports: impossible d'accéder à ${EXPORTS_DIR}: ${err}`, 'exports-cleaner');
    return result;
  }

  if (result.filesDeleted > 0) {
    const mb = (result.bytesFreed / (1024 * 1024)).toFixed(2);
    log(
      `Nettoyage exports: ${result.filesDeleted} fichier(s) supprimé(s), ${mb} Mo libérés (> ${maxAgeDays}j)`,
      'exports-cleaner'
    );
  } else {
    log(`Nettoyage exports: aucun fichier expiré trouvé (seuil: ${maxAgeDays}j)`, 'exports-cleaner');
  }

  return result;
}

async function cleanFile(
  filePath: string,
  cutoff: number
): Promise<{ deleted: number; bytes: number; error: number }> {
  try {
    const stat = await fs.stat(filePath);
    if (stat.mtimeMs < cutoff) {
      await fs.unlink(filePath);
      return { deleted: 1, bytes: stat.size, error: 0 };
    }
    return { deleted: 0, bytes: 0, error: 0 };
  } catch {
    return { deleted: 0, bytes: 0, error: 1 };
  }
}
