import { getAllIntelligenceFiles } from '../utils/fileSystem.js';
import { parseIntelligenceFile } from '../parsers/intelligenceParser.js';
export class RepositoryScanner {
    cache = new Map();
    rootDir;
    constructor(rootDir) {
        this.rootDir = rootDir;
    }
    async scan() {
        const files = await getAllIntelligenceFiles(this.rootDir);
        for (const file of files) {
            const doc = await parseIntelligenceFile(file);
            this.cache.set(doc.id, doc);
        }
    }
    getAllDocs() {
        return Array.from(this.cache.values());
    }
    getDoc(id) {
        return this.cache.get(id);
    }
}
