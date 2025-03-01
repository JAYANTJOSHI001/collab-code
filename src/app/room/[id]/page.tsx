"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { Side } from "@/components/ui/side";
import CommitMenu from "@/components/ui/CommitMenu";
import { GitOperations } from "@/components/ui/git-operations";
import FileExplorer from "@/components/ui/fileExplorer";
import { useToast } from "@/hooks/use-toast";
import * as monaco from 'monaco-editor';

interface User {
  id: string;
  name: string;
  color: string;
}

interface FileContent {
  path: string;
  content: string;
}

export default function Room({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileContent[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isCommitView, setIsCommitView] = useState(false);
  const [isGitView, setIsGitView] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);
  const [repoName, setRepoName] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      initializeSocket();
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [status, params.id]);

  const initializeSocket = () => {
    socketRef.current = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      query: {
        roomId: params.id,
        userId: session?.user?.email,
      },
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketRef.current.on("roomState", ({ users, files, repoName: repo }) => {
      setUsers(users);
      setFiles(files);
      setRepoName(repo);
      if (files.length > 0 && !selectedFile) {
        setSelectedFile(files[0].path);
      }
    });

    socketRef.current.on("userJoined", ({ users }) => {
      setUsers(users);
      toast({
        title: "User joined",
        description: "A new user has joined the room",
      });
    });

    socketRef.current.on("userLeft", ({ users }) => {
      setUsers(users);
      toast({
        title: "User left",
        description: "A user has left the room",
      });
    });

    socketRef.current.on("codeUpdate", ({ file, content }) => {
      setFiles((prev) =>
        prev.map((f) => (f.path === file ? { ...f, content } : f))
      );
    });

    socketRef.current.on("codeSaved", () => {
      toast({
        title: "Changes saved",
        description: "Your changes have been saved",
      });
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!selectedFile || !value) return;

    socketRef.current?.emit("codeChange", {
      file: selectedFile,
      content: value,
    });

    if (!changes.includes(selectedFile)) {
      setChanges((prev) => [...prev, selectedFile]);
    }
  };

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
  };

  const handleCommit = async (message: string, filesToCommit: string[]) => {
    try {
      const filesToSend = filesToCommit.map(path => {
        const fileContent = files.find(f => f.path === path);
        return {
          path,
          content: fileContent?.content || "",
        };
      });

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${params.id}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message,
          files: filesToSend,
        }),
      });

      setChanges([]);
      setIsCommitView(false);
      toast({
        title: "Changes committed",
        description: "Your changes have been committed to the repository",
      });
    } catch (error) {
      console.error("Failed to commit changes:", error);
      toast({
        title: "Error",
        description: "Failed to commit changes",
        variant: "destructive",
      });
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleAddFile = async (filePath: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${params.id}/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          path: filePath,
          content: "",
        }),
      });

      if (response.ok) {
        setFiles(prev => [...prev, { path: filePath, content: "" }]);
        toast({
          title: "File created",
          description: `Created ${filePath}`,
        });
      }
    } catch (error) {
      console.error("Failed to create file:", error);
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      });
    }
  };

  const handleAddFolder = async (folderPath: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${params.id}/folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          path: folderPath,
        }),
      });

      if (response.ok) {
        toast({
          title: "Folder created",
          description: `Created ${folderPath}`,
        });
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen">
      <Side
        onCommitClick={() => setIsCommitView(true)}
        isCommitView={isCommitView}
        onGitClick={() => setIsGitView(true)}
        isGitView={isGitView}
      />

      <div className="flex flex-1">
        <FileExplorer
          repoName={repoName}
          files={files.map((f) => f.path)}
          handleFileSelect={handleFileSelect}
          handleAddFile={handleAddFile}
          handleAddFolder={handleAddFolder}
        />

        <div className="flex-1 relative">
          {selectedFile ? (
            <Editor
              height="100vh"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={files.find((f) => f.path === selectedFile)?.content}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Select a file to start editing
            </div>
          )}
        </div>

        {isCommitView && (
          <CommitMenu
            repoName={repoName}
            username={session?.user?.name || ""}
            changes={changes}
            onCommit={handleCommit}
          />
        )}

        {isGitView && (
          <GitOperations
            roomId={params.id}
            onClose={() => setIsGitView(false)}
          />
        )}
      </div>
    </div>
  );
} 