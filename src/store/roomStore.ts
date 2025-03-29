import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface FileContent {
  path: string;
  content: string;
}

interface User {
  id: string;
  name?: string;
  color?: string;
}

interface CodeVersion {
  content: string;
  timestamp: Date;
  user?: string;
}

interface FileHistory {
  [path: string]: CodeVersion[];
}

interface RoomState {
  // Socket state
  socket: Socket | null;
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  
  // Room data
  roomId: string | null;
  creator: string | null;
  repoName: string | null;
  
  // Files and editing
  files: FileContent[];
  selectedFile: string | null;
  fileContent: string;
  changes: string[];
  fileHistory: FileHistory;
  lastSaved: Date | null;
  
  // Users
  users: User[];
  
  // UI state
  isCommitView: boolean;
  isGitView: boolean;
  isHistoryView: boolean;
  
  // Actions
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setConnectionQuality: (quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected') => void;
  setRoomId: (roomId: string | null) => void;
  setCreator: (creator: string | null) => void;
  setRepoName: (repoName: string | null) => void;
  setFiles: (files: FileContent[]) => void;
  setSelectedFile: (file: string | null) => void;
  setFileContent: (content: string) => void;
  addChange: (file: string) => void;
  clearChanges: () => void;
  addFileVersion: (file: string, content: string, user?: string) => void;
  setUsers: (users: User[]) => void;
  setIsCommitView: (isCommitView: boolean) => void;
  setIsGitView: (isGitView: boolean) => void;
  setIsHistoryView: (isHistoryView: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  // Socket state
  socket: null,
  isConnected: false,
  connectionQuality: 'disconnected',
  
  // Room data
  roomId: null,
  creator: null,
  repoName: null,
  
  // Files and editing
  files: [],
  selectedFile: null,
  fileContent: '',
  changes: [],
  fileHistory: {},
  lastSaved: null,
  
  // Users
  users: [],
  
  // UI state
  isCommitView: false,
  isGitView: false,
  isHistoryView: false,
  
  // Actions
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setConnectionQuality: (connectionQuality) => set({ connectionQuality }),
  setRoomId: (roomId) => set({ roomId }),
  setCreator: (creator) => set({ creator }),
  setRepoName: (repoName) => set({ repoName }),
  setFiles: (files) => set({ files }),
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setFileContent: (fileContent) => set({ fileContent }),
  addChange: (file) => set((state) => ({ 
    changes: state.changes.includes(file) ? state.changes : [...state.changes, file] 
  })),
  clearChanges: () => set({ changes: [] }),
  addFileVersion: (file, content, user) => set((state) => {
    const fileVersions = state.fileHistory[file] || [];
    const lastVersion = fileVersions[0];
    
    // If content is the same, just update timestamp
    if (lastVersion && lastVersion.content === content) {
      const updatedVersions = [
        { ...lastVersion, timestamp: new Date() },
        ...fileVersions.slice(1)
      ];
      return { 
        fileHistory: { ...state.fileHistory, [file]: updatedVersions },
        lastSaved: new Date()
      };
    }
    
    // Create new version
    const newVersion: CodeVersion = {
      content,
      timestamp: new Date(),
      user
    };
    
    return { 
      fileHistory: { 
        ...state.fileHistory, 
        [file]: [newVersion, ...fileVersions].slice(0, 50) 
      },
      lastSaved: new Date()
    };
  }),
  setUsers: (users) => set({ users }),
  setIsCommitView: (isCommitView) => set({ 
    isCommitView,
    isGitView: isCommitView ? false : false,
    isHistoryView: isCommitView ? false : false
  }),
  setIsGitView: (isGitView) => set({ 
    isGitView,
    isCommitView: isGitView ? false : false,
    isHistoryView: isGitView ? false : false
  }),
  setIsHistoryView: (isHistoryView) => set({ 
    isHistoryView,
    isCommitView: isHistoryView ? false : false,
    isGitView: isHistoryView ? false : false
  })
}));