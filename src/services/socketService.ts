
import { io, Socket } from 'socket.io-client';
import { FileItem } from '@/components/FileExplorer';

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface RoomState {
  users: User[];
  files: FileItem[];
}
/* eslint-disable @typescript-eslint/no-explicit-any */
class SocketService {
  private socket: Socket | null = null;
  private userId: string = '';
  private roomId: string = '';
  /* eslint-disable @typescript-eslint/no-unsafe-function-type */
private eventHandlers: Record<string, Function[]> = {};
/* eslint-enable @typescript-eslint/no-unsafe-function-type */

  // Connection methods
  // Update connect method to include auth token
  connect(roomId: string, username: string, token?: string): Promise<void> {
    console.log('Attempting to connect to socket server:', { roomId, username });
    return new Promise((resolve) => {
      try {
        this.socket = io('http://localhost:4000', {
          query: {
            roomId,
            username
          },
          auth: {
            token
          },
          timeout: 5000,
          reconnectionAttempts: 3
        });
        
        this.socket.on('connect', () => {
          this.userId = this.socket?.id || '';
          this.roomId = roomId;
          console.log('Socket connection established:', {
            userId: this.userId,
            roomId: this.roomId,
          });
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error details:', {
            message: error.message,
            name: error.name,
            description: (error as { description?: string }).description || 'No description available'
          });
          resolve();
        });
        
        this.socket.on('connect_timeout', () => {
          console.warn('Socket connection timeout, falling back to mock mode');
          resolve();
        });
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        resolve();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event listeners
  onUserJoined(callback: (user: User) => void): void {
    this.socket?.on('user:joined', callback);
  }

  onUserLeft(callback: (userId: string) => void): void {
    this.socket?.on('user:left', callback);
  }

  // Update onRoomState to handle real data
  onRoomState(callback: (state: RoomState) => void): void {
      console.log('Setting up real-time room state listener');
      this.socket?.on('room:state', (state) => {
        console.log('Received real-time room state:', {
          userCount: state.users.length,
          fileCount: state.files.length
        });
        callback(state);
      }); 
  }

  // Helper method to transform file data

  private transformFiles(files: any[]): FileItem[] {
    return files.map(file => ({
      name: file.name,
      path: file.path,
      type: file.type || 'file',
      children: file.children ? this.transformFiles(file.children) : undefined
    }));
  }

  // Update onFileContentResponse to fetch real file content
  onFileContentResponse(callback: (data: { fileId: string, content: string }) => void): void {
    this.socket?.on('file:content', callback);
  }

  // Update emitCodeUpdate to send real updates
  emitCodeUpdate(fileId: string, content: string): void {
    this.socket?.emit('code:update', { fileId, content, userId: this.userId });
  }

  onCodeUpdate(callback: (data: { fileId: string, content: string, userId: string }) => void): void {
      this.socket?.on('code:update', callback);
  }
  // Helper for mock mode
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private registerEventHandler(event: string, callback: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  }
  
  emitSelectFile(fileId: string): void {
    this.socket?.emit('file:select', { fileId, userId: this.userId });
  }

  emitAddFile(path: string, name: string): void {
    this.socket?.emit('file:add', { path, name, userId: this.userId });
  }

  emitAddFolder(path: string, name: string): void {
    this.socket?.emit('folder:add', { path, name, userId: this.userId });
  }

  emitCommitChanges(message: string): void {
    this.socket?.emit('git:commit', { message, userId: this.userId });
  }

  isMockMode(): boolean {
    return !this.socket?.connected;
  }

  mockFileContent(filePath: string): string {
    return `// Collaborative file: ${filePath}\nconsole.log("Ready to collaborate");\n`;
  }

  getUserId(): string {
    return this.userId;
  }

  getRoomId(): string {
    return this.roomId;
  }
}

const socketService = new SocketService();
export default socketService;
