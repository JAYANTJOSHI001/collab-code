"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FaTimes, FaCodeBranch, FaGitAlt } from "react-icons/fa";
import axios from "axios";

interface GitOperationsProps {
  roomId: string;
  onClose: () => void;
}

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

interface PullRequest {
  title: string;
  body: string;
  branch: string;
}

export function GitOperations({ roomId, onClose }: GitOperationsProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("main");
  const [loading, setLoading] = useState(true);
  const [prTitle, setPrTitle] = useState("");
  const [prDescription, setPrDescription] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}/branches`,
        { withCredentials: true }
      );
      setBranches(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const createPullRequest = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}/pr`,
        {
          title: prTitle,
          body: prDescription,
          branch: selectedBranch,
        },
        { withCredentials: true }
      );
      onClose();
    } catch (error) {
      console.error("Failed to create pull request:", error);
    }
  };

  return (
    <Card className="w-96 bg-zinc-800 border-zinc-700">
      <div className="p-6 border-b border-zinc-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Git Operations</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Current Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-zinc-700 text-white border border-zinc-600 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {branches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Pull Request Title
          </label>
          <input
            type="text"
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            placeholder="Enter a title for your pull request"
            className="w-full bg-zinc-700 text-white placeholder:text-zinc-400 border border-zinc-600 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Pull Request Description
          </label>
          <textarea
            value={prDescription}
            onChange={(e) => setPrDescription(e.target.value)}
            placeholder="Describe your changes..."
            className="w-full bg-zinc-700 text-white placeholder:text-zinc-400 border border-zinc-600 rounded-lg p-3 h-24 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-6 border-t border-zinc-700">
        <button
          onClick={createPullRequest}
          disabled={!prTitle.trim() || !selectedBranch}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Pull Request
        </button>
      </div>
    </Card>
  );
} 