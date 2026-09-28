import { useEffect, useRef, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { User } from '@/types/room';

interface CursorDecoration {
  userId: string;
  decorationIds: string[];
}

export function useCollaborativeCursors(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  users: User[],
  currentFile: string | null,
  currentUserId: string
) {
  const [decorations, setDecorations] = useState<CursorDecoration[]>([]);
  const decorationsRef = useRef<CursorDecoration[]>([]);

  // Helper to clear all decorations
  const clearDecorations = useCallback(() => {
    if (!editor) return;
    
    decorationsRef.current.forEach(deco => {
      if (deco.decorationIds.length > 0) {
        editor.deltaDecorations(deco.decorationIds, []);
      }
    });
    
    setDecorations([]);
    decorationsRef.current = [];
  }, [editor]);

  // Update decorations when users or file changes
  useEffect(() => {
    if (!editor || !currentFile) return;

    // Clear existing decorations
    clearDecorations();

    // Filter users who are editing the current file (excluding current user)
    const relevantUsers = users.filter(user => 
      user.id !== currentUserId && 
      user.currentFile === currentFile &&
      user.editorStates?.get(currentFile)?.cursorPosition
    );

    // Create new decorations
    const newDecorations = relevantUsers.map(user => {
      const editorState = user.editorStates?.get(currentFile);
      if (!editorState?.cursorPosition) return { userId: user.id, decorationIds: [] };

      const { lineNumber, column } = editorState.cursorPosition;
      
      // Create cursor decoration
      const cursorDeco = {
        range: new monaco.Range(lineNumber, column, lineNumber, column),
        options: {
          className: 'cursor-decoration',
          hoverMessage: { value: user.name || user.email || 'Anonymous' },
          beforeContentClassName: 'cursor-glyph',
          glyphMarginClassName: 'cursor-margin',
          glyphMarginHoverMessage: { value: user.name || user.email || 'Anonymous' },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          zIndex: 10,
          overviewRuler: {
            color: user.color,
            position: monaco.editor.OverviewRulerLane.Center
          }
        }
      };

      // Create label decoration
      const labelDeco = {
        range: new monaco.Range(lineNumber, column, lineNumber, column),
        options: {
          afterContentClassName: 'cursor-label',
          after: {
            content: `  ${user.name || user.email || 'Anonymous'}`,
            inlineClassName: `cursor-label-text cursor-label-${user.id.replace(/[^a-zA-Z0-9]/g, '-')}`
          },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        }
      };

      // Apply decorations to editor
      const decorationIds = editor.deltaDecorations([], [cursorDeco, labelDeco]);

      // Add dynamic CSS for this user's cursor color
      addCursorStyle(user.id, user.color);

      return {
        userId: user.id,
        decorationIds
      };
    });

    setDecorations(newDecorations);
    decorationsRef.current = newDecorations;

    return () => {
      clearDecorations();
    };
  }, [editor, users, currentFile, currentUserId, clearDecorations]);

  // Add dynamic CSS for cursor styling
  const addCursorStyle = (userId: string, color: string) => {
    const styleId = `cursor-style-${userId.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .cursor-glyph {
        border-left: 2px solid ${color} !important;
        height: 18px !important;
        margin-left: 0 !important;
        z-index: 10;
      }
      .cursor-label-${userId.replace(/[^a-zA-Z0-9]/g, '-')} {
        background-color: ${color};
        color: white;
        padding: 0 4px;
        border-radius: 2px;
        font-size: 12px;
        opacity: 0.8;
        position: relative;
        top: -18px;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  };

  return {
    decorations,
    clearDecorations
  };
}