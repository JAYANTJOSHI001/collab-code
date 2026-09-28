import React from 'react';
import { notFound } from 'next/navigation';
import { getDocBySlug, getDocSlugs, getAllDocs } from '@/lib/markdown';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import DocLayout from '@/components/docs/DocLayout';
import DocFeedback from '@/components/docs/DocFeedback';
import DocMetadata from '@/components/docs/DocMetadata';
import RelatedDocs from '@/components/docs/RelatedDocs';
import DocPagination from '@/components/docs/DocPagination';

// This is needed for static generation
export async function generateStaticParams() {
  const slugs = await getDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params promise to get the actual slug
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  try {
    const doc = await getDocBySlug(slug);
    
    // Get all docs for pagination
    const allDocs = await getAllDocs();
    const currentIndex = allDocs.findIndex(d => d.id === slug);
    
    const prevDoc = currentIndex > 0 
      ? { title: allDocs[currentIndex - 1].title, slug: allDocs[currentIndex - 1].id }
      : undefined;
      
    const nextDoc = currentIndex < allDocs.length - 1
      ? { title: allDocs[currentIndex + 1].title, slug: allDocs[currentIndex + 1].id }
      : undefined;
    
    return (
      <DocLayout title={doc.title} description={doc.description}>
        <DocMetadata 
          lastUpdated={doc.lastUpdated} 
          author={doc.author} 
          readingTime={doc.readingTime} 
        />
        
        <MarkdownRenderer content={doc.content} />
        
        <DocPagination prevDoc={prevDoc} nextDoc={nextDoc} />
        
        {doc.relatedDocs && <RelatedDocs docs={doc.relatedDocs} />}
        
        <DocFeedback docId={slug} />
      </DocLayout>
    );
  } catch (error) {
    console.error(`Error rendering doc ${slug}:`, error);
    return notFound();
  }
}