
import { useCallback } from 'react';
import { useFileOperations } from './useFileOperations';
import { useFileContent } from './useFileContent';
import { useVersionHistory, Version } from './useVersionHistory';

export interface FileVersions {
  [fileId: string]: Version[];
}

export const useFileManager = () => {
  const {
    files,
    currentDialogPath,
    handleAddFile,
    createNewFile,
    handleAddFolder,
    createNewFolder,
    setInitialFiles
  } = useFileOperations();

  const {
    currentFile,
    fileContent,
    handleFileSelect,
    handleCodeChange: onCodeChange,
    setFileContent
  } = useFileContent();

  const {
    fileVersions,
    saveToHistory,
    handleRestoreVersion: onRestoreVersion
  } = useVersionHistory();

  // Combine handleCodeChange and saveToHistory
  const handleCodeChange = useCallback((newValue: string | undefined) => {
    if (newValue !== undefined && currentFile) {
      onCodeChange(newValue);
      saveToHistory(currentFile.path, newValue);
    }
  }, [currentFile, onCodeChange, saveToHistory]);

  // Update handleRestoreVersion to update fileContent
  const handleRestoreVersion = useCallback((version: Version) => {
    if (currentFile) {
      const newContent = onRestoreVersion(version, currentFile.path);
      setFileContent(newContent);
    }
  }, [currentFile, onRestoreVersion, setFileContent]);

  return {
    files,
    currentFile,
    fileContent,
    fileVersions,
    currentDialogPath,
    handleFileSelect,
    handleAddFile,
    createNewFile,
    handleAddFolder,
    createNewFolder,
    handleCodeChange,
    saveToHistory,
    handleRestoreVersion,
    setInitialFiles,
    setFileContent
  };
};
