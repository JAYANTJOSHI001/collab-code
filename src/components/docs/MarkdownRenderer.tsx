import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
  );
};

const styles = `
  .markdown-content {
    /* Typography */
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    
    /* Spacing */
    max-width: 100%;
    overflow-x: auto;
  }

  .markdown-content h1 {
    font-size: 2.25rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #111;
  }

  .markdown-content h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
    color: #222;
  }

  .markdown-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .markdown-content h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .markdown-content p {
    margin-bottom: 1rem;
  }

  .markdown-content a {
    color: #3182ce;
    text-decoration: none;
  }

  .markdown-content a:hover {
    text-decoration: underline;
  }

  .markdown-content ul, .markdown-content ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  .markdown-content li {
    margin-bottom: 0.25rem;
  }

  .markdown-content blockquote {
    border-left: 4px solid #e2e8f0;
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: #4a5568;
  }

  .markdown-content pre {
    background-color: #f7fafc;
    border-radius: 0.375rem;
    padding: 1rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  .markdown-content code {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    background-color: #f7fafc;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
  }

  .markdown-content pre code {
    padding: 0;
    background-color: transparent;
  }

  .markdown-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .markdown-content th, .markdown-content td {
    border: 1px solid #e2e8f0;
    padding: 0.5rem;
  }

  .markdown-content th {
    background-color: #f7fafc;
    font-weight: 600;
  }

  .markdown-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.375rem;
  }

  .markdown-content hr {
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 2rem 0;
  }

  /* Dark mode support */
  .dark .markdown-content {
    color: #e2e8f0;
  }

  .dark .markdown-content h1,
  .dark .markdown-content h2,
  .dark .markdown-content h3,
  .dark .markdown-content h4 {
    color: #f7fafc;
  }

  .dark .markdown-content a {
    color: #63b3ed;
  }

  .dark .markdown-content blockquote {
    border-left-color: #4a5568;
    color: #a0aec0;
  }

  .dark .markdown-content pre,
  .dark .markdown-content code {
    background-color: #2d3748;
  }

  .dark .markdown-content th,
  .dark .markdown-content td {
    border-color: #4a5568;
  }

  .dark .markdown-content th {
    background-color: #2d3748;
  }

  .dark .markdown-content hr {
    border-top-color: #4a5568;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default MarkdownRenderer;