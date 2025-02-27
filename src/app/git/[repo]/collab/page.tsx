"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import Editor, { useMonaco } from "@monaco-editor/react";
import FileExplorer from "@/components/ui/fileExplorer";
import Side from "@/components/ui/side";

const socket = io("http://localhost:4000");

interface Cursor {
  userId: string;
  position: { line: number; column: number };
  color: string;
}

export default function CollaborativeEditor() {
  const params = useParams();
  const [repoName, setRepoName] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const monaco = useMonaco();

  const userId = `user-${Math.random().toString(36).substring(2, 9)}`;
  const userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  const username = "JAYANTJOSHI001";

  useEffect(() => {
    if (params.repo) {
      setRepoName(params.repo as string);
      const roomId = `repo-${params.repo}`;

      socket.emit("join-room", roomId, userId, userColor);
      socket.on("load-code", (initialCode) => setCode(initialCode));
      socket.on("code-update", (newCode) => setCode(newCode));
      socket.on("cursor-update", (updatedCursors) => setCursors(updatedCursors));
      socket.on("file-change", (fileName) => setSelectedFile(fileName));

      fetchRepoFiles(params.repo as string);

      return () => {
        socket.off("code-update");
        socket.off("load-code");
        socket.off("cursor-update");
        socket.off("file-change");
      };
    }
  }, [params.repo]);

  async function fetchRepoFiles(repo: string) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${username}/${repo}/git/trees/main?recursive=1`
      );
      const fileList = response.data.tree
        .filter((item: any) => item.type === "blob")
        .map((item: any) => item.path);
      setFiles(fileList);
    } catch (error) {
      console.error("Error fetching repository files:", error);
    }
  }

  async function fetchFileContent(file: string) {
    try {
      const response = await axios.get(
        `https://raw.githubusercontent.com/${username}/${repoName}/main/${file}`
      );
      setCode(response.data);
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  }

  async function saveFileContent() {
    if (!selectedFile) return;
    try {
      await axios.post("http://localhost:4000/save", {
        repo: repoName,
        file: selectedFile,
        content: code,
      });
      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  async function addFile(fileName: string) {
    try {
      setFiles([...files, fileName]);
    } catch (error) {
      console.error("Error adding file:", error);
    }
  }

  async function addFolder(folderName: string) {
    try {
      setFiles([...files, folderName + "/"]);
    } catch (error) {
      console.error("Error adding folder:", error);
    }
  }

  function handleEditorChange(value?: string) {
    if (value !== undefined) {
      setCode(value);
      socket.emit("code-update", { room: `repo-${repoName}`, code: value });
    }
  }

  function handleCursorChange(position: { lineNumber: number; column: number }) {
    socket.emit("cursor-move", {
      room: `repo-${repoName}`,
      userId,
      position: { line: position.lineNumber, column: position.column },
      color: userColor,
    });
  }

  function handleFileSelection(file: string) {
    if (file !== selectedFile) {
      setSelectedFile(file);
      fetchFileContent(file);
      socket.emit("file-change", { room: `repo-${repoName}`, file });
    }
  }

  function getLanguage(file: string | null) {
    if (!file) return "plaintext";
    const ext = file.split(".").pop();
    const languages: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };
    return languages[ext || ""] || "plaintext";
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <span className="font-semibold">{repoName ? `${repoName} - Live Collaboration` : "Loading..."}</span>
        <button onClick={saveFileContent} className="bg-blue-500 px-4 py-2 rounded">Save</button>
      </header>
      <div className="flex gap-4 p-4">
        <Side />
        <FileExplorer 
          repoName={repoName} 
          files={files} 
          handleFileSelect={handleFileSelection} 
          handleAddFile={addFile}
          handleAddFolder={addFolder}
        />
        <div className="flex-1">
          <Editor
            height="90vh"
            theme="vs-dark"
            language={getLanguage(selectedFile)}
            value={code}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editor.onDidChangeCursorPosition((e) => {
                handleCursorChange({ lineNumber: e.position.lineNumber, column: e.position.column });
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}