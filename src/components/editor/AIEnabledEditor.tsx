import React, { useRef, useState, } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import AIAssistant from './AIAssistant';

interface AIEnabledEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  theme?: string;
}

const AIEnabledEditor: React.FC<AIEnabledEditorProps> = ({
  value,
  language,
  onChange,
  theme = 'vs-dark'
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ lineNumber: number; column: number }>({
    lineNumber: 1,
    column: 1
  });
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Add cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
    
    // Add keyboard shortcut to toggle AI panel (Ctrl+Space)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      setShowAIPanel(prev => !prev);
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

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className={`${showAIPanel ? 'w-full md:w-2/3' : 'w-full'} h-full transition-all duration-300`}>
        <Editor
          height="100%"
          language={language}
          value={value}
          theme={theme}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
        <div className="absolute bottom-4 right-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
            onClick={() => setShowAIPanel(prev => !prev)}
            title="Toggle AI Assistant (Ctrl+Space)"
          >
            {showAIPanel ? '✕' : '🤖'}
          </button>
        </div>
      </div>
      
      {showAIPanel && (
        <div className="w-full md:w-1/3 h-full overflow-auto border-l border-gray-200 p-4">
          <AIAssistant
            code={value}
            language={language}
            cursorPosition={cursorPosition}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </div>
      )}
    </div>
  );
};

export default AIEnabledEditor;