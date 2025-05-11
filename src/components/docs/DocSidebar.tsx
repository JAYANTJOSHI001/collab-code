"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaCode,
  FaGitAlt,
  FaUsers,
  FaChevronDown,
  FaChevronRight,
  FaHome,
  FaPlay,
  FaHistory,
  FaRobot
} from 'react-icons/fa';

interface DocItem {
  id: string;
  title: string;
  href: string;
}

interface DocCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: DocItem[];
}

const DocSidebar: React.FC = () => {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'getting-started': true,
    'workspace': false,
    'features': false,
    'github': false,
    'ai': false,
    'collaboration': false,
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const docCategories: DocCategory[] = [
    {
      id: "version-control",
      title: "Version Control",
      icon: <FaGitAlt className="text-red-500" />,
      items: [
        { id: "intro-to-vcs", title: "Introduction to Version Control", href: "/docs/intro-to-vcs" },
        { id: "make-pr", title: "Make your first PR", href: "/docs/make-pr" },
        { id: "make-branch", title: "Branch Management", href: "/docs/make-branch" },
      ]
    },
  ];

  return (
    <div className="text-white">
      <h3 className="text-xl font-semibold mb-4">Documentation</h3>
      
      <div className="space-y-2">
        <Link 
          href="/docs/index" 
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
            pathname === '/docs/index' ? 'bg-blue-900/30 text-blue-100' : 'hover:bg-gray-800/70'
          }`}
        >
          <FaHome className="text-yellow-500" />
          Home
        </Link>
        <Link 
          href="/docs/getting-started" 
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
            pathname === '/docs/getting-started' ? 'bg-blue-900/30 text-blue-100' : 'hover:bg-gray-800/70'
          }`}
        >
          <FaPlay className="text-green-500" />
          Getting Started
        </Link>

        <Link 
          href="/docs/terminal" 
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
            pathname === '/docs/terminal' ? 'bg-blue-900/30 text-blue-100' : 'hover:bg-gray-800/70'
          }`}
        >
          <FaCode className="text-purple-500" />
          Terminal
        </Link>

        <Link 
          href="/docs/text-voice-chat" 
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
            pathname === '/docs/text-voice-chat' ? 'bg-blue-900/30 text-blue-100' : 'hover:bg-gray-800/70'
          }`}
        >
          <FaUsers className="text-blue-500" />
          Connect with Collab
        </Link>

        <Link 
          href="/docs/code-history" 
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
            pathname === '/docs/code-history' ? 'bg-blue-900/30 text-blue-100' : 'hover:bg-gray-800/70'
          }`}
        >
          <FaHistory className="text-red-500" />
          History of Code
        </Link>

        <Link 
          href="/docs/ai-assistant" 
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
            pathname === '/docs/ai-assistant' ? 'bg-blue-900/30 text-blue-100' : 'hover:bg-gray-800/70'
          }`}
        >
          <FaRobot className="text-cyan-500" />
          Explore AI Assistant
        </Link>
        
        {docCategories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              className={`flex items-center justify-between w-full py-2 px-3 rounded-md cursor-pointer hover:bg-gray-800/70 transition-colors ${
                pathname?.includes(`/docs/${category.id}`) ? 'bg-blue-900/30 text-blue-100' : ''
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{category.icon}</span>
                <span>{category.title}</span>
              </div>
              <span>
                {expandedCategories[category.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </span>
            </button>
            
            {expandedCategories[category.id] && (
              <div className="ml-8 mt-1 space-y-1">
                {category.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block py-1.5 px-3 rounded-md text-sm transition-colors ${
                      pathname === item.href ? 'bg-blue-900/30 text-blue-100' : 'hover:bg-gray-800/70'
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocSidebar;