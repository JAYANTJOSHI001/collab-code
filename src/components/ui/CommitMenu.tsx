"use client";

import { useState } from "react";
import { FaCheck, FaTimes, FaFile, FaCodeBranch, FaGitAlt } from "react-icons/fa";
import { ScrollArea } from "./scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommitMenuProps {
  repoName: string | null;
  username: string;
  changes: string[];
  onCommit: (message: string, files: string[]) => void;
}

const CommitMenu = ({ repoName, username, changes, onCommit }: CommitMenuProps) => {
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>(changes);
  const [activeTab, setActiveTab] = useState("commit");
  const [branchName, setBranchName] = useState("");

  const handleToggleFile = (file: string) => {
    setSelectedFiles(prev => 
      prev.includes(file) 
        ? prev.filter(f => f !== file)
        : [...prev, file]
    );
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      alert("Please enter a commit message");
      return;
    }
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to commit");
      return;
    }
    onCommit(commitMessage, selectedFiles);
  };

  return (
    <div className="flex-1 h-auto bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-medium text-white mb-2">Commit Menu</h2>
        <p className="text-sm text-zinc-400">
          Repository: {repoName} • User: {username}
        </p>
      </div>

      <Tabs defaultValue="commit" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="w-full bg-zinc-900">
            <TabsTrigger value="commit" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-black">
              <FaGitAlt className="mr-2" />
              Commit
            </TabsTrigger>
            <TabsTrigger value="branch" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-black">
              <FaCodeBranch className="mr-2" />
              New Branch
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          <TabsContent value="commit" className="mt-0 space-y-6">
            {/* Commit message input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Commit Message
              </label>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Enter a descriptive commit message..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white rounded-lg p-3 h-20 resize-none"
              />
            </div>

            {/* File selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-4">
                Changed Files ({changes.length})
              </label>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {changes.map(file => (
                    <div
                      key={file}
                      className="group"
                    >
                      <button
                        onClick={() => handleToggleFile(file)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          selectedFiles.includes(file)
                            ? 'bg-white text-black'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FaFile size={14} />
                          <span className="text-sm font-medium overflow-hidden text-ellipsis">{file}</span>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          selectedFiles.includes(file)
                            ? 'bg-black text-white'
                            : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'
                        }`}>
                          {selectedFiles.includes(file) ? (
                            <FaCheck size={12} />
                          ) : (
                            <FaTimes size={12} />
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="branch" className="mt-0 space-y-6">
            <div className="mb-8">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                New Branch Name
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="feature/my-new-feature"
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white rounded-lg p-3 overflow-x-auto"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Branch will be created from current HEAD
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Commit Message
              </label>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Initial commit for new branch..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white rounded-lg p-3 h-20 resize-none"
              />
            </div>

            {/* File selection for branch */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-4">
                Files to Include ({changes.length})
              </label>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {changes.map(file => (
                    <div
                      key={file}
                      className="group"
                    >
                      <button
                        onClick={() => handleToggleFile(file)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          selectedFiles.includes(file)
                            ? 'bg-white text-black'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FaFile size={14} className="flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{file}</span>
                        </div>
                        <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          selectedFiles.includes(file)
                            ? 'bg-black text-white'
                            : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'
                        }`}>
                          {selectedFiles.includes(file) ? (
                            <FaCheck size={12} />
                          ) : (
                            <FaTimes size={12} />
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <div className="p-6 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </div>
          {activeTab === "commit" ? (
            <button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || selectedFiles.length === 0}
              className="px-6 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Commit Changes
            </button>
          ) : (
            <button
              onClick={handleCommit}
              disabled={!branchName.trim() || !commitMessage.trim() || selectedFiles.length === 0}
              className="px-6 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Branch & Commit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitMenu;