"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { X, RotateCcw, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiffEditor } from "@monaco-editor/react"

interface CodeVersion {
  content: string
  timestamp: Date
  user?: string
}

interface CodeHistoryProps {
  versions: CodeVersion[]
  onRestoreVersion: (content: string) => void
  onClose: () => void
}

export const CodeHistory: React.FC<CodeHistoryProps> = ({ versions, onRestoreVersion, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState<CodeVersion | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "diff">("list")
  const [originalVersion, setOriginalVersion] = useState<CodeVersion | null>(versions[0] || null);
  const [modifiedVersion, setModifiedVersion] = useState<CodeVersion | null>(versions.length > 1 ? versions[1] : null);

  const handleOriginalChange = (timestamp: string) => {
    const version = versions.find(v => v.timestamp.toISOString() === timestamp);
    if (version) setOriginalVersion(version);
  };
  console.log(viewMode);

  const handleModifiedChange = (timestamp: string) => {
    const version = versions.find(v => v.timestamp.toISOString() === timestamp);
    if (version) setModifiedVersion(version);
  };

  const handleRestore = () => {
    if (selectedVersion) {
      onRestoreVersion(selectedVersion.content)
    }
  }

  return (
    <div className="h-full bg-zinc-900 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-200">Version History</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:text-black">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="list" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="list" className="flex-1" onClick={() => setViewMode("list")}>
              List View
            </TabsTrigger>
            <TabsTrigger value="diff" className="flex-1" onClick={() => setViewMode("diff")}>
              Diff View
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="flex-1 flex flex-col mt-0">
          {versions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No version history available</p>
                <p className="text-xs mt-1">Changes will be tracked as you edit</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {versions.map((version, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedVersion === version
                        ? "bg-blue-900/30 border border-blue-800/50"
                        : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-zinc-200">Version {versions.length - index}</span>
                      <span className="text-xs text-zinc-400">
                        {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    {version.user && <div className="text-xs text-zinc-400 mt-1">By: {version.user}</div>}
                    <div className="mt-2 text-xs bg-zinc-900 p-2 rounded max-h-20 overflow-hidden">
                      <pre className="text-zinc-400 whitespace-pre-wrap overflow-hidden">
                        {version.content.substring(0, 150)}
                        {version.content.length > 150 && "..."}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {selectedVersion && (
            <div className="p-4 border-t border-zinc-800">
              <Button onClick={handleRestore} className="w-full flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Restore This Version
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="diff" className="flex-1 flex flex-col mt-0">
          {versions.length < 2 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <p>Need at least two versions to show diff</p>
                <p className="text-xs mt-1">Changes will be tracked as you edit</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Original (older)</label>
                  <select 
                    className="w-full bg-zinc-800 text-zinc-200 text-sm rounded-md p-2 border border-zinc-700"
                    value={originalVersion?.timestamp.toISOString()}
                    onChange={(e) => handleOriginalChange(e.target.value)}
                  >
                    {versions.map((version, index) => (
                      <option key={`orig-${index}`} value={version.timestamp.toISOString()}>
                        Version {versions.length - index} ({formatDistanceToNow(version.timestamp, { addSuffix: true })})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Modified (newer)</label>
                  <select 
                    className="w-full bg-zinc-800 text-zinc-200 text-sm rounded-md p-2 border border-zinc-700"
                    value={modifiedVersion?.timestamp.toISOString()}
                    onChange={(e) => handleModifiedChange(e.target.value)}
                  >
                    {versions.map((version, index) => (
                      <option key={`mod-${index}`} value={version.timestamp.toISOString()}>
                        Version {versions.length - index} ({formatDistanceToNow(version.timestamp, { addSuffix: true })})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex-1 p-2">
                {originalVersion && modifiedVersion ? (
                  <DiffEditor
                    height="100%"
                    theme="vs-dark"
                    original={originalVersion.content}
                    modified={modifiedVersion.content}
                    options={{
                      readOnly: true,
                      renderSideBySide: window.innerWidth > 768,
                      fontSize: 12,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500">
                    <p>Select two different versions to compare</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {modifiedVersion && (
            <div className="p-4 border-t border-zinc-800">
              <Button onClick={() => onRestoreVersion(modifiedVersion.content)} className="w-full flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Restore Modified Version
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

