'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => void;
  options?: Monaco.editor.IStandaloneEditorConstructionOptions;
  height?: string;
  theme?: string;
}

export default function MonacoEditor({
  value,
  language,
  onChange,
  onMount,
  options = {},
  height = '100%',
  theme = 'vs-dark',
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const monacoRef = useRef<typeof Monaco | null>(null);

  useEffect(() => {
    let mounted = true;

    const initMonaco = async () => {
      try {
        if (!containerRef.current) return;

        // Dynamically import Monaco
        const monaco = await import('monaco-editor');
        
        // Self-host Monaco workers to avoid dynamic import issues
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.MonacoEnvironment = {
            getWorker(_: string, label: string) {
              // Return dummy worker to prevent dynamic imports
              return new Worker(
                URL.createObjectURL(
                  new Blob(['self.onmessage = () => {}'], { type: 'text/javascript' })
                )
              );
            },
          };
        }

        if (!mounted) return;

        monacoRef.current = monaco;

        // Create editor
        const editor = monaco.editor.create(containerRef.current, {
          value,
          language,
          theme,
          automaticLayout: true,
          ...options,
        });

        editorRef.current = editor;

        // Set up change listener
        editor.onDidChangeModelContent(() => {
          if (onChange) {
            onChange(editor.getValue());
          }
        });

        // Call onMount callback
        if (onMount) {
          onMount(editor, monaco);
        }

        setIsEditorReady(true);
      } catch (error) {
        console.error('Failed to initialize Monaco Editor:', error);
      }
    };

    initMonaco();

    return () => {
      mounted = false;
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []); // Only run once on mount

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const editor = editorRef.current;
      const currentValue = editor.getValue();
      
      if (currentValue !== value) {
        const position = editor.getPosition();
        editor.setValue(value);
        if (position) {
          editor.setPosition(position);
        }
      }
    }
  }, [value, isEditorReady]);

  // Update language when it changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current && isEditorReady) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language, isEditorReady]);

  return (
    <div ref={containerRef} style={{ height, width: '100%' }}>
      {!isEditorReady && (
        <div className="flex h-full items-center justify-center text-zinc-400">
          Loading editor...
        </div>
      )}
    </div>
  );
}