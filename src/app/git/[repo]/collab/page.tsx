"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Editor, { useMonaco } from "@monaco-editor/react";
import FileExplorer from "@/components/ui/fileExplorer";
import {Side} from "@/components/ui/side";
import { FaSave, FaGit, FaUsers, FaCode } from "react-icons/fa";
import CommitMenu from "@/components/ui/CommitMenu";
import {GitOperations} from "@/components/ui/git-operations";
import { useRouter } from "next/navigation";
import { APP_CONFIG } from "@/constants";

let socket: Socket;

interface Cursor {
  userId: string;
  position: { line: number; column: number };
  color: string;
}

interface FileContent {
  content: string;
  lastModified: number;
  changes?: {
    line: number;
    color: string;
    timestamp: number;
  }[];
}

interface FileContents {
  [key: string]: FileContent;
}

interface UserCursor {
  id: string;
  line: number;
  column: number;
  color: string;
}

interface StatusBarItem {
  text: string;
  icon?: React.ReactNode;
  position: 'left' | 'right';
  onClick?: () => void;
}

interface Selection {
  userId: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  color: string;
}

interface EditorState {
  version: number;
  content: string;
  selections: Selection[];
  cursors: Record<string, Cursor>;
  userLocations: Record<string, {
    file: string;
    lastActive: number;
  }>;
}

interface UserLocation {
  id: string;
  color: string;
  currentFile: string;
  lastActive: number;
}

interface TextRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  userId: string;
  color: string;
  timestamp: number;
}

interface LineChange {
  lineNumber: number;
  text: string;
}

interface Version {
  id: string;
  content: string;
  timestamp: number;
  userId: string;
  message?: string;
}

interface FileVersion {
  versions: Version[];
  currentVersion: string;
  lastModified: number;
}

interface GitOperationsProps {
  repoName: string | null;
  username: string;
  currentBranch: string;
  onBranchSwitch: (branch: string) => Promise<void>;
}

