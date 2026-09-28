import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface DocPaginationProps {
  prevDoc?: {
    title: string;
    slug: string;
  };
  nextDoc?: {
    title: string;
    slug: string;
  };
}

const DocPagination: React.FC<DocPaginationProps> = ({ prevDoc, nextDoc }) => {
  if (!prevDoc && !nextDoc) {
    return null;
  }
  
  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {prevDoc ? (
          <Link 
            href={`/docs/${prevDoc.slug}`}
            className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <FaArrowLeft className="text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Previous</div>
              <div className="font-medium text-blue-600">{prevDoc.title}</div>
            </div>
          </Link>
        ) : (
          <div></div> // Empty div to maintain layout when no previous doc
        )}
        
        {nextDoc && (
          <Link 
            href={`/docs/${nextDoc.slug}`}
            className="flex items-center justify-end gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-right">
              <div className="text-sm text-gray-500">Next</div>
              <div className="font-medium text-blue-600">{nextDoc.title}</div>
            </div>
            <FaArrowRight className="text-blue-500" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default DocPagination;