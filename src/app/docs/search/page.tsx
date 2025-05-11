import React from 'react';
import { getAllDocs } from '@/lib/markdown';
import Link from 'next/link';
import DocLayout from '@/components/docs/DocLayout';
import { FaFileAlt } from 'react-icons/fa';

export default async function DocSearchPage({
  searchParams
}: {
  searchParams: Promise<{ q: string }>
}) {
  // Await the searchParams promise to get the actual query
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  
  const allDocs = await getAllDocs();
  
  // Simple search implementation
  const searchResults = query 
    ? allDocs.filter(doc => {
        const titleMatch = doc.title.toLowerCase().includes(query.toLowerCase());
        const contentMatch = doc.content.toLowerCase().includes(query.toLowerCase());
        return titleMatch || contentMatch;
      })
    : [];
  
  return (
    <DocLayout 
      title="Search Results" 
      description={`Found ${searchResults.length} results for "${query}"`}
    >
      <div className="space-y-6">
        {searchResults.length > 0 ? (
          searchResults.map(doc => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <Link href={`/docs/${doc.id}`} className="block">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FaFileAlt className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-blue-600">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-gray-600 mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No results found for &quot;{query}&quot;</p>
            <p className="text-gray-600">
              Try using different keywords or check out our{' '}
              <Link href="/docs/index" className="text-blue-600 hover:underline">
                documentation index
              </Link>
            </p>
          </div>
        )}
      </div>
    </DocLayout>
  );
}