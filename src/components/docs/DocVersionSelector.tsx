"use client"

import React, { useState } from 'react';
import { FaCodeBranch } from 'react-icons/fa';

interface Version {
  label: string;
  value: string;
}

const versions: Version[] = [
  { label: 'v0.8 (Alpha)', value: 'v0.8' },
];

const DocVersionSelector: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState('v1.0');
  
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVersion(e.target.value);
    // In a real implementation, you would redirect to the appropriate version
    // or update the content based on the selected version
  };
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <FaCodeBranch className="text-gray-400" />
      <select
        value={selectedVersion}
        onChange={handleVersionChange}
        className="bg-transparent border border-gray-400 border-opacity-30 rounded-md py-1 px-2 text-blur text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {versions.map((version) => (
          <option key={version.value} value={version.value}>
            {version.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DocVersionSelector;