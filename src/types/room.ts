export interface User {
  id: string;
  name?: string;
  email?: string;
  color: string;
  currentFile?: string | null;
  cursorPosition?: {
    lineNumber: number;
    column: number;
  };
  isTyping?: boolean;
  lastTypingTime?: number;
  editorStates?: Map<string, {
    cursorPosition: {
      lineNumber: number;
      column: number;
    };
    selection?: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    };
  }>;
} 