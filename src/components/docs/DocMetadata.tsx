import React from 'react';
import { FaCalendarAlt, FaEdit } from 'react-icons/fa';

interface DocMetadataProps {
  lastUpdated?: string;
  author?: string;
  readingTime?: string;
}

const DocMetadata: React.FC<DocMetadataProps> = ({ 
  lastUpdated, 
  author, 
  readingTime 
}) => {
  if (!lastUpdated && !author && !readingTime) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-6">
      {lastUpdated && (
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="text-gray-400" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      )}
      
      {author && (
        <div className="flex items-center gap-1">
          <FaEdit className="text-gray-400" />
          <span>Author: {author}</span>
        </div>
      )}
      
      {readingTime && (
        <div>
          <span>Reading time: {readingTime}</span>
        </div>
      )}
    </div>
  );
};

export default DocMetadata;