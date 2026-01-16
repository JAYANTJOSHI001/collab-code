
'use client';

import { useEffect, useRef, useState } from 'react';

interface MonacoEditorCDNProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  onMount?: (editor: any, monaco: any) => void;
  options?: any;
  height?: string;
  theme?: string;
}

export default function MonacoEditorCDN({
  value,
  language,
  onChange,
  onMount,
  options = {},
  height = '100%',
  theme = 'vs-dark',
}: MonacoEditorCDNProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load Monaco from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      window.require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
        },
      });

      // @ts-ignore
      window.require(['vs/editor/editor.main'], () => {
        if (!containerRef.current) return;

        // @ts-ignore
        const monaco = window.monaco;

        const editor = monaco.editor.create(containerRef.current, {
          value,
          language,
          theme,
          automaticLayout: true,
          ...options,
        });

        editorRef.current = editor;

        editor.onDidChangeModelContent(() => {
          if (onChange) {
            onChange(editor.getValue());
          }
        });

        if (onMount) {
          onMount(editor, monaco);
        }

        setIsReady(true);
      });
    };

    document.head.appendChild(script);

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && isReady) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        const position = editorRef.current.getPosition();
        editorRef.current.setValue(value);
        if (position) {
          editorRef.current.setPosition(position);
        }
      }
    }
  }, [value, isReady]);

  return (
    <div ref={containerRef} style={{ height, width: '100%' }}>
      {!isReady && (
        <div className="flex h-full items-center justify-center text-zinc-400">
          Loading editor...
        </div>
      )}
    </div>
  );
}