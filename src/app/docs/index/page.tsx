import React from 'react';
import { getDocBySlug } from '@/lib/markdown';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import DocLayout from '@/components/docs/DocLayout';

export default async function DocsIndexPage() {
  const doc = await getDocBySlug('index');
  
  return (
    <DocLayout title={doc.title} description={doc.description}>
      <MarkdownRenderer content={doc.content} />
    </DocLayout>
  );
}