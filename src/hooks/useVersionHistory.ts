
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import socketService from '@/services/socketService';

export interface Version {
  id: string;
  timestamp: Date;
  content: string;
}

export interface FileVersions {
  [fileId: string]: Version[];
}

export const useVersionHistory = () => {
  const [fileVersions, setFileVersions] = useState<FileVersions>({});
  const { toast } = useToast();

  const saveToHistory = useCallback((fileId: string, content: string) => {
    const newVersion: Version = {
      id: Date.now().toString(),
      timestamp: new Date(),
      content
    };
    
    setFileVersions(prev => {
      const fileHistory = prev[fileId] || [];
      
      const updatedHistory = [newVersion, ...fileHistory].slice(0, 10);
      
      return {
        ...prev,
        [fileId]: updatedHistory
      };
    });
  }, []);
  
  const handleRestoreVersion = useCallback((version: Version, filePath: string) => {
    setFileVersions(prev => {
      const fileHistory = prev[filePath] || [];
      
      // Add current version to history before restoring
      const newVersion: Version = {
        id: Date.now().toString(),
        timestamp: new Date(),
        content: version.content
      };
      
      const updatedHistory = [newVersion, ...fileHistory].slice(0, 10);
      
      return {
        ...prev,
        [filePath]: updatedHistory
      };
    });
    
    socketService.emitCodeUpdate(filePath, version.content);
    
    toast({
      title: "Version restored",
      description: "Previous version has been restored"
    });
    
    return version.content;
  }, [toast]);

  return {
    fileVersions,
    saveToHistory,
    handleRestoreVersion
  };
};
