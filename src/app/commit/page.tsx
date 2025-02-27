"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";

const GITHUB_USERNAME = "JAYANTJOSHI001";
const GITHUB_TOKEN = "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"; // Store securely
const BRANCH = "main"; // Change if needed

export default function CommitPage() {
  const params = useParams();
  const [repoName, setRepoName] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [commitMessage, setCommitMessage] = useState<string>("");

  useEffect(() => {
    if (params.repo && params.file) {
      setRepoName(params.repo as string);
      setFilePath(params.file as string);
      fetchFileContent(params.repo as string, params.file as string);
    }
  }, [params.repo, params.file]);

  async function fetchFileContent(repo: string, file: string) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repo}/contents/${file}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        }
      );
      const fileContent = atob(response.data.content);
      setCode(fileContent);
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  }

  async function commitChanges() {
    if (!repoName || !filePath || !commitMessage) return;

    try {
      const getFileResponse = await axios.get(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        }
      );

      const sha = getFileResponse.data.sha; // Required for updating files

      const commitData = {
        message: commitMessage,
        content: btoa(code), // Convert to Base64
        sha,
        branch: BRANCH,
      };

      await axios.put(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${filePath}`,
        commitData,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      alert("Changes committed successfully!");
    } catch (error) {
      console.error("Error committing changes:", error);
      alert("Failed to commit changes.");
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <span className="font-semibold">{repoName ? `${repoName} - Commit Changes` : "Loading..."}</span>
      </header>

      <div className="flex flex-col p-4">
        <h2 className="text-lg font-semibold mb-2">Editing: {filePath}</h2>
        <Editor
          height="60vh"
          theme="vs-dark"
          language="plaintext"
          value={code}
          onChange={(value) => setCode(value || "")}
        />

        <div className="mt-4">
          <input
            type="text"
            placeholder="Commit message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <button
            onClick={commitChanges}
            className="w-full mt-2 bg-blue-600 p-2 rounded"
          >
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
}
