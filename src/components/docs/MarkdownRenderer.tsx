import React from 'react';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if(!styles || !styles.markdown){
    return null;
  }
  return (
    <div 
      className={styles.markdown}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
};

export default MarkdownRenderer;