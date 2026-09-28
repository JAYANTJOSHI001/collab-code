"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

interface DocSearchProps {
  className?: string;
}

const DocSearch: React.FC<DocSearchProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/docs/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="flex items-center bg-white bg-opacity-10 rounded-full border border-blue-400 border-opacity-30 px-4 py-2">
        <FaSearch className="text-blue-300 mr-3" />
        <input
          type="text"
          placeholder="Search documentation..."
          className="bg-transparent w-full text-blue-600 border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </form>
  );
};

export default DocSearch;