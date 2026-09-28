import React from 'react';
import Link from 'next/link';
import { FaFileAlt } from 'react-icons/fa';

interface RelatedDoc {
  title: string;
  slug: string;
  description?: string;
}

interface RelatedDocsProps {
  docs: RelatedDoc[];
}

const RelatedDocs: React.FC<RelatedDocsProps> = ({ docs }) => {
  if (!docs || docs.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-12 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium mb-4">Related Documentation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <Link 
            key={doc.slug} 
            href={`/docs/${doc.slug}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-blue-500">
                <FaFileAlt />
              </div>
              <div>
                <h4 className="font-medium text-blue-600">{doc.title}</h4>
                {doc.description && (
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedDocs;