
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
  private mockMode: boolean = false;
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
            token // Add auth token for authentication
          },
          timeout: 5000,
          reconnectionAttempts: 3
        });
        
        this.socket.on('connect', () => {
          this.userId = this.socket?.id || '';
          this.roomId = roomId;
          this.mockMode = false;
          console.log('Socket connection established:', {
            userId: this.userId,
            roomId: this.roomId,
            mockMode: this.mockMode
          });
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error details:', {
            message: error.message,
            name: error.name,
            description: (error as { description?: string }).description || 'No description available'
          });
          this.setupMockSocket(roomId, username);
          resolve();
        });
        
        this.socket.on('connect_timeout', () => {
          console.warn('Socket connection timeout, falling back to mock mode');
          // Fallback to mock mode
          this.setupMockSocket(roomId, username);
          resolve();
        });
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        // Fallback to mock mode
        this.setupMockSocket(roomId, username);
        resolve();
      }
    });
  }

  setupMockSocket(roomId: string, username: string): void {
    // Generate a mock user ID
    this.userId = 'mock-' + Math.random().toString(36).substr(2, 9);
    this.roomId = roomId;
    this.mockMode = true;
    console.log(username);
    
    // Create a mock event emitter system
    this.eventHandlers = {};
    
    console.log('Running in mock mode with ID:', this.userId);
  }

  disconnect(): void {
    if (this.socket && !this.mockMode) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear all event handlers in mock mode
    if (this.mockMode) {
      this.eventHandlers = {};
    }
  }

  // Event listeners
  onUserJoined(callback: (user: User) => void): void {
    if (this.mockMode) {
      this.registerEventHandler('user:joined', callback);
      // Simulate another user joining after a short delay
      setTimeout(() => {
        if (this.mockMode) {
          callback({ 
            id: 'mock-user-2', 
            name: 'Alex Chen', 
            color: '#EC4899' 
          });
        }
      }, 2000);
    } else {
      this.socket?.on('user:joined', callback);
    }
  }

  onUserLeft(callback: (userId: string) => void): void {
    if (this.mockMode) {
      this.registerEventHandler('user:left', callback);
    } else {
      this.socket?.on('user:left', callback);
    }
  }

  // Update onRoomState to handle real data
  onRoomState(callback: (state: RoomState) => void): void {
    console.log('Setting up room state handler:', { mockMode: this.mockMode });
    if (this.mockMode) {
      this.registerEventHandler('room:state', callback);
      console.log('Fetching room state from API:', { roomId: this.roomId });
      fetch(`http://localhost:4000/api/room/${this.roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      .then(res => {
        console.log('Room state API response:', { status: res.status });
        return res.json();
      })
      .then(data => {
        console.log('Received room state data:', {
          hasUsers: !!data.users,
          userCount: data.users?.length || 0,
          hasFiles: !!data.files,
          fileCount: data.files?.length || 0
        });
        callback({
          users: data.users || [],
          files: this.transformFiles(data.files || [])
        });
      })
      .catch(err => {
        console.error('Room state fetch error:', {
          error: err.message,
          stack: err.stack,
          roomId: this.roomId
        });
      });
    } else {
      console.log('Setting up real-time room state listener');
      this.socket?.on('room:state', (state) => {
        console.log('Received real-time room state:', {
          userCount: state.users.length,
          fileCount: state.files.length
        });
        callback(state);
      });
    }
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
    if (this.mockMode) {
      this.registerEventHandler('file:content', callback);
      if (this.currentMockFile) {
        // Fetch real file content from backend
        fetch(`http://localhost:4000/api/file/${this.currentMockFile}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        .then(res => res.json())
        .then(data => {
          callback({
            fileId: this.currentMockFile!,
            content: data.content
          });
        })
        .catch(err => console.error('Failed to fetch file content:', err));
      }
    } else {
      this.socket?.on('file:content', callback);
    }
  }

  // Update emitCodeUpdate to send real updates
  emitCodeUpdate(fileId: string, content: string): void {
    if (this.mockMode) {
      fetch(`http://localhost:4000/api/file/${fileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })
      .then(() => {
        this.triggerMockEvent('code:update', { fileId, content, userId: this.userId });
      })
      .catch(err => console.error('Failed to update file:', err));
    } else {
      this.socket?.emit('code:update', { fileId, content, userId: this.userId });
    }
  }

  onCodeUpdate(callback: (data: { fileId: string, content: string, userId: string }) => void): void {
    if (this.mockMode) {
      this.registerEventHandler('code:update', callback);
    } else {
      this.socket?.on('code:update', callback);
    }
  }
  // Helper for mock mode
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private registerEventHandler(event: string, callback: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  }
  private triggerMockEvent(event: string, ...args: any[]): void {
    if (this.mockMode && this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(...args));
    }
  }

  // Event emitters
  private currentMockFile: string | null = null;
  
  emitSelectFile(fileId: string): void {
    if (this.mockMode) {
      this.currentMockFile = fileId;
      // Simulate the server's response with file content
      setTimeout(() => {
        this.triggerMockEvent('file:content', { 
          fileId, 
          content: this.mockFileContent(fileId) 
        });
      }, 100);
    } else {
      this.socket?.emit('file:select', { fileId, userId: this.userId });
    }
  }

  emitAddFile(path: string, name: string): void {
    if (this.mockMode) {
      // In mock mode, nothing happens
    } else {
      this.socket?.emit('file:add', { path, name, userId: this.userId });
    }
  }

  emitAddFolder(path: string, name: string): void {
    if (this.mockMode) {
      // In mock mode, nothing happens
    } else {
      this.socket?.emit('folder:add', { path, name, userId: this.userId });
    }
  }

  emitCommitChanges(message: string): void {
    if (this.mockMode) {
      // In mock mode, nothing happens
    } else {
      this.socket?.emit('git:commit', { message, userId: this.userId });
    }
  }

  // Mock implementation for demo purposes
  mockInitialRoomState(): RoomState {
    // In a real app, this would come from the server
    return {
      users: [
        { id: this.userId, name: 'You', color: '#3B82F6' },
        { id: '2', name: 'Jayant Joshi', color: '#10B981' }
      ],
      files: [
        {
          name: 'Python-Projects',
          path: 'Python-Projects',
          type: 'directory',
          children: [
            {
              name: 'Calculator.py',
              path: 'Python-Projects/Calculator.py',
              type: 'file'
            },
            {
              name: 'README.md',
              path: 'Python-Projects/README.md',
              type: 'file'
            },
            {
              name: 'Rock,Paper&Scissors.py',
              path: 'Python-Projects/Rock,Paper&Scissors.py',
              type: 'file'
            },
            {
              name: 'snake,water&gun.py',
              path: 'Python-Projects/snake,water&gun.py',
              type: 'file'
            },
            {
              name: 'snakegame.py',
              path: 'Python-Projects/snakegame.py',
              type: 'file'
            }
          ]
        }
      ]
    };
  }

  mockFileContent(fileId: string): string {
    // In a real app, this would fetch the actual file content from the server
    if (fileId.includes('Calculator.py')) {
      return `#Importing library for making GUI
import PySimpleGUI as psg

#Applying theme to GUI
psg.theme('DarkGrey14')

#Making GUI
column_1=[
    [psg.Button('7',size=(4,2)),psg.Button('8',size=(4,2)),psg.Button('9',size=(4,2))],
    [psg.Button('4',size=(4,2)),psg.Button('5',size=(4,2)),psg.Button('6',size=(4,2))],
    [psg.Button('1',size=(4,2)),psg.Button('2', size=(4,2)),psg.Button('3',size=(4,2))],
    [psg.Button('*',size=(4,2),key="-Power-"),psg.Button('0',size=(4,2)),psg.Button('.',size=(4,2))]
]

column_2=[
    [psg.Button('x',size=(4,2),key="-Multiply-")],
    [psg.Button('-',size=(4,2),key="-Minus-")],
    [psg.Button('+',size=(4,5),key="-Plus-")]
]

column_3=[
    [psg.Button('/',size=(4,2),key="-Division-")],
    [psg.Button('%',size=(4,2),key="-Modulus-")],
    [psg.Button("C",size=(4,2),key="-Cancel-")],
    [psg.Button('=',size=(4,2),key="-Equal-")]
]`;
    } else if (fileId.includes('README.md')) {
      return `# Python Projects Collection

A collection of simple Python projects for beginners.

## Projects Included:
- Calculator
- Rock, Paper & Scissors Game
- Snake, Water & Gun Game
- Snake Game

Feel free to explore and modify these projects!`;
    }
    return `// No content available for this file`;
  }

  getUserId(): string {
    return this.userId;
  }

  getRoomId(): string {
    return this.roomId;
  }

  isMockMode(): boolean {
    return this.mockMode;
  }
}

const socketService = new SocketService();
export default socketService;
