"use client";

import { useEffect, useRef, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Editor, { OnMount} from "@monaco-editor/react";
import { Side } from "@/components/ui/side";
import * as monaco from 'monaco-editor';
import CommitMenu from "@/components/ui/CommitMenu";
import { GitOperations } from "@/components/ui/git-operations";
import FileExplorer from "@/components/ui/fileExplorer";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Share2, MessageSquare, History, TerminalIcon, Save} from "lucide-react";
import { CollaboratorsList } from "@/components/ui/CollaboratorsList";
import { User } from "@/types/room";
import { useSocket } from '@/hooks/useSocket';
import { CodeHistory } from "@/components/ui/CodeHistory";
import { formatDistanceToNow } from 'date-fns';
import { ChatPanel } from "@/components/ui/ChatPanel";
import AIAssistant from "@/components/editor/AIAssistant"; 
import { Terminal } from "@/components/ui/Terminal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// import { useCollaborativeCursors } from '@/hooks/useCollaborativeCursors';

// interface Decoration {
//   id: string;
//   options: {
//     className: string;
//   };
// }

interface FileContent {
  path: string;
  content: string;
}

// interface UserCursor {
//   id: string;
//   line: number;
//   column: number;
//   color: string;
// }

interface RoomParams {
  id: string;
}

interface CodeVersion {
  content: string;
  timestamp: Date;
  user?: string;
}

interface FileHistory {
  [path: string]: CodeVersion[];
}

