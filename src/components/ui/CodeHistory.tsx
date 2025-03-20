import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';

interface CodeVersion {
  content: string;
  timestamp: Date;
  user?: string;
}

interface CodeHistoryProps {
  versions: CodeVersion[];
  onRestoreVersion: (content: string) => void;
  onClose: () => void;
}

export function CodeHistory({ versions, onRestoreVersion, onClose }: CodeHistoryProps) {
  return (
    <div className="fixed right-0 top-0 h-screen w-100 bg-zinc-900 border-l border-zinc-800 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Code History</h3>
        <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-black">
          ✕
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        {versions.length === 0 ? (
          <div className="text-zinc-500 text-center py-4">No history available</div>
        ) : (
          versions.map((version, index) => (
            <div
              key={version.timestamp.toISOString()}
              className="mb-4 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">
                  {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                </span>
                {version.user && (
                  <span className="text-sm text-zinc-500">{version.user}</span>
                )}
              </div>
              <div className="text-sm text-zinc-300 mb-2 overflow-hidden text-ellipsis">
                {version.content.slice(0, 100)}...
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestoreVersion(version.content)}
                className="w-full"
              >
                Restore this version
              </Button>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
} 