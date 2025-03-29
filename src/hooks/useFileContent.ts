
import { useState, useCallback } from 'react';
import { FileItem } from '@/components/FileExplorer';
import socketService from '@/services/socketService';

export const useFileContent = () => {
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const handleFileSelect = useCallback(async (file: FileItem) => {
    if (file.type === 'file') {
      setCurrentFile(file);
      
      const content = socketService.mockFileContent(file.path);
      setFileContent(content);
      
      socketService.emitSelectFile(file.path);
    }
  }, []);

  const handleCodeChange = useCallback((newValue: string | undefined) => {
    if (newValue !== undefined && currentFile) {
      setFileContent(newValue);
      
      socketService.emitCodeUpdate(currentFile.path, newValue);
    }
  }, [currentFile]);

  return {
    currentFile,
    fileContent,
    handleFileSelect,
    handleCodeChange,
    setFileContent
  };
};