export default function Room({ params }: { params: Promise<RoomParams> }) {
  const roomParams = use(params);
  const id = roomParams.id;
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [creator, setCreator] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileContent[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isCommitView, setIsCommitView] = useState(false);
  const [isGitView, setIsGitView] = useState(false);
  const [isAIView, setIsAIView] = useState(false);
  const [isChatView, setIsChatView] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);
  const [repoName, setRepoName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileHistory, setFileHistory] = useState<FileHistory>({});
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isTerminalView, setIsTerminalView] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  // const { decorations, clearDecorations } = useCollaborativeCursors(
  //   editorRef.current,
  //   users,
  //   selectedFile,
  //   session?.user?.email || ''
  // );
  

  // Add a ref to track if files have been fetched
  const hasInitializedRef = useRef(false);

  const [cursorPosition, setCursorPosition] = useState<{ lineNumber: number; column: number }>({
    lineNumber: 1,
    column: 1
  });

  // Add a helper function for case-insensitive file path comparison
  const isSameFile = (file1: string, file2: string | null): boolean => {
    if (!file1 || !file2) return false;
    return file1.toLowerCase() === file2.toLowerCase();
  };

  // Function to handle file content response from socket server
  const handleFileContentResponse = ({ file, content }: { file: string; content: string }) => {
    console.log('📥 [Room] Received file content response:', {
      file,
      contentLength: content.length,
      isSelectedFile: isSameFile(file, selectedFile)
    });

    // Update files state with new content
    setFiles((prev) => {
      const fileExists = prev.some(f => isSameFile(f.path, file));
      if (!fileExists) {
        console.log('📁 [Room] Adding new file to state:', file);
        return [...prev, { path: file, content }];
      }
      
      const updatedFiles = prev.map((f) => 
        isSameFile(f.path, file) ? { ...f, content } : f
      );
      console.log('📁 [Room] Updated file content in state:', file);
      return updatedFiles;
    });

    // Update editor if this is the selected file
    if (isSameFile(file, selectedFile)) {
      console.log('✏️ [Room] Updating editor with new content');
      setFileContent(content);
      
      if (editorRef.current) {
        const editor = editorRef.current;
        const currentValue = editor.getValue();
        
        if (currentValue !== content) {
          console.log('🔄 [Room] Updating editor value');
          // Store cursor position
          const position = editor.getPosition();
          editor.setValue(content);
          // Restore cursor position if it exists
          if (position) {
            editor.setPosition(position);
          }
          console.log('✅ [Room] Editor content updated successfully');
        } else {
          console.log('ℹ️ [Room] Editor content already matches received content');
        }
      } else {
        console.log('⚠️ [Room] Editor ref not available for content update');
      }
    }
  };

  // Initialize socket connection
  const { socket, isConnected, emitCodeChange, requestFileList } = useSocket({
    roomId: id,
    user: {
      id: session?.user?.email || '',
      name: session?.user?.name,
      email: session?.user?.email,
      image: session?.user?.image || '',
    },
    onCodeUpdate: ({ file, content }) => {
      console.log('📥 [Room] Received code update:', { 
        file,
        contentLength: content.length,
        isSelectedFile: isSameFile(file, selectedFile),
        hasContent: !!content
      });
      
      // Update files state first
      setFiles((prev) => {
        const updatedFiles = prev.map((f) => 
          isSameFile(f.path, file) ? { ...f, content } : f
        );
        console.log('📁 [Room] Files state updated:', {
          totalFiles: updatedFiles.length,
          updatedFile: file
        });
        return updatedFiles;
      });
      
      // Update editor content if this is the selected file
      if (isSameFile(file, selectedFile)) {
        console.log('✏️ [Room] Updating editor content for selected file');
        setFileContent(content);
        if (editorRef.current) {
          const editor = editorRef.current;
          const currentValue = editor.getValue();
          console.log('📊 [Room] Current vs new content:', {
            currentLength: currentValue?.length,
            newLength: content?.length,
            areEqual: currentValue === content
          });
          
          if (currentValue !== content) {
            const position = editor.getPosition();
            console.log('📌 [Room] Storing cursor position:', position);
            editor.setValue(content);
            if (position) {
              console.log('📌 [Room] Restoring cursor position');
              editor.setPosition(position);
            }
            console.log('✅ [Room] Editor content updated successfully');
          } else {
            console.log('ℹ️ [Room] Editor content already matches update');
          }
        } else {
          console.log('⚠️ [Room] Editor ref not available for content update');
        }
      }
    },
    onUserJoined: ({ users }) => {
      console.log('👥 [Room] Users updated:', {
        totalUsers: users.length,
        users: users.map(u => ({ id: u.id, name: u.name }))
      });
      const mappedUsers = users.map(u => ({
        id: u.id,
        name: u.name || '',
        color: u.color || '#000000',
        email: u.email,
        editorStates: u.editorStates as Map<string, { 
          cursorPosition: { lineNumber: number; column: number; }; 
          selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; } 
        }>
      }));
      setUsers(mappedUsers);
      toast({
        title: "User Joined",
        description: "A new collaborator has joined the room",
        duration: 3000,
      });
    },
    onUserLeft: ({ users }) => {
      console.log('👋 [Room] Users updated after user left:', {
        totalUsers: users.length,
        users: users.map(u => ({ id: u.id, name: u.name }))
      });
      const mappedUsers = users.map(u => ({
        id: u.id,
        name: u.name || '',
        color: u.color || '#000000',
        email: u.email,
        editorStates: u.editorStates as Map<string, { 
          cursorPosition: { lineNumber: number; column: number; }; 
          selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; } 
        }>
      }));
      setUsers(mappedUsers);
      toast({
        title: "User Left",
        description: "A collaborator has left the room",
        duration: 3000,
      });
    },
    onRoomState: (state) => {
      console.log('🏠 [Room] Room state received:', {
        users: state.users.length,
        files: state.files.length,
        hasSelectedFile: !!selectedFile
      });
      const mappedUsers = state.users.map(u => ({
        id: u.id,
        name: u.name || '',
        color: u.color || '#000000',
        email: u.email,
        editorStates: u.editorStates as Map<string, { 
          cursorPosition: { lineNumber: number; column: number; }; 
          selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; } 
        }>
      }));
      setUsers(mappedUsers);
      setFiles(state.files);
      if (state.files.length > 0 && !selectedFile) {
        console.log('📄 [Room] Setting initial file:', state.files[0].path);
        setSelectedFile(state.files[0].path);
        setFileContent(state.files[0].content);
        toast({
          title: "Room Loaded",
          description: `Connected with ${state.users.length} users and ${state.files.length} files`,
          duration: 3000,
        });
      }
    },
    onFileChange: ({ file, content }) => {
      console.log('📝 [Room] File content updated:', {
        file,
        content,
        contentLength: content.length
      });
      setFiles((prev) =>
        prev.map((f) => (f.path === file ? { ...f, content } : f))
      );
    },
    onFileListUpdate: (files) => {
      console.log('📁 [Room] File list updated:', {
        totalFiles: files.length,
        files: files.map(f => f.path)
      });
      setFiles(files);
    },
    onFileContentResponse: handleFileContentResponse
  });

  // Request file list when component mounts
  useEffect(() => {
    if (isConnected) {
      console.log('🔄 [Room] Socket connected, requesting file list');
      requestFileList();
      toast({
        title: "Connected",
        description: "Successfully connected to collaboration server",
        duration: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.accessToken && !hasInitializedRef.current) {
      // Fetch room data and initial files
      const fetchRoomData = async () => {
        try {
          console.log('🔄 [Room] Fetching room data...');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${id}`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json'
            },
            credentials: "include"
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('📦 [Room] Room data fetched:', {
              creator: data?.createdBy,
              repo: data.repo
            });
            setCreator(data?.createdBy || null);
            setRepoName(data.repo || null);
            
            // Fetch initial files from GitHub only if not already fetched
            if (data?.createdBy && data.repo && session.accessToken && !hasInitializedRef.current) {
              await fetchInitialFiles(data.createdBy, data.repo, session.accessToken);
              hasInitializedRef.current = true;
              console.log('✅ [Room] Initial files fetched and initialized');
            } else {
              console.log('ℹ️ [Room] Skipping file fetch:', {
                hasCreator: !!data?.createdBy,
                hasRepo: !!data.repo,
                hasAccessToken: !!session.accessToken,
                alreadyInitialized: hasInitializedRef.current
              });
            }
          } else if (response.status === 401) {
            toast({
              title: "Authentication Error",
              description: "Please sign in again to continue",
              variant: "destructive",
              className: "bg-red-950 border-red-800 text-white",
              duration: 5000,
            });
            router.push("/login");
          } else {
            throw new Error(`Failed to fetch room data: ${response.statusText}`);
          }
        } catch (error) {
          console.error("Failed to fetch room data:", error);
          toast({
            title: "Error",
            description: "Failed to load room data",
            variant: "destructive",
            className: "bg-red-950 border-red-800 text-white",
            duration: 5000,
          });
        }
      };

      fetchRoomData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, id]);

  // Function to fetch initial files from GitHub
  const fetchInitialFiles = async (creator: string, repoName: string, accessToken: string) => {
    try {
      console.log('🌐 [Room] Fetching initial files from GitHub');
      const response = await fetch(`https://api.github.com/repos/${creator}/${repoName}/contents`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch repository contents');
      }

      // const contents = await response.json();
      const files = await processDirectoryContents(creator, repoName, accessToken);
      
      console.log('📁 [Room] Initial files fetched:', {
        totalFiles: files.length,
        files: files.map(f => f.path)
      });

      // Update local state
      setFiles(files);
      
      // Send files to socket server to initialize its state
      if (socket?.connected) {
        console.log('🔄 [Room] Sending initial files to socket server');
        socket.emit('initializeFiles', {
          roomId: id,
          files: files
        });
      } else {
        console.log('⚠️ [Room] Socket not connected, will rely on room state sync');
      }

      // Set initial file if none selected
      if (files.length > 0 && !selectedFile) {
        console.log('📄 [Room] Setting initial file:', files[0].path);
        setSelectedFile(files[0].path);
        setFileContent(files[0].content);
      }
    } catch (error) {
      console.error('❌ [Room] Error fetching initial files:', error);
      toast({
        title: "Error",
        description: "Failed to load repository files",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
    }
  };

  // Function to process directory contents recursively
  const processDirectoryContents = async (
    creator: string,
    repoName: string,
    accessToken: string,
    path: string = ''
  ): Promise<FileContent[]> => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${creator}/${repoName}/contents/${path}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contents for path: ${path}`);
      }

      const contents = await response.json();
      const results: FileContent[] = [];

      for (const item of Array.isArray(contents) ? contents : [contents]) {
          if (item.type === 'file') {
            try {
              let content = '';
              if (item.content) {
                content = atob(item.content);
              } else if (item.download_url) {
                const contentResponse = await fetch(item.download_url);
                if (contentResponse.ok) {
                  content = await contentResponse.text();
                }
              }
              
              results.push({
                path: item.path,
                content
              });
            } catch (error) {
            console.error(`Failed to process file ${item.path}:`, error);
              results.push({
                path: item.path,
                content: ''
              });
            }
          } else if (item.type === 'dir') {
          const subContents = await processDirectoryContents(
            creator,
            repoName,
            accessToken,
            item.path
          );
          results.push(...subContents);
          }
        }
        
        return results;
    } catch (error) {
      console.error(`Error processing directory ${path}:`, error);
      return [];
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!selectedFile || !value) {
      console.log('⚠️ [Room] Editor change ignored:', { 
        hasSelectedFile: !!selectedFile,
        hasValue: !!value 
      });
      return;
    }

    console.log('✏️ [Room] Editor change:', {
        file: selectedFile,
      contentLength: value.length
    });

    // Update local state first
    setFileContent(value);
    setFiles((prev) => {
      const updatedFiles = prev.map((f) => 
        f.path === selectedFile ? { ...f, content: value } : f
      );
      console.log('📁 [Room] Local files state updated');
      return updatedFiles;
    });

    // Emit change to other users
    console.log('📤 [Room] Emitting code change to other users');
    emitCodeChange(selectedFile, value);

    // Track changes for commit
    if (!changes.includes(selectedFile)) {
      console.log('📝 [Room] Adding file to changes:', selectedFile);
      setChanges((prev) => [...prev, selectedFile]);
    }

    // Save this change as a new version
    saveToHistory(selectedFile, value);
  };

  // Update handleFileSelect to use case-insensitive comparison
  const handleFileSelect = async (file: { path: string; content: string }) => {
    console.log('📄 [Room] File selected:', {
      user: session?.user?.email,
      path: file.path,
      providedContent: !!file.content,
      contentLength: file.content?.length
    });
    
    try {
      // Always request fresh content from socket server when selecting a file
      if (!socket?.connected) {
        console.log('⚠️ [Room] Socket not connected, cannot fetch file content');
        toast({
          title: "Connection Error",
          description: "Not connected to server. Please try again.",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        return;
      }

      // Set the selected file immediately
      setSelectedFile(file.path);
      
      // Use existing content temporarily while waiting for fresh content
      const localFile = files.find(f => isSameFile(f.path, file.path));
      if (localFile?.content) {
        console.log('📄 [Room] Using temporary local content while fetching update:', {
          path: file.path,
          contentLength: localFile.content.length
        });
        setFileContent(localFile.content);
      } else {
        console.log('⌛ [Room] No local content available, clearing editor while fetching');
        setFileContent('');
      }

      // Request fresh content from socket server
      console.log('🔄 [Room] Requesting fresh file content from socket server');
      socket.emit('requestFileContent', {
        roomId: id,
        filePath: file.path
      });

      // Notify socket server about file selection
      socket.emit('fileSelect', { 
        roomId: id, 
        filePath: file.path 
      });

    } catch (error) {
      console.error('❌ [Room] Error selecting file:', error);
      toast({
        title: "Error",
        description: "Failed to load file content",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
    }
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
  
      console.log(`Attempting to commit ${filesToSend.length} files to repository: ${repoName}`);
      
      // Add proper authentication headers
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${id}/commit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`
        },
        credentials: "include",
        body: JSON.stringify({
          message,
          files: filesToSend,
          createMissing: true, // Add flag to create files if they don't exist
        }),
      });
  
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Commit response error:", errorData);
        throw new Error(errorData.message || `Failed to commit: ${response.statusText} (${response.status})`);
      }
  
      // Parse the response to confirm commit was successful
      const result = await response.json();
      
      if (result.success) {
        setChanges([]);
        setIsCommitView(false);
        toast({
          title: "Changes committed",
          description: "Your changes have been committed to the repository",
        });
      } else {
        throw new Error(result.message || "Commit was not successful");
      }
    } catch (error) {
      console.error("Failed to commit changes:", error);
      
      // Provide more specific error messages based on common issues
      let errorMessage = error instanceof Error ? error.message : "Failed to commit changes";
      
      if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        errorMessage = "File not found in repository. The file may need to be created first or the repository path might be incorrect.";
      } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
        errorMessage = "Authentication error. You may not have permission to commit to this repository.";
      }
      
      toast({
        title: "Commit Failed",
        description: errorMessage,
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
    }
  };

  const handleShare = async () => {
    const roomUrl = `${window.location.origin}/room/${id}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      toast({
        title: "Link copied!",
        description: "Share this link with others to collaborate",
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Failed to copy link",
        description: "Please copy the URL from your browser",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
    }
  };

  const handleAddFile = async (filePath: string) => {
    try {
      if (!filePath.trim()) {
        toast({
          title: "Invalid file name",
          description: "Please provide a valid file name",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        return;
      }

      // Check if file already exists
      if (files.some(f => f.path === filePath)) {
        toast({
          title: "File exists",
          description: `${filePath} already exists`,
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        return;
      }

      // Validate required data
      if (!creator || !repoName) {
        toast({
          title: "Error",
          description: "Repository information is not available",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        return;
      }

      const requestData = {
        path: filePath,
        content: "",
        repoName,
        creator,
        roomId: id
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const newFile = { path: filePath, content: "" };
        setFiles(prev => [...prev, newFile]);
        setSelectedFile(filePath);
        toast({
          title: "Success",
          description: `Created ${filePath}`,
        });
      } else if (response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        router.push("/login");
      } else {
        throw new Error(responseData?.message || `Failed to create file: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to create file:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create file",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
    }
  };

  const handleAddFolder = async (folderPath: string) => {
    try {
      if (!folderPath.trim()) {
        toast({
          title: "Invalid folder name",
          description: "Please provide a valid folder name",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        return;
      }

      // Check if folder already exists
      if (files.some(f => f.path.startsWith(`${folderPath}/`))) {
        toast({
          title: "Folder exists",
          description: `${folderPath} already exists`,
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        return;
      }

      // Validate required data
      if (!creator || !repoName) {
        toast({
          title: "Error",
          description: "Repository information is not available",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        return;
      }

      const requestData = {
        path: folderPath,
        repoName,
        creator,
        roomId: id
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/folders/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setFiles(prev => [...prev, { path: `${folderPath}/.gitkeep`, content: "" }]);
        toast({
          title: "Success",
          description: `Created folder ${folderPath}`,
        });
      } else if (response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        router.push("/login");
      } else {
        throw new Error(responseData?.message || `Failed to create folder: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
    }
  };

  const handleSaveFiles = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to save",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 3000,
      });
      return;
    }
  
    try {
      // Get current content from editor
      const currentContent = editorRef.current?.getValue() || fileContent;
      
      // Prepare the file to save
      const fileToSave = {
        path: selectedFile,
        content: currentContent
      };
      
      console.log('💾 [Room] Saving file:', {
        file: selectedFile,
        contentLength: currentContent.length
      });
  
      // Call the API to save the file
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          files: [fileToSave]
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save: ${response.statusText}`);
      }
  
      const result = await response.json();
      
      if (result.success) {
        // Update last saved timestamp
        setLastSaved(new Date());
        
        // Add to file history
        saveToHistory(selectedFile, currentContent);
        
        toast({
          title: "File saved",
          description: `Successfully saved ${selectedFile}`,
          duration: 3000,
        });
      } else {
        throw new Error(result.message || "Save was not successful");
      }
    } catch (error) {
      console.error("Failed to save file:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save file",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
    }
  };

  // Function to store editor instance
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    console.log('🎯 [Room] Editor mounted', monaco);
    console.log('🎯 [Room] Editor mounted successfully');
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const handleSuggestionSelect = (suggestion: string) => {
    if (!editorRef.current) return;
    
    const model = editorRef.current.getModel();
    if (!model) return;
    
    // Insert the suggestion at the current cursor position
    editorRef.current.executeEdits('ai-suggestion', [{
      range: {
        startLineNumber: cursorPosition.lineNumber,
        startColumn: cursorPosition.column,
        endLineNumber: cursorPosition.lineNumber,
        endColumn: cursorPosition.column
      },
      text: suggestion
    }]);
  };
  // Function to sync code with server periodically
  useEffect(() => {
    if (!isConnected || !socket) {
      console.log('⚠️ [Room] Socket not connected, skipping sync');
      return;
    }

    // Function to sync code with server
    const syncCode = () => {
      console.log('🔄 [Room] Starting code sync');
      if (selectedFile) {
        // Request current state of the selected file
        socket.emit('requestFileContent', {
          roomId: id,
          filePath: selectedFile
        });
      }
    };

    // Initial sync
    syncCode();

    // Set up interval for regular sync (every 5 seconds)
    const syncInterval = setInterval(syncCode, 5000);

    // Cleanup interval on unmount or when socket disconnects
    return () => {
      console.log('🧹 [Room] Cleaning up sync interval');
      clearInterval(syncInterval);
    };
  }, [isConnected, socket, selectedFile, id]);

  const saveToHistory = (filePath: string, content: string) => {
    if (!filePath || !content) return;

    setLastSaved(new Date());
    setFileHistory(prev => {
      const fileVersions = prev[filePath] || [];
      
      // Check if this content is different from the most recent version
      const lastVersion = fileVersions[0];
      if (lastVersion && lastVersion.content === content) {
        // Update timestamp of existing version instead of creating new one
        const updatedVersions = [
          { ...lastVersion, timestamp: new Date() },
          ...fileVersions.slice(1)
        ];
        return { ...prev, [filePath]: updatedVersions };
      }

      // Create new version only if content is different
      const newVersion: CodeVersion = {
        content,
        timestamp: new Date(),
        user: session?.user?.email || undefined
      };

      // Add new version and limit to 50 unique versions
      return {
        ...prev,
        [filePath]: [newVersion, ...fileVersions].slice(0, 50)
      };
    });
  };

  const handleRestoreVersion = (content: string) => {
    if (!selectedFile) return;
    
    setFileContent(content);
    if (editorRef.current) {
      editorRef.current.setValue(content);
    }
    
    // Emit change to other users
    emitCodeChange(selectedFile, content);
    
    // Save this restore action as a new version
    saveToHistory(selectedFile, content);
    
    // Close history view
    setIsHistoryView(false);

    toast({
      title: "Version Restored",
      description: `Restored previous version of ${selectedFile}`,
      duration: 3000,
    });
  };

  useEffect(() => {
    if (!isConnected || !socket || !selectedFile) {
      console.log('⚠️ [Room] Socket not connected or no file selected, skipping auto-save');
      return;
    }

    // Auto-save every 30 seconds
    autoSaveIntervalRef.current = setInterval(() => {
      if (editorRef.current) {
        const content = editorRef.current.getValue();
        console.log('💾 [Room] Auto-saving file:', selectedFile);
        saveToHistory(selectedFile, content);
      }
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, socket, selectedFile]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      <Side
        onCommitClick={() => {
          setIsCommitView(true);
          setIsGitView(false);
          setIsHistoryView(false);
          setIsChatView(false);
          setIsAIView(false);
        }}
        isCommitView={isCommitView}
        onGitClick={() => {
          setIsGitView(true);
          setIsCommitView(false);
          setIsHistoryView(false);
          setIsChatView(false);
          setIsAIView(false);
        }}
        isGitView={isGitView}
        isAIView={isAIView}
        onAIClick={() => {
          setIsAIView(true);
          setIsCommitView(false);
          setIsGitView(false);
          setIsHistoryView(false);
          setIsChatView(false);
        }}
      />

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          <div className="flex flex-col bg-zinc-900 w-full md:w-64 md:min-w-64 overflow-y-auto">
            <div className="p-4 flex-col gap-2">
            <div className="flex gap-2 flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShare}
                      className="p-2 bg-blue-600 hover:bg-blue-700 w-8 h-8"
                    >
                      <Share2 className="w-8 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share Room</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsChatView(true)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 w-8 h-8"
                    >
                      <MessageSquare className="w-8 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open Comments</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsHistoryView(true)}
                      className="p-2 w-8 h-8"
                      variant="outline"
                    >
                      <History className="w-8 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View History</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsTerminalView(true)}
                      className="p-2 w-8 h-8"
                      variant="outline"
                    >
                      <TerminalIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open Terminal</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSaveFiles}
                      className="p-2 w-8 h-8"
                      variant="outline"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              </div>
              {lastSaved && (
                <div className="text-xs sm:text-sm text-zinc-400 flex items-center px-3 mt-2">
                  Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <FileExplorer
                repoName={repoName}
                    files={files.filter(f => {
                      if (!f || typeof f !== 'object') return false;
                      if (typeof f.path !== 'string' || !f.path.trim()) return false;
                      if (typeof f.content !== 'string') {
                        console.warn('⚠️ [Room] File missing content:', f.path);
                        return false;
                      }
                      return true;
                    })}
                handleFileSelect={handleFileSelect}
                handleAddFile={handleAddFile}
                handleAddFolder={handleAddFolder}
              />
              </div>
          </div>

        <div className="flex-1 relative overflow-hidden h-[50vh] md:h-auto">
          {selectedFile ? (
            <Editor
                height="100%"
              theme="vs-dark"
              onMount={handleEditorDidMount}
                language={getLanguageFromFilename(selectedFile)}
                value={fileContent}
              onChange={handleEditorChange}
              options={{
                fontSize: 14,
                  fontFamily: "'Fira Code', monospace",
                  minimap: { enabled: true },
                  scrollBeyondLastLine: true,
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
            <div className="flex h-full items-center justify-center text-zinc-400">
              Select a file to start editing
            </div>
          )}
        </div>

        {isCommitView ? (
          <div className="w-full md:w-96 md:min-w-96 md:max-w-[30%] overflow-y-auto border-t md:border-t-0 md:border-l border-zinc-800">
            <CommitMenu
              repoName={repoName}
              username={session?.user?.name || ""}
              changes={changes}
              onCommit={handleCommit}
              onClose={() => setIsCommitView(false)}
            />
          </div> 
          ) : isGitView ? (
            <div className="w-full md:w-96 md:min-w-96 md:max-w-[30%] overflow-y-auto border-t md:border-t-0 md:border-l border-zinc-800">
              <GitOperations
                roomId={id}
                onClose={() => setIsGitView(false)}
              />
            </div>
          ) : isHistoryView && selectedFile ? (
            <div className="w-full md:w-96 md:min-w-96 md:max-w-[30%] overflow-y-auto border-t md:border-t-0 md:border-l border-zinc-800">
              <CodeHistory
                versions={fileHistory[selectedFile] || []}
                onRestoreVersion={handleRestoreVersion}
                onClose={() => setIsHistoryView(false)}
              />
            </div>
          ) :  isChatView ? (
            <div className="w-full md:w-96 md:min-w-96 md:max-w-[30%] overflow-y-auto border-t md:border-t-0 md:border-l border-zinc-800">
              <ChatPanel
                roomId={id}
                socket={socket}
                onClose={() => setIsChatView(false)}
              />
            </div>
          ) : isTerminalView ? (
            <div className="w-full md:w-96 md:min-w-96 md:max-w-[30%] overflow-y-auto border-t md:border-t-0 md:border-l border-zinc-800">
              <Terminal
                roomId={id}
                selectedFile={selectedFile}
                onClose={() => setIsTerminalView(false)}
              />
            </div>
          ): isAIView && selectedFile ?(
            <div className="w-96 border-l border-zinc-800 overflow-y-auto">
              <AIAssistant
                code={fileContent}
                language={getLanguageFromFilename(selectedFile)}
                cursorPosition={cursorPosition}
                onSuggestionSelect={handleSuggestionSelect}
              />
            </div>
          ):(
            <div className="hidden bg-zinc-900 lg:block w-64 min-w-64 overflow-y-auto border-l border-zinc-800">
              <CollaboratorsList users={users} currentFile={selectedFile} roomId={id}  />
            </div>
          )
        }
        </div>
      </div>
    </div>
  );
}

function getLanguageFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
    'txt': 'plaintext'
  };
  
  return languageMap[extension || ''] || 'plaintext';
} 