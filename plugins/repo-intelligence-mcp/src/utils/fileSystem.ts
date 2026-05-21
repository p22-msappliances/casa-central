import { promises as fs } from 'fs';
import path from 'path';

export async function getAllIntelligenceFiles(rootDir: string): Promise<string[]> {
  const aiDir = path.join(rootDir, 'ai');
  try {
    const files = await fs.readdir(aiDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(aiDir, file));
  } catch (error) {
    console.error(`Error reading /ai directory: ${error}`);
    return [];
  }
}
