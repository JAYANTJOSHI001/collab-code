import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';

interface User {
  id: string;
  name?: string;
  email?: string;
  accessToken?: string;
  color: string;
  currentFile?: string | null;
  isTyping?: boolean;
  lastTypingTime?: number;
  editorStates?: Map<string, unknown>;
}

interface FileContent {
  path: string;
  content: string;
}

interface CursorPosition {
  file: string;
  lineNumber: number;
  column: number;
}

interface Selection {
  file: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface RoomState {
  users: User[];
  files: FileContent[];
  cursors: [string, CursorPosition][];
  selections: [string, Selection][];
}

interface UseSocketProps {
  roomId: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
  onCodeUpdate?: (data: { 
    file: string; 
    content: string; 
    userId: string;
    cursor?: CursorPosition;
    selection?: Selection;
  }) => void;
  onUserJoined?: (data: { user: User; users: User[] }) => void;
  onUserLeft?: (data: { userId: string; users: User[] }) => void;
  onRoomState?: (state: RoomState) => void;
  onFileChange?: (data: { file: string; content: string }) => void;
  onFileListUpdate?: (files: FileContent[]) => void;
  onCursorUpdate?: (data: { userId: string; file: string; position: CursorPosition }) => void;
  onSelectionUpdate?: (data: { userId: string; file: string; selection: Selection }) => void;
  onFileContentResponse?: (data: { file: string; content: string }) => void;
}

export function useSocket({
  roomId,
  user,
  onCodeUpdate,
  onUserJoined,
  onUserLeft,
  onRoomState,
  onFileChange,
  onFileListUpdate,
  onCursorUpdate,
  onSelectionUpdate,
  onFileContentResponse
}: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    try {
      const timers = debounceTimers.current;
      // Initialize socket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
        query: { 
          userId: user.id,
          userColor: `#${Math.floor(Math.random()*16777215).toString(16)}`
        }
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('🔌 [Socket] Connected to server');
        setIsConnected(true);
        
        // Join room after connection
        if (roomId) {
          console.log('🚪 [Socket] Joining room:', roomId);
          socketRef.current?.emit('joinRoom', {
            roomId,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
              currentFile: null,
              isTyping: false,
              lastTypingTime: Date.now(),
              editorStates: new Map()
            }
          });
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ [Socket] Disconnected from server');
        setIsConnected(false);
      });

      // Room events
      socketRef.current.on('roomState', (state: RoomState) => {
        console.log('📦 [Socket] Room state received:', { 
          users: state.users.length,
          files: state.files.length 
        });
        if (state) {
          onRoomState?.(state);
          onFileListUpdate?.(state.files);
        }
      });

      socketRef.current.on('userJoined', (data) => {
        console.log('👋 [Socket] User joined:', {
          userId: data.user?.id,
          name: data.user?.name || data.user?.email || 'Anonymous',
          totalUsers: data.users.length
        });
        if (data && data.users) {
          onUserJoined?.(data);
          toast({
            title: 'User joined',
            description: `${data.user?.name || data.user?.email || 'Anonymous'} joined the room`
          });
        }
      });

      socketRef.current.on('userLeft', (data) => {
        console.log('👋 [Socket] User left:', {
          userId: data.userId,
          totalUsers: data.users.length
        });
        if (data && data.users) {
          onUserLeft?.(data);
          toast({
            title: 'User left',
            description: 'A user has left the room'
          });
        }
      });

      socketRef.current.on('codeUpdate', (data) => {
        console.log('📝 [Socket] Code update received:', {
          file: data.file,
          contentLength: data.content.length,
          userId: data.userId,
          hasContent: !!data.content
        });
        
        // Ensure we have valid data before processing
        if (data && data.file && data.content) {
          // Call both handlers to ensure state updates
          onCodeUpdate?.(data);
          onFileChange?.(data);
          
          // Log success
          console.log('✅ [Socket] Code update processed successfully');
        } else {
          console.warn('⚠️ [Socket] Invalid code update data received:', data);
        }
      });

      socketRef.current.on('cursorUpdate', (data) => {
        console.log('Cursor update received:', data);
        onCursorUpdate?.(data);
      });

      socketRef.current.on('selectionUpdate', (data) => {
        console.log('Selection update received:', data);
        onSelectionUpdate?.(data);
      });

      socketRef.current.on('fileListUpdate', (files: FileContent[]) => {
        console.log('📁 [Socket] File list updated:', {
          totalFiles: files.length,
          files: files.map(f => f.path)
        });
        onFileListUpdate?.(files);
      });

      socketRef.current.on('fileContentResponse', (data) => {
        console.log('📥 [Socket] File content response received:', {
          file: data.file,
          contentLength: data.content.length
        });
        onFileContentResponse?.(data);
      });

      socketRef.current.on('error', (error: string) => {
        console.error('⚠️ [Socket] Error:', error);
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive'
        });
      });

      socketRef.current.on('chatMessage', (message) => {
        console.log('📬 [Socket] Chat message received:', message);
      });

      socketRef.current.on('chatHistory', (history) => {
        console.log('📬 [Socket] Chat History received:', history);
      });

      // Cleanup on unmount
      return () => {
        console.log('🧹 [Socket] Cleaning up socket connection');
        // Clear all debounce timers
        timers.forEach(timer => clearTimeout(timer));
        timers.clear();
        
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('❌ [Socket] Failed to initialize:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to the socket server',
        variant: 'destructive'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user.id, user.name, user.email]);

  // Function to emit code changes with debouncing
  const emitCodeChange = (file: string, content: string) => {
    if (!socketRef.current?.connected) {
      console.log('⚠️ [Socket] Cannot emit code change - socket not connected');
      return;
    }

    // Clear existing debounce timer
    const timerKey = `${roomId}-${file}`;
    if (debounceTimers.current.has(timerKey)) {
      console.log('⏱️ [Socket] Clearing existing debounce timer for:', file);
      clearTimeout(debounceTimers.current.get(timerKey));
    }

    // Set new debounce timer with shorter delay
    debounceTimers.current.set(timerKey, setTimeout(() => {
      console.log('📤 [Socket] Emitting code change:', {
        file,
        contentLength: content.length,
        roomId
      });
      
      // Ensure we're sending valid data
      if (file && content) {
        socketRef.current?.emit('codeChange', { 
          file, 
          content,
          roomId,
          userId: user.id
        });
      } else {
        console.warn('⚠️ [Socket] Invalid data for code change:', { file, content });
      }
    }, 50)); // Reduced debounce time for faster updates
  };

  // Function to emit cursor movement
  const emitCursorMove = (file: string, position: CursorPosition) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('cursorMove', { file, position });
    }
  };

  const sendChatMessage = (messageData: { roomId: string; message: string; userId: string }) => {// Ensure socket is connected before sending
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendChatMessage', messageData);
    }
  };

  const getChatHistory = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('getChatHistory', { roomId });
    }
  };

  // Function to emit selection changes
  const emitSelectionChange = (file: string, selection: Selection) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('selectionChange', { file, selection });
    }
  };

  // Function to request file list
  const requestFileList = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('requestFileList', { roomId });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emitCodeChange,
    emitCursorMove,
    emitSelectionChange,
    requestFileList,
    sendChatMessage,
    getChatHistory,
  };
} 