import { getAllIntelligenceFiles } from '../utils/fileSystem.js';
import { parseIntelligenceFile, IntelligenceDocument } from '../parsers/intelligenceParser.js';
import path from 'path';

export class RepositoryScanner {
  private cache: Map<string, IntelligenceDocument> = new Map();
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async scan(): Promise<void> {
    const files = await getAllIntelligenceFiles(this.rootDir);
    for (const file of files) {
      const doc = await parseIntelligenceFile(file);
      this.cache.set(doc.id, doc);
    }
  }

  getAllDocs(): IntelligenceDocument[] {
    return Array.from(this.cache.values());
  }

  getDoc(id: string): IntelligenceDocument | undefined {
    return this.cache.get(id);
  }
}
