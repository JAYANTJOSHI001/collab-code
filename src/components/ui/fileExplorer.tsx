"use client";

import { useState } from "react";
import { FaFile, FaFolder, FaFolderOpen, FaPlus } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface FileExplorerProps {
  repoName: string | null;
  files: string[];
  handleFileSelect: (file: string) => void;
  handleAddFile: (filePath: string) => void;
  handleAddFolder: (folderPath: string) => void;
}

interface FileStructure {
  [key: string]: string[] | FileStructure;
}

// Helper function to create a nested file structure
const buildFileStructure = (files: string[]): FileStructure => {
  const structure: FileStructure = {};

  files.forEach((file) => {
    const parts = file.split("/");
    let current = structure;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        if (!Array.isArray(current)) {
          if (!current[part]) current[part] = [];
          (current[part] as string[]).push(file);
        }
      } else {
        if (!current[part]) current[part] = {};
        current = current[part] as FileStructure;
      }
    }
  });

  return structure;
};

const FileExplorer = ({ repoName, files, handleFileSelect, handleAddFile, handleAddFolder }: FileExplorerProps) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      handleAddFile(newFileName);
      setNewFileName("");
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      handleAddFolder(newFolderName);
      setNewFolderName("");
    }
  };

  const renderFileTree = (structure: FileStructure, path = "") => {
    return Object.entries(structure).map(([key, value]) => {
      const fullPath = path ? `${path}/${key}` : key;

      if (Array.isArray(value)) {
        return (
          <li
            key={fullPath}
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 rounded-md transition duration-200"
            onClick={() => handleFileSelect(value[0])}
          >
            <FaFile className="text-gray-400" />
            <span>{key}</span>
          </li>
        );
      } else {
        return (
          <li key={fullPath}>
            <div
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 rounded-md transition duration-200"
              onClick={() => toggleFolder(fullPath)}
            >
              {openFolders[fullPath] ? <FaFolderOpen className="text-yellow-500" /> : <FaFolder className="text-yellow-500" />}
              <span>{key}</span>
            </div>
            {openFolders[fullPath] && (
              <ul className="ml-6 border-l border-gray-600 pl-3">{renderFileTree(value, fullPath)}</ul>
            )}
          </li>
        );
      }
    });
  };

  const fileStructure = buildFileStructure(files);

  return (
    <Card className="w-1/6 bg-gray-900 p-2 rounded-xl shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-4">{repoName || "Repository"}</h3>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="New file name..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
          />
          <Button onClick={handleCreateFile} className="bg-blue-500 hover:bg-blue-600">
            <FaPlus />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="bg-gray-800 text-white focus:ring-green-500 focus:border-green-500"
          />
          <Button onClick={handleCreateFolder} className="bg-green-500 hover:bg-green-600">
            <FaPlus />
          </Button>
        </div>
      </div>
      <Separator className="border-gray-700" />
      <ScrollArea className="h-96 border border-gray-700 rounded-lg p-2 overflow-y-auto mt-4">
        <ul className="text-sm text-gray-300 space-y-1">{renderFileTree(fileStructure)}</ul>
      </ScrollArea>
    </Card>
  );
};

export default FileExplorer;
