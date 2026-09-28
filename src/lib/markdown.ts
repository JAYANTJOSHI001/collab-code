import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocData {
  id: string;
  title: string;
  description?: string;
  date?: string;
  author?: string;
  lastUpdated?: string;
  readingTime?: string;
  content: string;
  relatedDocs?: Array<{ title: string; slug: string; description?: string }>;
  [key: string]: string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown>;
}

// Calculate reading time based on word count
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
}

export async function getDocBySlug(slug: string): Promise<DocData> {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(docsDirectory, `${realSlug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const processedContent = await remark()
      .use(gfm) // GitHub Flavored Markdown
      .use(html, { sanitize: false })
      .process(content);
      
    const contentHtml = processedContent.toString();
    const readingTime = calculateReadingTime(content);
    
    return {
      id: realSlug,
      content: contentHtml,
      title: data.title || realSlug,
      readingTime,
      ...data,
    };
  } catch (error) {
    console.error(`Error reading file ${fullPath}:`, error);
    return {
      id: realSlug,
      content: '<p>Document not found or error loading content.</p>',
      title: 'Document Not Found',
      readingTime: '1 min read',
    };
  }
}

export async function getAllDocs(): Promise<DocData[]> {
  try {
    const slugs = fs.readdirSync(docsDirectory)
      .filter(file => file.endsWith('.md'));
    
    const docs = await Promise.all(
      slugs.map(async (slug) => {
        const doc = await getDocBySlug(slug);
        return doc;
      })
    );
    
    // Sort docs by date if available
    return docs.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error('Error reading docs directory:', error);
    return [];
  }
}

export async function getDocSlugs(): Promise<string[]> {
  try {
    return fs.readdirSync(docsDirectory)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading docs directory:', error);
    return [];
  }
}