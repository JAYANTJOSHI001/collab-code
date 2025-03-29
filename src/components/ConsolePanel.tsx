
import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConsolePanelProps {
  onClose: () => void;
}

interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: Date;
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Function to capture console logs
  useEffect(() => {
    // Store original console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args);
      setLogs(prev => [
        ...prev,
        {
          type: 'log',
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: new Date()
        }
      ]);
    };
    
    console.error = (...args) => {
      originalConsole.error(...args);
      setLogs(prev => [
        ...prev,
        {
          type: 'error',
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: new Date()
        }
      ]);
    };
    
    console.warn = (...args) => {
      originalConsole.warn(...args);
      setLogs(prev => [
        ...prev,
        {
          type: 'warn',
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: new Date()
        }
      ]);
    };
    
    console.info = (...args) => {
      originalConsole.info(...args);
      setLogs(prev => [
        ...prev,
        {
          type: 'info',
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: new Date()
        }
      ]);
    };
    
    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    };
  }, []);
  
  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs]);
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  const downloadLogs = () => {
    const logContent = logs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] ${log.content}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col h-full border-t border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between p-2 border-b border-gray-800">
        <div className="text-sm font-medium">Console</div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={clearLogs} title="Clear console">
            <RotateCcw size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadLogs} title="Download logs">
            <Download size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close console">
            <X size={14} />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 font-mono text-sm" ref={scrollAreaRef}>
          {logs.length === 0 ? (
            <div className="text-gray-500 italic p-2">No logs to display</div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-1 rounded ${
                  log.type === 'error' ? 'text-red-400 bg-red-950/30' : 
                  log.type === 'warn' ? 'text-yellow-400 bg-yellow-950/30' : 
                  log.type === 'info' ? 'text-blue-400 bg-blue-950/30' : 
                  'text-gray-300'
                }`}
              >
                <span className="text-xs text-gray-500 mr-2">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <pre className="whitespace-pre-wrap break-words">{log.content}</pre>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConsolePanel;
