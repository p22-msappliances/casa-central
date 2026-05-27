import matter from 'gray-matter';
import { promises as fs } from 'fs';
import path from 'path';
export async function parseIntelligenceFile(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const fileName = path.basename(filePath, '.md');
    return {
        id: fileName,
        title: data.title || fileName,
        content: content,
        metadata: data,
        tags: data.tags || []
    };
}
