import matter from 'gray-matter';
import { promises as fs } from 'fs';

export interface IntelligenceDocument {
  id: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  tags: string[];
}

export async function parseIntelligenceFile(filePath: string): Promise<IntelligenceDocument> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  const fileName = filePath.split('/').pop()?.replace('.md', '') || 'unknown';
  
  return {
    id: fileName,
    title: data.title || fileName,
    content: content,
    metadata: data,
    tags: data.tags || []
  };
}
