
import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Plus, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileItem[];
}

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onAddFile: (path: string) => void;
  onAddFolder: (path: string) => void;
  currentFile?: FileItem;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  onFileSelect,
  onAddFile,
  onAddFolder,
  currentFile,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderFileTree = (items: FileItem[], currentPath: string = '') => {
    return items.map((item) => {
      const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      const isExpanded = expandedFolders[fullPath] || false;
      const isCurrentFile = currentFile?.path === item.path;

      if (item.type === 'directory') {
        return (
          <div key={item.path} className="select-none">
            <div 
              className="flex items-center py-1 px-2 hover:bg-gray-800 cursor-pointer rounded-md"
              onClick={() => toggleFolder(fullPath)}
            >
              <span className="mr-1 text-gray-500">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <Folder size={16} className="mr-2 text-blue-400" />
              <span>{item.name}</span>
              <div className="ml-auto flex space-x-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFile(item.path);
                  }}
                  className="p-1 hover:bg-gray-700 rounded-md"
                >
                  <Plus size={14} className="text-gray-400" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFolder(item.path);
                  }}
                  className="p-1 hover:bg-gray-700 rounded-md"
                >
                  <FolderPlus size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
            {isExpanded && item.children && (
              <div className="ml-4 pl-2 border-l border-gray-700">
                {renderFileTree(item.children, fullPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={item.path}
            className={cn(
              "flex items-center py-1 px-2 hover:bg-gray-800 cursor-pointer rounded-md pl-6",
              isCurrentFile && "bg-gray-800"
            )}
            onClick={() => onFileSelect(item)}
          >
            <File size={16} className="mr-2 text-gray-400" />
            <span>{item.name}</span>
          </div>
        );
      }
    });
  };

  return (
    <div className="h-full overflow-auto p-2 bg-gray-900 text-white text-sm">
      <div className="flex items-center justify-between py-2 mb-2">
        <h3 className="font-semibold">Files</h3>
        <div className="flex space-x-1">
          <button 
            onClick={() => onAddFile('/')}
            className="p-1 hover:bg-gray-700 rounded-md"
          >
            <Plus size={16} className="text-gray-400" />
          </button>
          <button 
            onClick={() => onAddFolder('/')}
            className="p-1 hover:bg-gray-700 rounded-md"
          >
            <FolderPlus size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div>{renderFileTree(files)}</div>
    </div>
  );
};

export default FileExplorer;
