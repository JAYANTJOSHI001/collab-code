"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FaCheck, FaTimes, FaFile } from "react-icons/fa";

interface CommitMenuProps {
  repoName: string | null;
  username: string;
  changes: string[];
  onCommit: (message: string, files: string[]) => void;
}

export default function CommitMenu({ repoName, username, changes, onCommit }: CommitMenuProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>(changes);

  const handleToggleFile = (file: string) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      return;
    }
    if (selectedFiles.length === 0) {
      return;
    }
    onCommit(commitMessage, selectedFiles);
  };

  return (
    <Card className="w-96 bg-gray-800 border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Commit Changes</h2>
          <div className="text-sm text-gray-400">
            {repoName && <span>{username}/{repoName}</span>}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Commit Message
          </label>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Enter a descriptive commit message..."
            className="w-full bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 rounded-lg p-3 h-24 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-4">
            Changed Files ({changes.length})
          </label>
          <div className="space-y-2">
            {changes.map((file) => (
              <div key={file} className="group">
                <button
                  onClick={() => handleToggleFile(file)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedFiles.includes(file)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaFile size={14} />
                    <span className="text-sm font-medium">{file}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      selectedFiles.includes(file)
                        ? "bg-blue-600"
                        : "bg-gray-600 group-hover:bg-gray-500"
                    }`}
                  >
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
        </div>
      </div>

      <div className="p-6 border-t border-gray-700">
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || selectedFiles.length === 0}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Commit Changes
        </button>
      </div>
    </Card>
  );
} 