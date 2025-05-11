"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronDown, FaChevronRight, FaBook, FaCode, FaGithub, FaRobot, FaUsers, FaLaptopCode,} from 'react-icons/fa';

interface DocCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items?: { id: string; title: string }[];
}

const docCategories: DocCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <FaBook className="text-blue-500" />,
    items: [
      { id: "account-setup", title: "Account Setup" },
      { id: "first-project", title: "Your First Project" },
      { id: "inviting-collaborators", title: "Inviting Collaborators" },
      { id: "start-coding", title: "Starting to Code" }
    ]
  },
  {
    id: "workspace",
    title: "Workspace Interface",
    icon: <FaLaptopCode className="text-green-500" />,
    items: [
      { id: "layout", title: "Layout and Navigation" },
      { id: "code-editor", title: "Code Editor" },
      { id: "communication", title: "Communication Tools" }
    ]
  },
  {
    id: "features",
    title: "Core Features",
    icon: <FaCode className="text-indigo-500" />,
    items: [
      { id: "realtime-editing", title: "Real-time Editing" },
      { id: "voice-chat", title: "Voice and Chat" },
      { id: "ai-assistance", title: "AI Code Assistance" }
    ]
  },
  {
    id: "github",
    title: "GitHub Integration",
    icon: <FaGithub className="text-gray-700" />,
    items: [
      { id: "connecting", title: "Connecting Your Account" },
      { id: "importing", title: "Importing Repositories" },
      { id: "committing", title: "Committing Changes" }
    ]
  },
  {
    id: "ai",
    title: "AI Assistance",
    icon: <FaRobot className="text-pink-500" />,
    items: [
      { id: "suggestions", title: "AI Suggestions" },
      { id: "explanations", title: "Code Explanations" },
      { id: "tiers", title: "Usage Tiers" }
    ]
  },
  {
    id: "collaboration",
    title: "Collaboration",
    icon: <FaUsers className="text-orange-500" />,
    items: [
      { id: "real-time", title: "Real-time Collaboration" },
      { id: "permissions", title: "Permission Levels" },
      { id: "sharing", title: "Sharing Projects" }
    ]
  },
];

export default function DocSide() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'getting-started': true // Default expanded category
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Extract the current doc category from the URL
  const currentCategory = pathname?.split('/')?.pop() || '';

  return (
    <div className="w-64 h-full bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-y-auto border-r border-gray-800">
      <div className="p-4">
        <nav className="space-y-1 mt-16">
          {docCategories.map((category) => (
            <div key={category.id} className="mb-2">
              <div 
                className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-800/70 transition-colors duration-200 ${
                  currentCategory === category.id ? 'bg-blue-900/30 text-blue-100' : ''
                }`}
                onClick={() => category.items && toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{category.icon}</span>
                  <Link 
                    href={`/docs/${category.id}`}
                    className={`flex-1 ${currentCategory === category.id ? 'font-semibold' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category.title}
                  </Link>
                </div>
                {category.items && (
                  <span className="text-gray-400">
                    {expandedCategories[category.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                  </span>
                )}
              </div>
              
              {category.items && expandedCategories[category.id] && (
                <div className="ml-8 mt-1 space-y-1">
                  {category.items.map((item) => (
                    <Link 
                      key={item.id}
                      href={`/docs/${category.id}#${item.id}`}
                      className={`block py-1 px-3 rounded-md hover:bg-gray-800/50 transition-colors duration-200 ${
                        pathname?.includes(item.id) ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}