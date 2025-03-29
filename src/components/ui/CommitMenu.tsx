"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GitCommit } from "lucide-react"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CommitMenuProps {
  repoName: string | null
  username: string
  changes: string[]
  onCommit: (message: string, files: string[]) => void
  onClose: () => void
}

const CommitMenu: React.FC<CommitMenuProps> = ({ repoName, username, changes, onCommit, onClose }) => {
  const [message, setMessage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([...changes])
  const [isCommitting, setIsCommitting] = useState(false)
  const { toast } = useToast()

  const handleCommit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a commit message",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
      return
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to commit",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
      return
    }

    setIsCommitting(true)
    try {
      toast({
        title: "Committing Changes",
        description: "Your changes are being committed...",
      })
      
      await onCommit(message, selectedFiles)
      
      toast({
        title: "Success",
        description: `Successfully committed ${selectedFiles.length} file(s)`,
      })
      
      setMessage("")
    } catch (error) {
      console.error("Commit failed:", error)
      toast({
        title: "Commit Failed",
        description: error instanceof Error ? error.message : "An error occurred while committing changes",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
    } finally {
      setIsCommitting(false)
    }
  }

  const toggleFile = (file: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(file)) {
        return prev.filter((f) => f !== file)
      } else {
        return [...prev, file]
      }
    })
  }

  const toggleAllFiles = () => {
    if (selectedFiles.length === changes.length) {
      setSelectedFiles([])
      toast({
        title: "Files Deselected",
        description: "All files have been deselected",
      })
    } else {
      setSelectedFiles([...changes])
      toast({
        title: "Files Selected",
        description: `Selected all ${changes.length} files`,
      })
    }
  }

  return (
    <div className="h-full bg-zinc-900 flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="text-sm font-medium text-zinc-200">Commit Changes</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:text-black">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-zinc-800">
        <div className="mb-4">
          <p className="text-xs text-zinc-400 mb-1">Repository</p>
          <p className="text-sm font-medium text-zinc-200">{repoName || "Unknown"}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">Author</p>
          <p className="text-sm font-medium text-zinc-200">{username || "Anonymous"}</p>
        </div>
      </div>

      <div className="p-4 border-b border-zinc-800">
        <label className="block text-xs text-zinc-400 mb-1">Commit Message</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your changes..."
          className="bg-zinc-800 border-zinc-700 text-zinc-200 resize-none"
          rows={3}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h4 className="text-xs font-medium text-zinc-400">Changed Files ({changes.length})</h4>
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedFiles.length === changes.length && changes.length > 0}
              onCheckedChange={toggleAllFiles}
              disabled={changes.length === 0}
            />
            <label htmlFor="select-all" className="text-xs text-zinc-400 cursor-pointer">
              Select All
            </label>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="p-4 space-y-2">
            {changes.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No changes to commit</p>
            ) : (
              changes.map((file) => (
                <div key={file} className="flex items-center gap-2 p-2 rounded-md bg-zinc-800/50 hover:bg-zinc-800">
                  <Checkbox
                    id={`file-${file}`}
                    checked={selectedFiles.includes(file)}
                    onCheckedChange={() => toggleFile(file)}
                  />
                  <label htmlFor={`file-${file}`} className="text-sm text-zinc-300 cursor-pointer truncate flex-1">
                    {file}
                  </label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <Button
          onClick={handleCommit}
          disabled={isCommitting || !message.trim() || selectedFiles.length === 0}
          className="w-full flex items-center gap-2"
        >
          {isCommitting ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
          ) : (
            <GitCommit className="h-4 w-4" />
          )}
          Commit Changes
        </Button>
      </div>
    </div>
  )
}

export default CommitMenu

