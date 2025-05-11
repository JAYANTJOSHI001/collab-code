"use client"

import React, { useEffect, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Find all headings in the document
    const articleHeadings = Array.from(document.querySelectorAll('h2, h3, h4'))
      .map((heading) => {
        const id = heading.id;
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.substring(1));
        
        return { id, text, level };
      });
    
    setHeadings(articleHeadings);

    // Set up intersection observer to highlight active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    // Observe all headings
    articleHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => {
      articleHeadings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 sticky top-24">
      <h3 className="text-lg font-semibold mb-3">On this page</h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            className={`${
              heading.level === 2 ? 'ml-0' : 
              heading.level === 3 ? 'ml-4' : 
              'ml-8'
            } transition-all duration-200`}
          >
            <ScrollLink
              to={heading.id}
              spy={true}
              smooth={true}
              offset={-100}
              duration={500}
              className={`text-sm hover:text-blue-800 cursor-pointer ${
                activeId === heading.id 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
              activeClass="text-blue-600 font-medium"
            >
              {heading.text}
            </ScrollLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;