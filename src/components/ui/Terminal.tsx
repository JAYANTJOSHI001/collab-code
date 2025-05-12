import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from 'next-auth/react';

interface TerminalProps {
  roomId: string;
  selectedFile: string | null;
  onClose: () => void;
}

export function Terminal({ roomId, selectedFile, onClose }: TerminalProps) {
  const { data: session } = useSession();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [fileLanguage, setFileLanguage] = useState<string>('');

  console.log(commandOutput);
  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'Fira Code', monospace",
      theme: {
        background: '#1e1e1e',
        foreground: '#f8f8f8',
        cursor: '#f8f8f8',
        black: '#1e1e1e',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#d7ba7d',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#4ec9b0',
        white: '#d4d4d4',
        brightBlack: '#808080',
        brightRed: '#f44747',
        brightGreen: '#6a9955',
        brightYellow: '#d7ba7d',
        brightBlue: '#569cd6',
        brightMagenta: '#c586c0',
        brightCyan: '#4ec9b0',
        brightWhite: '#d4d4d4'
      }
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(searchAddon);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Store references
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Initial welcome message
    term.writeln('\x1b[1;34m=== Collab Terminal ===\x1b[0m');
    term.writeln('\x1b[90mSelect a file and click Run to execute it.\x1b[0m');
    term.writeln('');

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // Update file language when selected file changes
  useEffect(() => {
    if (selectedFile) {
      const extension = selectedFile.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          setFileLanguage('javascript');
          break;
        case 'py':
          setFileLanguage('python');
          break;
        case 'java':
          setFileLanguage('java');
          break;
        default:
          setFileLanguage('');
      }
    } else {
      setFileLanguage('');
    }
  }, [selectedFile]);

  const runFile = async () => {
    if (!selectedFile || isRunning) return;

    try {
      setIsRunning(true);
      if (xtermRef.current) {
        xtermRef.current.clear();
        xtermRef.current.writeln(`\x1b[1;32m> Running ${selectedFile}...\x1b[0m\n`);
      }

      const filePath = selectedFile;      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terminal/run?roomId=${roomId}&file=${encodeURIComponent(filePath)}`, {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      // Get the response body as a readable stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response stream');
      }

      // Process the stream
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Handle any remaining data in the buffer
              if (buffer.trim()) {
                processEventData(buffer);
              }
              if (xtermRef.current) {
                xtermRef.current.writeln('\n\x1b[1;34mExecution completed.\x1b[0m');
              }
              setIsRunning(false);
              break;
            }
            
            // Decode the chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete events in the buffer
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep the last incomplete event in the buffer
            
            for (const event of events) {
              if (event.trim()) {
                processEventData(event);
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          if (xtermRef.current) {
            xtermRef.current.writeln(`\n\x1b[1;31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`);
          }
          setIsRunning(false);
        }
      };

      // Helper function to process SSE event data
      const processEventData = (eventText: string) => {
        const lines = eventText.split('\n');
        let eventType = 'message';
        let data = '';
        
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            data = line.substring(5).trim();
          }
        }
        
        if (eventType === 'close') {
          // Handle close event
          if (xtermRef.current) {
            xtermRef.current.writeln('\n\x1b[1;34mExecution completed.\x1b[0m');
          }
          setIsRunning(false);
          return;
        }
        
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.output) {
              if (xtermRef.current) {
                xtermRef.current.write(parsedData.output);
              }
              setCommandOutput(prev => prev + parsedData.output);
            }
          } catch (error) {
            console.error('Error parsing event data:', error, data);
          }
        }
      };

      // Start processing the stream
      processStream();
    } catch (error) {
      console.error('Error running file:', error);
      if (xtermRef.current) {
        xtermRef.current.writeln(`\n\x1b[1;31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`);
      }
      setIsRunning(false);
    }
  };

  const stopExecution = async () => {
    try {
      // Update to match the backend API endpoint format
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terminal/stop?roomId=${roomId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop execution');
      }
      
      if (xtermRef.current) {
        xtermRef.current.writeln('\n\x1b[1;33mExecution stopped.\x1b[0m');
      }
    } catch (error) {
      console.error('Error stopping execution:', error);
      if (xtermRef.current) {
        xtermRef.current.writeln(`\n\x1b[1;31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    // Allow time for the resize animation before fitting the terminal
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 300);
  };

  return (
    <div className={`flex flex-col border-l border-zinc-800 bg-zinc-900 transition-all duration-300 ${
      isMaximized ? 'fixed inset-0 z-50 w-full h-full' : 'w-full h-full'
    }`}>
      <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-zinc-200">Terminal</h3>
          {selectedFile && (
            <span className="ml-2 text-xs text-zinc-400">
              {selectedFile} {fileLanguage && `(${fileLanguage})`}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={runFile}
                  disabled={!selectedFile || isRunning}
                >
                  <Play className="h-4 w-4 text-green-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run File</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={stopExecution}
                  disabled={!isRunning}
                >
                  <StopCircle className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stop Execution</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleMaximize}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-4 w-4 text-white hover:text-black" />
                  ) : (
                    <Maximize2 className="h-4 w-4 text-white hover:text-black" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMaximized ? 'Minimize' : 'Maximize'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:text-black"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="flex-1 overflow-hidden p-1 bg-[#1e1e1e]"
      />
    </div>
  );
}