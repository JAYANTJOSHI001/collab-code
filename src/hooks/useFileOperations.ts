
import { useState, useCallback } from 'react';
import { FileItem } from '@/components/FileExplorer';
import socketService from '@/services/socketService';
import { useToast } from '@/hooks/use-toast';

export const useFileOperations = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentDialogPath, setCurrentDialogPath] = useState('');
  const { toast } = useToast();

  const setInitialFiles = useCallback((initialFiles: FileItem[]) => {
    setFiles(initialFiles);
  }, []);

  const handleAddFile = useCallback((path: string) => {
    setCurrentDialogPath(path);
    return path;
  }, []);
  
  const createNewFile = useCallback((fileName: string) => {
    if (!fileName.trim()) return;
    
    const newFilePath = currentDialogPath === '/' 
      ? fileName 
      : `${currentDialogPath}/${fileName}`;
    
    socketService.emitAddFile(currentDialogPath, fileName);
    
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      
      const addFileToDirectory = (items: FileItem[], path: string): FileItem[] => {
        if (path === '/') {
          return [
            ...items,
            {
              name: fileName,
              path: newFilePath,
              type: 'file'
            }
          ];
        }
        
        return items.map(item => {
          if (item.type === 'directory' && item.path === path) {
            return {
              ...item,
              children: [
                ...(item.children || []),
                {
                  name: fileName,
                  path: newFilePath,
                  type: 'file'
                }
              ]
            };
          } else if (item.type === 'directory' && item.children) {
            return {
              ...item,
              children: addFileToDirectory(item.children, path)
            };
          }
          return item;
        });
      };
      
      return addFileToDirectory(updatedFiles, currentDialogPath);
    });
    
    toast({
      title: "File created",
      description: `Created ${fileName}`
    });
    
    return true;
  }, [currentDialogPath, toast]);
  
  const handleAddFolder = useCallback((path: string) => {
    setCurrentDialogPath(path);
    return path;
  }, []);
  
  const createNewFolder = useCallback((folderName: string) => {
    if (!folderName.trim()) return;
    
    const newFolderPath = currentDialogPath === '/' 
      ? folderName 
      : `${currentDialogPath}/${folderName}`;
    
    socketService.emitAddFolder(currentDialogPath, folderName);
    
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      
      const addFolderToDirectory = (items: FileItem[], path: string): FileItem[] => {
        if (path === '/') {
          return [
            ...items,
            {
              name: folderName,
              path: newFolderPath,
              type: 'directory',
              children: []
            }
          ];
        }
        
        return items.map(item => {
          if (item.type === 'directory' && item.path === path) {
            return {
              ...item,
              children: [
                ...(item.children || []),
                {
                  name: folderName,
                  path: newFolderPath,
                  type: 'directory',
                  children: []
                }
              ]
            };
          } else if (item.type === 'directory' && item.children) {
            return {
              ...item,
              children: addFolderToDirectory(item.children, path)
            };
          }
          return item;
        });
      };
      
      return addFolderToDirectory(updatedFiles, currentDialogPath);
    });
    
    toast({
      title: "Folder created",
      description: `Created folder ${folderName}`
    });
    
    return true;
  }, [currentDialogPath, toast]);

  return {
    files,
    currentDialogPath,
    handleAddFile,
    createNewFile,
    handleAddFolder,
    createNewFolder,
    setInitialFiles
  };
};
