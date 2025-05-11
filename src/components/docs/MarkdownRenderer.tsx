import React from 'react';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Add a fallback rendering if styles aren't loaded yet
  if (!styles || !styles.markdown) {
    console.warn('Markdown styles not loaded properly');
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
  
  return <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: content }} />;
};

export default MarkdownRenderer;