export default function CollaborativeEditor() {
  const params = useParams<{ repo: string }>();
  const [repoName, setRepoName] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const monaco = useMonaco();
  const [currentFile, setCurrentFile] = useState("Untitled");
  const [fileHistory, setFileHistory] = useState<string[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [localFiles, setLocalFiles] = useState<FileContents>({});
  const [changes, setChanges] = useState<string[]>([]);
  const [activeUsers, setActiveUsers] = useState<{id: string, color: string}[]>([]);
  const [gitBranch, setGitBranch] = useState("main");
  const editorRef = useRef<any>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    version: 0,
    content: "",
    selections: [],
    cursors: {},
    userLocations: {}
  });
  const lastVersion = useRef<number>(0);
  const operationQueue = useRef<any[]>([]);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const debounceTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [userLocations, setUserLocations] = useState<Record<string, UserLocation>>({});
  const autoSaveTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [fileVersions, setFileVersions] = useState<Record<string, FileVersion>>({});
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  const versionUpdateTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isCommitView, setIsCommitView] = useState(false);
  const [isGitView, setIsGitView] = useState(false);
  const router = useRouter();
  const [usersCursors, setUsersCursors] = useState<UserCursor[]>([
    { id: "user1", line: 2, column: 5, color: "red" },
    { id: "user2", line: 3, column: 10, color: "blue" },
  ]);
  useEffect(() => {
    try {
      socket = io("http://localhost:6000", {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
        query: { userId, userColor }
      });

      socket.on("connect", () => {
        setIsConnecting(false);
        setSocketError(null);
        console.log("Connected with ID:", socket.id);
        
        // Rejoin room and request latest state
        const repo = params?.repo;
        if (repo) {
          const roomId = `repo-${repo}`;
          socket.emit("join-room", roomId, userId, userColor);
          socket.emit("request-state", roomId);
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setSocketError("Failed to connect to collaboration server");
        setIsConnecting(false);
      });

      socket.on("disconnect", () => {
        setSocketError("Disconnected from collaboration server");
      });

      socket.on("user-typing", ({ userId, isTyping: typing }) => {
        setIsTyping(prev => ({ ...prev, [userId]: typing }));
      });

      socket.on("state-update", (newState: EditorState) => {
        if (newState.version > lastVersion.current) {
          setEditorState(newState);
          lastVersion.current = newState.version;
        }
      });

      socket.on("user-location-update", ({ userId, file, timestamp }) => {
        setEditorState(prev => ({
          ...prev,
          userLocations: {
            ...prev.userLocations,
            [userId]: {
              file,
              lastActive: timestamp
            }
          }
        }));
      });

      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
      setSocketError("Failed to initialize collaboration");
      setIsConnecting(false);
    }
  }, [params?.repo]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("fileHistory") || "[]") || [];
    setFileHistory(storedHistory);
  }, []);

  interface FileHistory {
    (fileName: string): void;
  }

  const openFile: FileHistory = (fileName) => {
    setCurrentFile(fileName);
    setSelectedFile(fileName);
    
    // Check local storage first
    const localFile = localFiles[fileName];
    if (localFile) {
      setCode(localFile.content);
    } else {
      fetchFileContent(fileName);
    }

    setFileHistory((prevHistory) => {
      const filteredHistory = prevHistory.filter((file) => file !== fileName);
      const newHistory = [fileName, ...filteredHistory].slice(0, 5);
      localStorage.setItem("fileHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const userId = `user-${Math.random().toString(36).substring(2, 9)}`;
  const userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();
      setUsername(sessionData?.user?.name || "");
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const repo = params?.repo;
    if (repo && socket?.connected) {
      setRepoName(repo);
      const roomId = `repo-${repo}`;

      socket.emit("join-room", roomId, userId, userColor);
      socket.on("load-code", (initialCode) => setCode(initialCode));
      socket.on("code-update", (data) => {
        if (data?.code) {
          setCode(data.code);
          
          // Update editorState with received changes
          if (data.operation?.version) {
            setEditorState(prev => ({
              ...prev,
              version: data.operation.version,
              content: data.code
            }));
          }
        }

        // Update local files if changedFile exists
        if (data?.changedFile) {
          setLocalFiles(prev => ({
            ...prev,
            [data.changedFile]: {
              content: data.code || '',
              lastModified: Date.now(),
              changes: []
            }
          }));
        }
      });
      socket.on("cursor-update", (updatedCursors) => setCursors(updatedCursors));
      socket.on("file-change", (fileName) => setSelectedFile(fileName));

      fetchRepoFiles(repo);

      return () => {
        socket.off("code-update");
        socket.off("load-code");
        socket.off("cursor-update");
        socket.off("file-change");
      };
    }
  }, [params?.repo, socket?.connected]);

  async function fetchRepoFiles(repo: string) {
    try {
      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();
      const username = sessionData?.user?.name;
      const accessToken = sessionData?.accessToken;
      
      if (!username || !accessToken) {
        console.error("No authenticated user or access token found");
        return;
      }

      const response = await axios.get(
        `${APP_CONFIG.GITHUB.API_URL}/repos/${username}/${repo}/contents`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      const fileList = response.data
        .filter((item: any) => item.type === "file")
        .map((item: any) => item.path);
      setFiles(fileList);
    } catch (error) {
      console.error("Error fetching repository files:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.error("Repository not found. Please check if it exists and you have access to it.");
        } else if (error.response?.status === 401) {
          console.error("Authentication failed. Please try logging in again.");
          router.push("/login");
        }
      }
    }
  }

  async function fetchFileContent(file: string) {
    try {
      if (!files.includes(file)) {
        setCode('');
        return;
      }

      // Check for auto-saved content first
      const localKey = `${repoName}-${file}-autosave`;
      const localContent = localStorage.getItem(localKey);
      
      if (localContent) {
        const savedData = JSON.parse(localContent);
        const timeDiff = Date.now() - savedData.timestamp;
        const isRecent = timeDiff < 24 * 60 * 60 * 1000; // 24 hours

        if (isRecent) {
          setCode(savedData.content);
          // Show indicator that we're using local version
          console.log('Using locally saved version from:', new Date(savedData.timestamp));
          return;
        } else {
          // Clear old auto-saved content
          localStorage.removeItem(localKey);
        }
      }

      // If no local content or it's too old, fetch from GitHub
      const response = await axios.get(
        `https://raw.githubusercontent.com/${username}/${repoName}/main/${file}`
      );
      setCode(response.data);
    } catch (error) {
      console.error("Error fetching file content:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setCode('');
      }
    }
  }

  async function saveFileContent() {
    if (!selectedFile) return;
    try {
      // Save to local storage first
      const newContent: FileContent = {
        content: code,
        lastModified: Date.now(),
        changes: []
      };
      
      setLocalFiles(prev => ({
        ...prev,
        [selectedFile]: newContent
      }));

      // Then try to save to server
      await axios.post("http://localhost:4000/save", {
        repo: repoName,
        file: selectedFile,
        content: code,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear file from changes after successful save
      setChanges(prev => prev.filter(f => f !== selectedFile));
      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Failed to save file. Please try again.");
    }
  }

  async function addFile(fileName: string) {
    try {
      const newFiles = [...files, fileName];
      setFiles(newFiles);
      setSelectedFile(fileName);
      
      // Initialize new file in local storage
      const newFileContent: FileContent = {
        content: '',
        lastModified: Date.now(),
        changes: []
      };
      
      setLocalFiles(prev => ({
        ...prev,
        [fileName]: newFileContent
      }));
      
      setCode('');
      openFile(fileName);
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
    if (value !== undefined && selectedFile) {
      // Clear previous auto-save timeout
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }

      // Set new auto-save timeout
      autoSaveTimeout.current = setTimeout(() => {
        autoSaveToLocal(value, selectedFile);
      }, 60000); // Auto-save after 1 minute of inactivity

      // Clear typing indicator after delay
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      debounceTimeout.current = setTimeout(() => {
        if (socket?.connected) {
          socket.emit("typing-status", { 
            room: `repo-${repoName}`,
            userId,
            isTyping: false
          });
        }
      }, 1000);

      // Emit typing status
      if (socket?.connected) {
        socket.emit("typing-status", { 
          room: `repo-${repoName}`,
          userId,
          isTyping: true
        });
      }

      setCode(value);
      
      // Track local changes with version control
      const newVersion = lastVersion.current + 1;
      const operation = {
        version: newVersion,
        content: value,
        userId,
        timestamp: Date.now()
      };

      operationQueue.current.push(operation);
      lastVersion.current = newVersion;

      // Update local state
      setEditorState(prev => ({
        ...prev,
        version: newVersion,
        content: value
      }));

      // Emit changes to collaborators with version control
      if (socket?.connected) {
        socket.emit("code-update", {
          room: `repo-${repoName}`,
          operation,
          changedFile: selectedFile
        });
      }

      // Track file changes
      if (!changes.includes(selectedFile)) {
        setChanges(prev => [...prev, selectedFile]);
      }

      // Version control with debounce
      if (versionUpdateTimeout.current) {
        clearTimeout(versionUpdateTimeout.current);
      }

      versionUpdateTimeout.current = setTimeout(() => {
        addVersion(selectedFile, value, userId);
      }, 5000); // Create new version every 5 seconds of inactivity
    }
  }

  function handleCursorChange(position: { lineNumber: number; column: number }) {
    if (socket?.connected) {
      const selection = editorRef.current?.getSelection();
      const cursorData = {
      room: `repo-${repoName}`,
      userId,
      position: { line: position.lineNumber, column: position.column },
      color: userColor,
        selection: selection ? {
          startLine: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLine: selection.endLineNumber,
          endColumn: selection.endColumn,
          color: userColor
        } : null
      };

      socket.emit("cursor-move", cursorData);
    }
  }
  
  console.log("fileHistory", fileHistory);
  function handleFileSelection(file: string) {
    if (file !== selectedFile) {
      setSelectedFile(file);
      setCurrentFile(file);
      fetchFileContent(file);
      
      if (socket?.connected) {
        // Update and broadcast user location
        const locationUpdate = {
          id: userId,
          color: userColor,
          currentFile: file,
          lastActive: Date.now()
        };
        
        setUserLocations(prev => ({
          ...prev,
          [userId]: locationUpdate
        }));

        socket.emit("user-location", {
          room: `repo-${repoName}`,
          location: locationUpdate
        });
      }
      openFile(file);
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

  // Load local files on mount
  useEffect(() => {
    const storedFiles = localStorage.getItem(`${repoName}-files`);
    if (storedFiles) {
      setLocalFiles(JSON.parse(storedFiles));
    }
  }, [repoName]);

  // Save local files when they change
  useEffect(() => {
    if (repoName && Object.keys(localFiles).length > 0) {
      localStorage.setItem(`${repoName}-files`, JSON.stringify(localFiles));
    }
  }, [localFiles, repoName]);

  // Track active users
  useEffect(() => {
    if (socket?.connected) {
      socket.on("user-joined", (users: {id: string, color: string}[]) => {
        setActiveUsers(users);
      });

      socket.on("user-left", (users: {id: string, color: string}[]) => {
        setActiveUsers(users);
      });
    }
  }, [socket?.connected]);

  // Handle cursor decorations
  useEffect(() => {
    if (editorRef.current && monaco) {
      const cursorDecorations = Object.values(cursors).map(cursor => ({
        range: new monaco.Range(
          cursor.position.line,
          cursor.position.column,
          cursor.position.line,
          cursor.position.column + 1
        ),
        options: {
          className: `cursor-${cursor.userId}`,
          isWholeLine: true,
          glyphMarginClassName: `cursor-margin-${cursor.userId}`,
          overviewRuler: {
            color: cursor.color,
            position: monaco.editor.OverviewRulerLane.Center
          },
          minimap: {
            color: cursor.color,
            position: monaco.editor.MinimapPosition.Inline
          },
          inlineClassName: `cursor-line-${cursor.userId}`,
          before: {
            content: '│',
            inlineClassName: `cursor-line-${cursor.userId}`,
            width: '2px'
          },
          after: {
            content: '',
            inlineClassName: `cursor-line-${cursor.userId}`,
            width: '0'
          },
          marginClassName: `cursor-margin-${cursor.userId}`,
          hoverMessage: { value: `Cursor: ${cursor.userId}` }
        }
      }));

      // Add dynamic styles for cursors
      const styleElement = document.createElement('style');
      const styles = Object.values(cursors).map(cursor => `
        .cursor-${cursor.userId} {
          background-color: ${cursor.color}20 !important;
        }
        .cursor-line-${cursor.userId} {
          color: ${cursor.color} !important;
          font-weight: bold !important;
          opacity: 1 !important;
        }
        .cursor-margin-${cursor.userId} {
          border-left: 2px solid ${cursor.color} !important;
        }
      `).join('\n');
      
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);

      const decorationIds = editorRef.current.deltaDecorations([], cursorDecorations);

      return () => {
        document.head.removeChild(styleElement);
        if (editorRef.current) {
          editorRef.current.deltaDecorations(decorationIds, []);
        }
      };
    }
  }, [cursors, monaco]);

  // Fetch git branch
  async function fetchGitBranch() {
    try {
      if (!repoName || !username) return;
      
      // Get GitHub token from environment
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      if (!token) {
        console.error("GitHub token not found");
        return;
      }

      const response = await axios.get(
        `https://api.github.com/repos/${username}/${repoName}/branches`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const defaultBranch = response.data.find((branch: any) => 
        branch.name === 'main' || branch.name === 'master'
      );
      
      if (defaultBranch) {
        setGitBranch(defaultBranch.name);
      } else {
        // If no main/master branch found, use the first branch
        if (response.data.length > 0) {
          setGitBranch(response.data[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching git branch:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.error("Repository not found or you don't have access to it");
        } else if (error.response?.status === 401) {
          console.error("GitHub authentication failed. Please check your token.");
        }
      }
      // Set a default branch name if we can't fetch it
      setGitBranch('main');
    }
  }

  // Call fetchGitBranch when repoName is set
  useEffect(() => {
    if (repoName) {
      fetchGitBranch();
    }
  }, [repoName]);

  // Update status bar items to show branch with loading state
  const statusBarItems: StatusBarItem[] = [
    {
      text: `${activeUsers.length} user${activeUsers.length !== 1 ? 's' : ''} connected`,
      icon: <FaUsers className="mr-1" />,
      position: 'left',
      onClick: () => {
        const userList = Object.values(userLocations)
          .map(user => `${user.id}: ${user.currentFile.split('/').pop()}`)
          .join('\n');
        alert(userList);
      }
    },
    {
      text: selectedFile ? getLanguage(selectedFile) : 'plaintext',
      icon: <FaCode className="mr-1" />,
      position: 'left'
    },
    {
      text: gitBranch || 'Loading branch...',
      icon: <FaGit className="mr-1" />,
      position: 'right',
      onClick: fetchGitBranch // Allow manual refresh
    }
  ];

  // Render user locations in file explorer
  const getUsersInFile = (file: string) => {
    return Object.values(userLocations)
      .filter(user => user.currentFile === file && user.id !== userId);
  };

  // Add socket listener for user locations
  useEffect(() => {
    if (socket?.connected) {
      socket.on("user-location", ({ id, location }) => {
        setUserLocations(prev => ({
          ...prev,
          [id]: location
        }));
      });

      socket.on("user-left", (leftUserId) => {
        setUserLocations(prev => {
          const newLocations = { ...prev };
          delete newLocations[leftUserId];
          return newLocations;
        });
      });

      return () => {
        socket.off("user-location");
        socket.off("user-left");
      };
    }
  }, [socket?.connected]);

  // Auto-save function
  const autoSaveToLocal = (content: string, file: string) => {
    const key = `${repoName}-${file}-autosave`;
    const saveData = {
      content,
      timestamp: Date.now(),
      file
    };
    localStorage.setItem(key, JSON.stringify(saveData));
  };

  // Clean up auto-save timeout on unmount or file change
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [selectedFile]);

  // Add version management functions
  const addVersion = (file: string, content: string, userId: string, message?: string) => {
    const versionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const version: Version = {
      id: versionId,
      content,
      timestamp: Date.now(),
      userId,
      message
    };

    setFileVersions(prev => {
      const fileVersion = prev[file] || { versions: [], currentVersion: versionId, lastModified: Date.now() };
      return {
        ...prev,
        [file]: {
          versions: [...fileVersion.versions, version],
          currentVersion: versionId,
          lastModified: Date.now()
        }
      };
    });

    // Save versions to localStorage
    const key = `${repoName}-${file}-versions`;
    localStorage.setItem(key, JSON.stringify({
      versions: [...(fileVersions[file]?.versions || []), version],
      currentVersion: versionId,
      lastModified: Date.now()
    }));
  };

  const revertToVersion = (file: string, versionId: string) => {
    const fileVersion = fileVersions[file];
    if (!fileVersion) return;

    const version = fileVersion.versions.find(v => v.id === versionId);
    if (!version) return;

    setCode(version.content);
    setFileVersions(prev => ({
      ...prev,
      [file]: {
        ...prev[file],
        currentVersion: versionId
      }
    }));
  };

  // Load versions from localStorage on file change
  useEffect(() => {
    if (selectedFile && repoName) {
      const key = `${repoName}-${selectedFile}-versions`;
      const savedVersions = localStorage.getItem(key);
      if (savedVersions) {
        const parsed = JSON.parse(savedVersions);
        setFileVersions(prev => ({
          ...prev,
          [selectedFile]: parsed
        }));
      }
    }
  }, [selectedFile, repoName]);

  // Add commit handler
  const handleCommit = async (message: string, files: string[]) => {
    try {
      // Save all selected files first
      await Promise.all(
        files.map(async (file) => {
          const content = localFiles[file]?.content;
          if (!content) return;

          await axios.post("http://localhost:4000/save", {
            repo: repoName,
            file,
            content,
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        })
      );

      // Get the current commit SHA to use as the parent
      const branchResponse = await axios.get(
        `https://api.github.com/repos/${username}/${repoName}/git/refs/heads/${gitBranch}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
          }
        }
      );
      const parentSha = branchResponse.data.object.sha;

      // Create a tree with all file changes
      const treeResponse = await axios.post(
        `https://api.github.com/repos/${username}/${repoName}/git/trees`,
        {
          base_tree: parentSha,
          tree: files.map(file => ({
            path: file,
            mode: '100644',
            type: 'blob',
            content: localFiles[file]?.content || ''
          }))
        },
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
          }
        }
      );

      // Create the commit
      const commitResponse = await axios.post(
        `https://api.github.com/repos/${username}/${repoName}/git/commits`,
        {
          message,
          tree: treeResponse.data.sha,
          parents: [parentSha]
        },
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
          }
        }
      );

      // Update the branch reference
      await axios.patch(
        `https://api.github.com/repos/${username}/${repoName}/git/refs/heads/${gitBranch}`,
        {
          sha: commitResponse.data.sha,
          force: true
        },
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
          }
        }
      );

      // Clear changes after successful commit
      setChanges(prev => prev.filter(f => !files.includes(f)));
      
      // Show success message
      alert('Changes committed successfully!');
    } catch (error: any) {
      console.error('Error committing changes:', error);
      let errorMessage = 'Failed to commit changes. ';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage += 'GitHub authentication failed. Please check your token.';
        } else if (error.response.data?.message) {
          errorMessage += error.response.data.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  // Add handler for branch switching
  const handleBranchSwitch = async (branch: string) => {
    try {
      setGitBranch(branch);
      // Fetch files for the new branch
      const response = await axios.get(
        `https://api.github.com/repos/${username}/${repoName}/git/trees/${branch}?recursive=1`
      );
      const fileList = response.data.tree
        .filter((item: any) => item.type === "blob")
        .map((item: any) => item.path);
      setFiles(fileList);
      
      // Clear current file and code
      setSelectedFile(null);
      setCode('');
      
      // Update socket room with new branch
      if (socket?.connected) {
        const roomId = `repo-${repoName}-${branch}`;
        socket.emit("join-room", roomId, userId, userColor);
      }
    } catch (error) {
      console.error("Error switching branch:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white">
      {/* Main layout */}
      <div className="flex-1 flex">
        {/* Activity bar - slim vertical bar with icons */}
        <Side 
          onCommitClick={() => setIsCommitView(!isCommitView)}
          isCommitView={isCommitView}
          onGitClick={() => setIsGitView(!isGitView)}
          isGitView={isGitView}
        />

        {/* Sidebar - file explorer or git operations */}
        {isGitView ? (
          <GitOperations
            roomId={params?.repo || ''}
            onClose={() => setIsGitView(false)}
          />
        ) : isCommitView ? (
          <CommitMenu
            repoName={repoName}
            username={username}
            changes={changes}
            onCommit={handleCommit}
          />
        ) : (
          <FileExplorer 
            repoName={repoName} 
            files={files} 
            handleFileSelect={(file: { path: string; content: string }) => handleFileSelection(file.path)}
            handleAddFile={addFile}
            handleAddFolder={addFolder}
          />
        )}

        {/* Main editor area */}
        <div className="flex-1 flex flex-col">
          {/* Editor header */}
          <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900">
            <div className="flex items-center gap-2">
              {selectedFile ? (
                <>
                  <span className="text-sm text-zinc-400">{repoName}/</span>
                  <span className="text-sm font-medium">{selectedFile}</span>
                </>
              ) : (
                <span className="text-sm text-zinc-400">Select a file to edit</span>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {selectedFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={getLanguage(selectedFile)}
                value={code}
                onChange={handleEditorChange}
                onMount={(editor: any) => {
                  editorRef.current = editor;
                }}
                options={{
                  fontSize: 14,
                  fontFamily: "'Fira Code', monospace",
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  renderWhitespace: "selection",
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  automaticLayout: true,
                  padding: { top: 10 },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                Select a file to start editing
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="h-6 border-t border-zinc-800 bg-zinc-900 flex items-center px-4 text-xs text-zinc-400">
            <div className="flex-1 flex items-center gap-4">
              {statusBarItems
                .filter(item => item.position === 'left')
                .map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {item.icon}
                    {item.text}
                  </button>
                ))}
            </div>
            <div className="flex items-center gap-4">
              {statusBarItems
                .filter(item => item.position === 'right')
                .map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {item.icon}
                    {item.text}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}