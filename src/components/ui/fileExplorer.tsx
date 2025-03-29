import React, { useState, useEffect, useCallback, memo, useRef, KeyboardEvent, MouseEvent, DragEvent, ChangeEvent } from 'react';
import { Folder, File, ChevronDown, ChevronRight, Plus, FolderPlus, Search, X, Edit, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  FaJs, FaReact, FaPython, FaGem, FaPhp, FaJava, FaCuttlefish, FaCodeBranch, 
  FaHashtag, FaRust, FaTerminal, FaHtml5, FaCss3Alt, FaSass, 
  FaDatabase, FaFileCode, FaFileAlt, FaFilePdf, FaFileImage, FaFileAudio, 
  FaFileVideo, FaFileArchive, FaDocker
} from "react-icons/fa";


interface FileContent {
  path: string;
  content: string;
}

interface FileExplorerProps {
  files: FileContent[];
  repoName: string | null;
  handleFileSelect: (file: FileContent) => void;
  handleAddFile: (filePath: string) => void;
  handleAddFolder: (folderPath: string) => void;
  handleDeleteFile?: (filePath: string) => void;
  handleDeleteFolder?: (folderPath: string) => void;
  handleRenameFile?: (oldPath: string, newPath: string) => void;
  handleRenameFolder?: (oldPath: string, newPath: string) => void;
  handleMoveFile?: (oldPath: string, newPath: string) => void;
  handleMoveFolder?: (oldPath: string, newPath: string) => void;
}
const fileTypeIcons: Record<string, React.ReactNode> = {
  // 🟡 JavaScript & TypeScript  
  js: <FaJs className="text-yellow-400" />,  
  jsx: <FaReact className="text-blue-400" />,  
  ts: <FaJs className="text-blue-600" />,  
  tsx: <FaReact className="text-blue-500" />,  
  py: <FaPython className="text-green-500" />,  
  rb: <FaGem className="text-red-600" />,  
  php: <FaPhp className="text-indigo-500" />,  
  java: <FaJava className="text-orange-600" />,  
  c: <FaCuttlefish className="text-blue-700" />,  
  cpp: <FaCodeBranch className="text-blue-800" />,
  cs: <FaHashtag className="text-purple-700" />,
  rs: <FaRust className="text-orange-700" />,  
  sh: <FaTerminal className="text-green-600" />,  
  html: <FaHtml5 className="text-orange-500" />,  
  css: <FaCss3Alt className="text-blue-400" />,  
  scss: <FaSass className="text-pink-400" />,  
  sass: <FaSass className="text-pink-500" />,  
  less: <FaCss3Alt className="text-indigo-400" />,  
  json: <FaFileCode className="text-yellow-300" />,  
  yaml: <FaFileAlt className="text-yellow-600" />,  
  yml: <FaFileAlt className="text-yellow-600" />,  
  toml: <FaFileAlt className="text-yellow-700" />,  
  sql: <FaDatabase className="text-blue-500" />,  
  graphql: <FaFileCode className="text-pink-600" />,  
  env: <FaFileCode className="text-green-400" />,  
  gitignore: <FaFileCode className="text-gray-500" />,  
  md: <FaFileAlt className="text-gray-400" />,  
  txt: <FaFileAlt className="text-gray-300" />,  
  pdf: <FaFilePdf className="text-red-500" />,  
  svg: <FaFileImage className="text-green-400" />,  
  png: <FaFileImage className="text-purple-400" />,  
  jpg: <FaFileImage className="text-purple-500" />,  
  jpeg: <FaFileImage className="text-purple-500" />,  
  gif: <FaFileImage className="text-purple-600" />,  
  mp3: <FaFileAudio className="text-green-400" />,  
  wav: <FaFileAudio className="text-green-500" />,  
  mp4: <FaFileVideo className="text-blue-400" />,  
  avi: <FaFileVideo className="text-blue-500" />,  
  mov: <FaFileVideo className="text-blue-600" />,  
  zip: <FaFileArchive className="text-gray-500" />,  
  rar: <FaFileArchive className="text-gray-600" />,  
  tar: <FaFileArchive className="text-gray-700" />,  
  gz: <FaFileArchive className="text-gray-800" />,  
  dockerfile: <FaDocker className="text-blue-400" />,  
};
// Use memo to prevent unnecessary re-renders
const FileExplorer = memo(({ 
  files, 
  repoName, 
  handleFileSelect, 
  handleAddFile, 
  handleAddFolder,
  handleDeleteFile,
  handleDeleteFolder,
  handleRenameFile,
  handleRenameFolder,
  handleMoveFile,
  handleMoveFolder
}: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Create a stable file tree structure
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const createFileTree = useCallback(() => {
    const tree: { [key: string]: any } = {};
    
    // Sort files to ensure consistent ordering
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));
    
    for (const file of sortedFiles) {
      // Filter by search query if searching
      if (isSearching && searchQuery && !file.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        continue;
      }
      
      const parts = file.path.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i === parts.length - 1) {
          // This is a file
          if (!current[part]) {
            current[part] = { 
              type: 'file', 
              path: file.path, 
              content: file.content,
              extension: part.includes('.') ? part.split('.').pop()?.toLowerCase() : '' 
            };
          }
        } else {
          // This is a directory
          if (!current[part]) {
            current[part] = { type: 'directory', children: {} };
          }
          current = current[part].children;
        }
      }
    }
    
    return tree;
  }, [files, searchQuery, isSearching]);

  // Memoize the file tree to prevent unnecessary recalculations
  const [fileTree, setFileTree] = useState(() => createFileTree());
  
  // Only update the file tree when files change or search query changes
  useEffect(() => {
    setFileTree((prevTree) => {
      const newTree = createFileTree();
      return JSON.stringify(newTree) !== JSON.stringify(prevTree) ? newTree : prevTree;
    });
  }, [files, searchQuery, isSearching, createFileTree]);

  // Auto-focus rename input when renaming starts
  useEffect(() => {
    if (renamingItem && renameInputRef.current) {
      renameInputRef.current.focus();
      
      // Select filename without extension for easier renaming
      const filename = renameInputRef.current.value;
      const lastDotIndex = filename.lastIndexOf('.');
      
      if (lastDotIndex > 0) {
        renameInputRef.current.setSelectionRange(0, lastDotIndex);
      } else {
        renameInputRef.current.select();
      }
    }
  }, [renamingItem]);

  const toggleFolder = useCallback((path: string, e?: MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
    }
    
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const handleFileClick = useCallback((file: FileContent, e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    // Handle multi-select with Ctrl/Cmd key
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(file.path)) {
          newSet.delete(file.path);
        } else {
          newSet.add(file.path);
        }
        return newSet;
      });
    } 
    // Handle range select with Shift key
    else if (e.shiftKey && selectedFilePath) {
      // For simplicity, we'll just select the clicked file for now
      // A full implementation would select all files between the last selected and current
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(file.path);
        return newSet;
      });
    } 
    // Normal single select
    else {
      setSelectedFilePath(file.path);
      setSelectedItems(new Set([file.path]));
      handleFileSelect(file);
    }
  }, [handleFileSelect, selectedFilePath]);

  const handleAddFileSubmit = useCallback(() => {
    if (newFileName) {
      handleAddFile(newFileName);
      setNewFileName('');
      setFileDialogOpen(false);
    }
  }, [newFileName, handleAddFile]);

  const handleAddFolderSubmit = useCallback(() => {
    if (newFolderName) {
      handleAddFolder(newFolderName);
      setNewFolderName('');
      setFolderDialogOpen(false);
    }
  }, [newFolderName, handleAddFolder]);

  const handleRenameSubmit = useCallback(() => {
    if (renamingItem && newItemName && handleRenameFile && handleRenameFolder) {
      const isFile = files.some(file => file.path === renamingItem);
      
      // Get directory path
      const parts = renamingItem.split('/');
      parts.pop(); // Remove filename
      const dirPath = parts.join('/');
      
      // Create new path
      const newPath = dirPath ? `${dirPath}/${newItemName}` : newItemName;
      
      if (isFile) {
        handleRenameFile(renamingItem, newPath);
      } else {
        handleRenameFolder(renamingItem, newPath);
      }
      
      setRenamingItem(null);
      setNewItemName('');
    }
  }, [renamingItem, newItemName, handleRenameFile, handleRenameFolder, files]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>, item: any, itemPath: string) => {
    // Enter to open file or toggle folder
    if (e.key === 'Enter') {
      e.preventDefault();
      if (item.type === 'file') {
        handleFileSelect({ path: item.path, content: item.content });
      } else {
        toggleFolder(itemPath);
      }
    }
    
    // F2 to rename
    if (e.key === 'F2') {
      e.preventDefault();
      const itemName = itemPath.split('/').pop() || '';
      setRenamingItem(itemPath);
      setNewItemName(itemName);
    }
    
    // Delete to remove file/folder
    if (e.key === 'Delete' && (handleDeleteFile || handleDeleteFolder)) {
      e.preventDefault();
      const isFile = item.type === 'file';
      
      if (isFile && handleDeleteFile) {
        handleDeleteFile(itemPath);
      } else if (!isFile && handleDeleteFolder) {
        handleDeleteFolder(itemPath);
      }
    }
  }, [handleFileSelect, toggleFolder, handleDeleteFile, handleDeleteFolder]);

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, path: string) => {
    e.dataTransfer.setData('text/plain', path);
    setDraggedItem(path);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, path: string) => {
    e.preventDefault();
    setDropTarget(path);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, targetPath: string) => {
    e.preventDefault();
    const sourcePath = e.dataTransfer.getData('text/plain');
    
    if (sourcePath === targetPath) return;
    
    // Determine if source is a file or folder
    const isFile = files.some(file => file.path === sourcePath);
    
    // Get the filename/foldername
    const sourceItem = sourcePath.split('/').pop() || '';
    
    // Create new path
    const newPath = `${targetPath}/${sourceItem}`;
    
    if (isFile && handleMoveFile) {
      handleMoveFile(sourcePath, newPath);
    } else if (!isFile && handleMoveFolder) {
      handleMoveFolder(sourcePath, newPath);
    }
    
    setDraggedItem(null);
    setDropTarget(null);
  }, [files, handleMoveFile, handleMoveFolder]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropTarget(null);
  }, []);

  // Recursive component for rendering the file tree
  const renderTree = useCallback((tree: { [key: string]: any }, path: string = '') => {
    return Object.keys(tree).map(key => {
      const item = tree[key];
      const itemPath = path ? `${path}/${key}` : key;
      
      if (item.type === 'file') {
        // Skip .gitkeep files in the UI
        if (key === '.gitkeep') return null;
        
        // If we're renaming this item, show input instead
        if (renamingItem === itemPath) {
          return (
            <div key={itemPath} className="pl-6 py-1 flex items-center">
              <Input
                ref={renameInputRef}
                value={newItemName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') {
                    setRenamingItem(null);
                    setNewItemName('');
                  }
                }}
                className="h-6 text-sm"
              />
            </div>
          );
        }
        
        return (
          <motion.div 
            key={item.path}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "pl-6 py-1 cursor-pointer hover:bg-zinc-800 flex items-center",
              selectedItems.has(item.path) ? 'bg-zinc-800' : '',
              draggedItem === itemPath ? 'opacity-50' : ''
            )}
            onClick={(e) => handleFileClick(item, e)}
            onKeyDown={(e) => handleKeyDown(e, item, itemPath)}
            tabIndex={0}
            draggable
            onDragStart={(e: any) => handleDragStart(e as DragEvent<HTMLDivElement>, itemPath)}
            onDragOver={(e: any) => handleDragOver(e as DragEvent<HTMLDivElement>, itemPath)}
            onDrop={(e: any) => handleDrop(e as DragEvent<HTMLDivElement>, itemPath)}
            onDragEnd={handleDragEnd}
          >
            {item.extension && fileTypeIcons[item.extension] ? (
              <div className="w-4 h-4 mr-2">{fileTypeIcons[item.extension]}</div>
            ) : (
              <File className="w-4 h-4 mr-2 text-white" />
            )}
            <span className="text-sm truncate text-white">{key}</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Actions</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingItem(itemPath);
                    setNewItemName(key);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4 text-white" />
                  <span>Rename</span>
                </DropdownMenuItem>
                {handleDeleteFile && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(itemPath);
                    }}
                    className="text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-white" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        );
      } else if (item.type === 'directory') {
        const isExpanded = expandedFolders.has(itemPath);
        const isDropTarget = dropTarget === itemPath;
        
        // If we're renaming this folder, show input instead
        if (renamingItem === itemPath) {
          return (
            <div key={itemPath} className="pl-2 py-1 flex items-center">
              <Input
                ref={renameInputRef}
                value={newItemName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') {
                    setRenamingItem(null);
                    setNewItemName('');
                  }
                }}
                className="h-6 text-sm"
              />
            </div>
          );
        }
        
        return (
          <div 
            key={itemPath}
            className={cn(
              draggedItem === itemPath ? 'opacity-50' : '',
              isDropTarget ? 'bg-zinc-700' : ''
            )}
          >
            <div 
              className={cn(
                "pl-2 py-1 cursor-pointer hover:bg-zinc-800 flex items-center group",
                selectedItems.has(itemPath) ? 'bg-zinc-800' : ''
              )}
              onClick={(e) => toggleFolder(itemPath, e)}
              onKeyDown={(e) => handleKeyDown(e, item, itemPath)}
              tabIndex={0}
              draggable
              onDragStart={(e) => handleDragStart(e, itemPath)}
              onDragOver={(e) => handleDragOver(e, itemPath)}
              onDrop={(e) => handleDrop(e, itemPath)}
              onDragEnd={handleDragEnd}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1 text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1 text-white" />
              )}
              <Folder className="w-4 h-4 mr-2 text-white" />
              <span className="text-sm text-white">{key}</span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Actions</span>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                      <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFilePath = `${itemPath}/new-file.js`;
                      handleAddFile(newFilePath);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 text-white" />
                    <span>New File</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFolderPath = `${itemPath}/new-folder`;
                      handleAddFolder(newFolderPath);
                    }}
                  >
                    <FolderPlus className="mr-2 h-4 w-4 text-white" />
                    <span>New Folder</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingItem(itemPath);
                      setNewItemName(key);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4 text-white" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  {handleDeleteFolder && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(itemPath);
                      }}
                      className="text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-white" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  className="ml-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTree(item.children, itemPath)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }
      
      return null;
    });
  }, [
    expandedFolders, 
    selectedItems, 
    handleFileClick, 
    toggleFolder, 
    renamingItem, 
    newItemName, 
    handleRenameSubmit, 
    handleKeyDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggedItem,
    dropTarget,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder
  ]);

  return (
    <div className="bg-zinc-900 w-64 h-full overflow-y-auto border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-white">{repoName || 'Files'}</h2>
        <div className="flex gap-1">
          {isSearching ? (
            <div className="flex items-center text-black">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="h-6 text-xs w-32"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-white hover:text-black" 
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-white hover:text-black"
              onClick={() => setIsSearching(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-black">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New File</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-black">
                <Input
                  placeholder="Enter file path (e.g. src/app.js)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddFileSubmit();
                  }}
                />
                <div className="mt-4 flex justify-end text-white hover:text-black">
                  <Button onClick={handleAddFileSubmit}>Create File</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-black">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Folder</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Enter folder path (e.g. src/components)"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddFolderSubmit();
                  }}
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleAddFolderSubmit}>Create Folder</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div 
        className="py-2"
        onKeyDown={(e) => {
          // Global keyboard shortcuts
          if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
            // Select all files
            e.preventDefault();
            const allPaths = files.map(file => file.path);
            setSelectedItems(new Set(allPaths));
          }
        }}
        tabIndex={-1}
      >
        {renderTree(fileTree)}
      </div>
    </div>
  );
});

// Add display name for debugging
FileExplorer.displayName = 'FileExplorer';

export default FileExplorer;
