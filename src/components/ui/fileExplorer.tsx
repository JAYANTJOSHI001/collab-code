"use client";

import { useState, useCallback } from "react";
import { FaPython, FaFolder, FaFolderOpen, FaChevronRight, FaChevronDown, FaPlus, FaSearch } from "react-icons/fa";
import { FaFileCode, FaFileAlt, FaCode, FaCss3Alt, FaHtml5, FaJs, FaMarkdown } from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface FileExplorerProps {
  repoName: string | null;
  files: { path: string; content: string }[];
  handleFileSelect: (file: { path: string; content: string }) => void;
  handleAddFile: (filePath: string) => void;
  handleAddFolder: (folderPath: string) => void;
  handleDeleteItem?: (path: string) => void;
  handleRenameItem?: (oldPath: string, newPath: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

interface FileTreeMap {
  [key: string]: FileNode;
}

// Add new interfaces for drag and drop
interface DragItem {
  type: string;
  path: string;
  nodeType: 'file' | 'folder';
}

const FileExplorer = ({ repoName, files, handleFileSelect, handleAddFile, handleAddFolder, handleDeleteItem, handleRenameItem }: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemPath, setNewItemPath] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  // Add search filter function
  const filterNodes = useCallback((nodes: FileNode[], query: string): FileNode[] => {
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(query.toLowerCase());
      if (node.type === 'folder' && node.children) {
        const filteredChildren = filterNodes(node.children, query);
        node.children = filteredChildren;
        return matchesSearch || filteredChildren.length > 0;
      }
      return matchesSearch;
    });
  }, []);

  // Build tree structure from flat file list
  const buildFileTree = (files: { path: string; content: string }[]): FileNode[] => {
    const root: FileTreeMap = {};

    // Filter out invalid files and log them
    const validFiles = files.filter(file => {
      if (!file || typeof file !== 'object') {
        console.warn('⚠️ [FileExplorer] Invalid file object:', file);
        return false;
      }
      if (typeof file.path !== 'string' || !file.path.trim()) {
        console.warn('⚠️ [FileExplorer] Invalid file path:', file);
        return false;
      }
      if (typeof file.content !== 'string') {
        console.warn('⚠️ [FileExplorer] Missing content for file:', file.path);
        return false;
      }
      return true;
    });

    console.log('📁 [FileExplorer] Building file tree:', {
      totalFiles: files.length,
      validFiles: validFiles.length,
      paths: validFiles.map(f => f.path)
    });

    validFiles.forEach(file => {
      const parts = file.path.split('/');
      let currentLevel: FileTreeMap = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        if (!part.trim()) {
          console.warn('⚠️ [FileExplorer] Empty path segment in:', file.path);
          return;
        }

        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = index === parts.length - 1;

        if (!currentLevel[currentPath]) {
          currentLevel[currentPath] = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            content: isFile ? file.content : undefined,
            children: isFile ? undefined : []
          };
        }
        if (!isFile && currentLevel[currentPath].type === 'folder') {
          const children = currentLevel[currentPath].children;
          if (children) {
            currentLevel = children.reduce<FileTreeMap>((acc, node) => {
              acc[node.path] = node;
              return acc;
            }, {});
          }
        }
      });
    });

    return Object.values(root);
  };

  // Add validation for files prop
  if (!Array.isArray(files)) {
    console.error('❌ [FileExplorer] Invalid files prop:', files);
    return (
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 text-sm text-red-400">
          Error: Invalid files data
        </div>
      </div>
    );
  }

  const fileTree = buildFileTree(files);

  // Update the toggleFolder function
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Also remove all subfolders when collapsing
        Array.from(next).forEach(p => {
          if (p.startsWith(path + '/')) {
            next.delete(p);
          }
        });
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleNewItem = (type: 'file' | 'folder') => {
    if (!newItemPath.trim()) return;

    if (type === 'file') {
      handleAddFile(newItemPath);
      setShowNewFileInput(false);
    } else {
      handleAddFolder(newItemPath);
      setShowNewFolderInput(false);
    }
    setNewItemPath("");
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FaFileCode className="text-blue-500" />;
      case 'js':
      case 'jsx':
        return <FaJs className="text-yellow-500" />;
      case 'json':
        return <FaCode className="text-green-500" />;
      case 'md':
        return <FaMarkdown className="text-gray-500" />;
      case 'css':
        return <FaCss3Alt className="text-blue-400" />;
      case 'html':
        return <FaHtml5 className="text-orange-500" />;
      case 'py':
        return <FaPython className="text-green-500" />;
      default:
        return <FaFileAlt className="text-gray-400" />;
    }
  };

  // Add drag and drop handlers
  // Add interface for FileTreeItem props
  interface FileTreeItemProps {
    node: FileNode;
    level: number;
    isExpanded: boolean;
    isSelected: boolean;
    onSelect: (node: FileNode) => void;
    onToggle: (path: string) => void;
  }
  
  // Fix the FileTreeItem component
  const FileTreeItem = ({ node, level, isExpanded, isSelected, onSelect, onToggle }: FileTreeItemProps) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'FILE_TREE_ITEM',
      item: { path: node.path, type: node.type, nodeType: node.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
  
    const [{ isOver }, drop] = useDrop({
      accept: 'FILE_TREE_ITEM',
      drop: (item: DragItem) => {
        if (item.path !== node.path) {
          moveItem(item.path, node.path, files, handleRenameItem);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });
  
    return (
      <div 
        ref={(element) => {
          drag(drop(element));
        }}
        className={`w-full flex items-center px-2 py-1 text-sm hover:bg-zinc-800 transition-colors
          ${isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-400'}
          ${isOver ? 'bg-zinc-700' : ''}`}
        style={{ paddingLeft: level * 12 + 8, opacity: isDragging ? 0.5 : 1 }}
        onClick={() => onSelect(node)}
      >
        <div className="flex items-center gap-2 flex-1">
          {node.type === 'folder' && (
            <span className="w-4" onClick={(e) => {
              e.stopPropagation();
              onToggle(node.path);
            }}>
              {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
            </span>
          )}
          {node.type === 'folder' ? (
            <span>{isExpanded ? <FaFolderOpen size={14} /> : <FaFolder size={14} />}</span>
          ) : (
            <span className="w-4">{getFileIcon(node.name)}</span>
          )}
          <span className="truncate">{node.name}</span>
        </div>
      </div>
    );
  };

  // Update renderTree to include context menu and drag-drop
  const renderTree = (nodes: FileNode[], level = 0) => {
    const filteredNodes = searchQuery ? filterNodes(nodes, searchQuery) : nodes;
    
    return filteredNodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedPath === node.path;
  
      return (
        <ContextMenu key={node.path}>
          <ContextMenuTrigger>
            <FileTreeItem
              node={node}
              level={level}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onSelect={(node) => {
                if (node.type === 'file') {
                  handleFileSelect({ path: node.path, content: node.content || '' });
                  setSelectedPath(node.path);
                }
              }}
              onToggle={toggleFolder}
            />
            {isExpanded && node.type === 'folder' && node.children && (
              <div>
                {renderTree(node.children, level + 1)}
              </div>
            )}
            {renamingPath === node.path && (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mx-2 my-1 bg-zinc-800 border-zinc-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameItem?.(node.path, `${node.path.split('/').slice(0, -1).join('/')}/${newName}`);
                    setRenamingPath(null);
                  }
                  if (e.key === 'Escape') {
                    setRenamingPath(null);
                  }
                }}
                onBlur={() => setRenamingPath(null)}
                autoFocus
              />
            )}
          </ContextMenuTrigger>
          <ContextMenuContent>
            {/* ... rest of context menu content ... */}
          </ContextMenuContent>
        </ContextMenu>
      );
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">Explorer</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewFileInput(true)}
                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="New File"
              >
                <FaPlus size={12} />
              </button>
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="New Folder"
              >
                <FaFolder size={12} />
              </button>
            </div>
          </div>

          {/* New File Input */}
          {showNewFileInput && (
            <div className="mb-4">
              <Input
                value={newItemPath}
                onChange={(e) => setNewItemPath(e.target.value)}
                placeholder="filename.ext"
                className="mb-2 bg-zinc-800 border-zinc-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewItem('file');
                  if (e.key === 'Escape') setShowNewFileInput(false);
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleNewItem('file')}
                  className="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewFileInput(false)}
                  className="flex-1 px-2 py-1 bg-zinc-700 text-white text-sm rounded hover:bg-zinc-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )
        }

          {/* New Folder Input */}
            {showNewFolderInput && (
              <div className="mb-4">
                <Input
                  value={newItemPath}
                  onChange={(e) => setNewItemPath(e.target.value)}
                  placeholder="folder/name"
                  className="mb-2 bg-zinc-800 border-zinc-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNewItem('folder');
                    if (e.key === 'Escape') setShowNewFolderInput(false);
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNewItem('folder')}
                    className="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewFolderInput(false)}
                    className="flex-1 px-2 py-1 bg-zinc-700 text-white text-sm rounded hover:bg-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          {/* File Tree */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {fileTree.length > 0 ? (
                renderTree(fileTree)
              ) : (
                <div className="p-4 text-sm text-zinc-500 text-center">
                  No files found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DndProvider>
    );
};

export default FileExplorer;

// Move moveItem function inside the component and fix its implementation
const moveItem = (dragPath: string, dropPath: string, files: FileExplorerProps['files'], handleRenameItem?: (oldPath: string, newPath: string) => void) => {
  const dragItem = files.find(f => f.path === dragPath);
  const dropItem = files.find(f => f.path === dropPath);
  
  if (!dragItem || !dropItem) return;
  
  const newPath = dropPath.includes('.')
    ? dropPath
    : dropPath + '/' + dragPath.split('/').pop();
    
  handleRenameItem?.(dragPath, newPath);
};
