"use client";

import { useState } from "react";
import { FaFile, FaFolder, FaFolderOpen, FaChevronRight, FaChevronDown, FaPlus, FaEllipsisH } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface FileExplorerProps {
  repoName: string | null;
  files: string[];
  handleFileSelect: (file: string) => void;
  handleAddFile: (filePath: string) => void;
  handleAddFolder: (folderPath: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeMap {
  [key: string]: FileNode;
}

const FileExplorer = ({ repoName, files, handleFileSelect, handleAddFile, handleAddFolder }: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemPath, setNewItemPath] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Build tree structure from flat file list
  const buildFileTree = (files: string[]): FileNode[] => {
    const root: FileTreeMap = {};

    files.forEach(filePath => {
      const parts = filePath.split('/');
      let currentLevel: FileTreeMap = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = index === parts.length - 1;

        if (!currentLevel[currentPath]) {
          currentLevel[currentPath] = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : []
          };
        }

        if (!isFile) {
          const folder = currentLevel[currentPath];
          if (folder.type === 'folder' && folder.children) {
            currentLevel = folder.children.reduce<FileTreeMap>((acc, node) => {
              acc[node.path] = node;
              return acc;
            }, {});
          }
        }
      });
    });

    return Object.values(root);
  };

  const fileTree = buildFileTree(files);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
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
        return '📘';
      case 'js':
      case 'jsx':
        return '📒';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.sort((a, b) => {
      // Folders before files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // Alphabetical within same type
      return a.name.localeCompare(b.name);
    }).map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedPath === node.path;
      const paddingLeft = level * 12 + 8;

      return (
        <div key={node.path}>
          <button
            onClick={() => {
              if (node.type === 'folder') {
                toggleFolder(node.path);
              } else {
                handleFileSelect(node.path);
                setSelectedPath(node.path);
              }
            }}
            className={`w-full flex items-center px-2 py-1 text-sm hover:bg-zinc-800 transition-colors ${
              isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
            style={{ paddingLeft }}
          >
            <div className="flex items-center gap-2 flex-1">
              {node.type === 'folder' && (
                <span className="w-4">
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
          </button>
          {node.type === 'folder' && isExpanded && node.children && (
            <div className="border-l border-zinc-800 ml-3">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
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
        )}

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
    </Card>
  );
};

export default FileExplorer;
