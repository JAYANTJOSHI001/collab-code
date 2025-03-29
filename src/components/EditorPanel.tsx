
import { useState } from 'react';
import { FileItem } from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import ConsolePanel from '@/components/ConsolePanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface EditorPanelProps {
  currentFile: FileItem | null;
  fileContent: string;
  showConsole: boolean;
  onCodeChange: (value: string | undefined) => void;
  onToggleConsole: () => void;
}

const getLanguageFromFilename = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
  };
  
  return languageMap[extension] || 'plaintext';
};

const EditorPanel = ({ 
  currentFile, 
  fileContent, 
  showConsole, 
  onCodeChange, 
  onToggleConsole 
}: EditorPanelProps) => {
  const [offlineMode] = useState(() => {
    // This is a one-time check to see if we're in offline mode
    try {
      // @ts-expect-error - accessing the internal socket service property
      return window.socketService?.isMockMode?.() || false;
    } catch {
      return false;
    }
  });

  return (
    <div className="flex flex-col h-full">
      {currentFile ? (
        <>
          <div className="p-2 bg-gray-800 text-sm border-b border-gray-700">
            {currentFile.path}
          </div>
          {offlineMode && (
            <Alert className="bg-amber-900/20 border-amber-700/50 text-amber-200 m-2">
              <Info className="h-4 w-4 text-amber-400" />
              <AlertDescription>
                Offline mode: Your changes are saved locally but won&apos;t sync with other users until you&apos;re back online.
              </AlertDescription>
            </Alert>
          )}
          <div className={`flex-1 ${showConsole ? 'h-[calc(100%-200px)]' : 'h-full'}`}>
            <CodeEditor 
              language={getLanguageFromFilename(currentFile.name)}
              value={fileContent}
              onChange={onCodeChange}
            />
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-800 text-gray-400">
          <div className="text-center">
            <p>Select a file to edit</p>
            <p className="text-sm mt-2">or create a new file using the sidebar</p>
          </div>
        </div>
      )}
      
      {showConsole && (
        <div className="h-[200px]">
          <ConsolePanel onClose={onToggleConsole} />
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
