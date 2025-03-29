"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { GitBranch, GitPullRequest, X } from "lucide-react"

interface GitOperationsProps {
  roomId: string
  onClose: () => void
}

interface Branch {
  name: string
  commit: {
    sha: string
    message: string
  }
}

interface PullRequest {
  id: number
  title: string
  state: string
  url: string
  created_at: string
}

export const GitOperations: React.FC<GitOperationsProps> = ({ roomId, onClose }) => {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [branches, setBranches] = useState<Branch[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [currentBranch, setCurrentBranch] = useState<string>("")
  const [newBranchName, setNewBranchName] = useState<string>("")
  const [prTitle, setPrTitle] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null)

  // Fetch room data and repository information
  
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.createdBy && data.repo) {
            setRepoInfo({
              owner: data.createdBy,
              repo: data.repo,
            })

            // Fetch branches and PRs
            await fetchBranches(data.createdBy, data.repo)
            await fetchPullRequests(data.createdBy, data.repo)
            
            toast({
              title: "Repository Loaded",
              description: `Successfully loaded ${data.createdBy}/${data.repo}`,
            })
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch room data");
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error)
        toast({
          title: "Error",
          description: "Failed to load repository information",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchRoomData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, session?.accessToken, toast])
  

  // Fetch branches
  const fetchBranches = async (owner: string, repo: string) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBranches(data)

        // Find default branch (usually main or master)
        const defaultBranch = data.find((branch: Branch) => branch.name === "main" || branch.name === "master")
        if (defaultBranch) {
          setCurrentBranch(defaultBranch.name)
        } else if (data.length > 0) {
          setCurrentBranch(data[0].name)
        }
        
        toast({
          title: "Branches Loaded",
          description: `Successfully loaded ${data.length} branches`,
        })
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch branches");
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch branches",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
    }
  }

  // Fetch pull requests
  const fetchPullRequests = async (owner: string, repo: string) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPullRequests(data)
        
        toast({
          title: "Pull Requests Loaded",
          description: `Successfully loaded ${data.length} pull requests`,
        })
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch pull requests");
      }
    } catch (error) {
      console.error("Failed to fetch pull requests:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch pull requests",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
    }
  }

  // Create a new branch
  const createBranch = async () => {
    if (!newBranchName.trim() || !repoInfo) return

    try {
      setIsLoading(true)
      toast({
        title: "Creating Branch",
        description: `Creating branch "${newBranchName}"...`,
      })

      // First try to create the branch through our backend API
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}/branch/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          branchName: newBranchName,
          baseBranch: currentBranch
        }),
      })

      if (backendResponse.ok) {
        toast({
          title: "Branch Created",
          description: `Branch "${newBranchName}" created successfully`,
          variant: "default",
        })

        // Refresh branches
        await fetchBranches(repoInfo.owner, repoInfo.repo)
        setNewBranchName("")
        return
      }

      // If backend API fails, try direct GitHub API
      // Get the SHA of the current branch
      const branchResponse = await fetch(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/branches/${currentBranch}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      )

      if (!branchResponse.ok) {
        const errorData = await branchResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get current branch information");
      }

      const branchData = await branchResponse.json()
      const sha = branchData.commit.sha

      // Create the new branch
      const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranchName}`,
          sha,
        }),
      })

      if (response.ok) {
        toast({
          title: "Branch Created",
          description: `Branch "${newBranchName}" created successfully`,
          variant: "default",
        })

        // Refresh branches
        await fetchBranches(repoInfo.owner, repoInfo.repo)
        setNewBranchName("")
      } else {
        const error = await response.json()
        
        // Handle specific GitHub error for permission issues
        if (error.message && error.message.includes("Resource not accessible by integration")) {
          throw new Error(
            "Insufficient permissions to create branch. Please contact the repository owner to grant you write access or use GitHub Desktop to create branches."
          )
        } else if (error.message && error.message.includes("Reference already exists")) {
          throw new Error(`Branch "${newBranchName}" already exists. Please choose a different name.`)
        } else {
          throw new Error(error.message || "Failed to create branch")
        }
      }
    } catch (error) {
      console.error("Failed to create branch:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create branch",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
      
      // Add a helpful suggestion toast
      if (error instanceof Error && error.message.includes("Insufficient permissions")) {
        setTimeout(() => {
          toast({
            title: "Suggestion",
            description: "You can create branches directly on GitHub.com or using GitHub Desktop instead.",
            duration: 8000,
          })
        }, 1000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Create a pull request
  const createPullRequest = async () => {
    if (!prTitle.trim() || !repoInfo || currentBranch === "main" || currentBranch === "master") return

    try {
      setIsLoading(true)
      toast({
        title: "Creating Pull Request",
        description: `Creating PR "${prTitle}"...`,
      })

      const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/pulls`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          title: prTitle,
          head: currentBranch,
          base: "main",
          body: `Pull request created from Collab Project room ${roomId}`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Pull request created:", data);
        toast({
          title: "Pull Request Created",
          description: `PR "${prTitle}" created successfully`,
          variant: "default",
        })

        // Refresh pull requests
        await fetchPullRequests(repoInfo.owner, repoInfo.repo)
        setPrTitle("")
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to create pull request")
      }
    } catch (error) {
      console.error("Failed to create pull request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create pull request",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Switch branch
  const switchBranch = async (branchName: string) => {
    if (!repoInfo || branchName === currentBranch) return

    try {
      setIsLoading(true)
      toast({
        title: "Switching Branch",
        description: `Switching to branch "${branchName}"...`,
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}/branch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          branch: branchName,
        }),
      })

      if (response.ok) {
        setCurrentBranch(branchName)
        toast({
          title: "Branch Switched",
          description: `Switched to branch "${branchName}"`,
          variant: "default",
        })

        // Reload the page to refresh files
        window.location.reload()
      } else {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || "Failed to switch branch")
      }
    } catch (error) {
      console.error("Failed to switch branch:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to switch branch",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full bg-zinc-900 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-200">Git Operations</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:text-black">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Current Branch */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2">Current Branch</h4>
            <div className="p-3 rounded-md bg-zinc-800 border border-zinc-700 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-200">{currentBranch || "Loading..."}</span>
            </div>
          </div>

          {/* Branches */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2">Branches</h4>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-zinc-500 border-t-zinc-200 rounded-full mx-auto"></div>
                <p className="text-xs text-zinc-500 mt-2">Loading branches...</p>
              </div>
            ) : branches.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No branches found</p>
            ) : (
              <div className="space-y-2">
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className={`p-3 rounded-md border flex items-center justify-between cursor-pointer ${
                      branch.name === currentBranch
                        ? "bg-blue-900/20 border-blue-800/30 text-blue-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                    }`}
                    onClick={() => switchBranch(branch.name)}
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <span className="text-sm">{branch.name}</span>
                    </div>
                    {branch.name === currentBranch && (
                      <span className="text-xs bg-blue-900/40 px-2 py-1 rounded-full">Current</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Branch */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2">Create New Branch</h4>
            <div className="space-y-2">
              <Input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="feature/new-branch-name"
                className="bg-zinc-800 border-zinc-700 text-zinc-200"
              />
              <Button
                onClick={createBranch}
                disabled={isLoading || !newBranchName.trim()}
                className="w-full flex items-center gap-2"
              >
                <GitBranch className="h-4 w-4" />
                Create Branch
              </Button>
            </div>
          </div>

          {/* Pull Requests */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2">Pull Requests</h4>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-zinc-500 border-t-zinc-200 rounded-full mx-auto"></div>
                <p className="text-xs text-zinc-500 mt-2">Loading pull requests...</p>
              </div>
            ) : pullRequests.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No pull requests found</p>
            ) : (
              <div className="space-y-2">
                {pullRequests.map((pr) => (
                  <a
                    key={pr.id}
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-between hover:bg-zinc-700 transition-colors block"
                  >
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-200 truncate">{pr.title}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        pr.state === "open" ? "bg-green-900/30 text-green-400" : "bg-purple-900/30 text-purple-400"
                      }`}
                    >
                      {pr.state}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Create Pull Request */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2">Create Pull Request</h4>
            <div className="space-y-2">
              <Input
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                placeholder="Pull request title"
                className="bg-zinc-800 border-zinc-700 text-zinc-200"
                disabled={currentBranch === "main" || currentBranch === "master"}
              />
              <Button
                onClick={createPullRequest}
                disabled={isLoading || !prTitle.trim() || currentBranch === "main" || currentBranch === "master"}
                className="w-full flex items-center gap-2"
              >
                <GitPullRequest className="h-4 w-4" />
                Create Pull Request
              </Button>
              {(currentBranch === "main" || currentBranch === "master") && (
                <p className="text-xs text-amber-400 mt-1">
                  Cannot create a PR from the main branch. Switch to a feature branch first.
                </p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

