"use client"
import { useRef } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';

type IStandaloneCodeEditor = Parameters<OnMount>[0];

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
}

const CodeEditor = ({ language, value, onChange, onMount }: CodeEditorProps) => {
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: 'on',
        autoIndent: 'full',
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
};

export default CodeEditor;
