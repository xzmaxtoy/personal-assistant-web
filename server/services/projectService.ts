import fs from 'fs/promises';
import path from 'path';

export interface Project {
  id: string;
  name: string;
  path: string;
  hasClaudeConfig: boolean;
  lastModified?: Date;
}

/**
 * Discover Claude Code projects by scanning for .claude/ directories
 */
export async function discoverProjects(
  rootPath: string = process.env.PA_ROOT || process.env.HOME || ''
): Promise<Project[]> {
  const projects: Project[] = [];

  async function scanDirectory(dirPath: string, depth: number = 0) {
    // Limit recursion depth to avoid deep traversal
    if (depth > 3) return;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden directories, node_modules, etc.
        if (entry.name.startsWith('.') && entry.name !== '.claude') continue;
        if (entry.name === 'node_modules') continue;
        if (entry.name === 'dist') continue;

        if (!entry.isDirectory()) continue;

        const fullPath = path.join(dirPath, entry.name);
        const claudePath = path.join(fullPath, '.claude');

        // Check if directory has .claude/ folder
        try {
          const stats = await fs.stat(claudePath);
          if (stats.isDirectory()) {
            const projectStats = await fs.stat(fullPath);

            projects.push({
              id: entry.name.toLowerCase().replace(/\s+/g, '-'),
              name: entry.name,
              path: fullPath,
              hasClaudeConfig: true,
              lastModified: projectStats.mtime
            });
          }
        } catch {
          // No .claude directory, continue scanning subdirectories
          await scanDirectory(fullPath, depth + 1);
        }
      }
    } catch (error: any) {
      // Permission denied or other errors, skip directory
      console.warn(`Skipping ${dirPath}:`, error.message);
    }
  }

  await scanDirectory(rootPath);

  // Sort by last modified (most recent first)
  projects.sort((a, b) => {
    if (!a.lastModified || !b.lastModified) return 0;
    return b.lastModified.getTime() - a.lastModified.getTime();
  });

  return projects;
}

/**
 * Get project by path
 */
export async function getProject(projectPath: string): Promise<Project | null> {
  try {
    const claudePath = path.join(projectPath, '.claude');
    const stats = await fs.stat(claudePath);

    if (stats.isDirectory()) {
      const projectStats = await fs.stat(projectPath);
      const projectName = path.basename(projectPath);

      return {
        id: projectName.toLowerCase().replace(/\s+/g, '-'),
        name: projectName,
        path: projectPath,
        hasClaudeConfig: true,
        lastModified: projectStats.mtime
      };
    }
  } catch {
    return null;
  }

  return null;
}
