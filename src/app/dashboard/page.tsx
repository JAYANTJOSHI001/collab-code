"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaCodeBranch, FaSpinner } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  url: string;
  defaultBranch: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const username = session?.user?.login;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.accessToken) {
      fetchRepositories();
    }
  }, [status, session, router]);

  // console.log("user:", session?.user);
  const fetchRepositories = async () => {
    try {
      console.log("Fetching repositories for user:", username);
      console.log("Session state:", {
        isAuthenticated: status === "authenticated",
        accessToken: session?.accessToken ? "present" : "missing",
        user: session?.user
      });

      const response = await axios.get<Repository[]>(`https://api.github.com/users/${username}/repos`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        }
      });
      console.log("Repository fetch successful, count:", response.data.length);
      setRepos(response.data);
    } catch (error: any) {
      console.error("Failed to fetch repositories - Full error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch repositories",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const startCollaboration = async (repo: Repository) => {
    try {
      console.log("Starting collaboration with session:", {
        user: session?.user,
        accessToken: session?.accessToken ? session?.accessToken.substring(0, 10) + '...' : 'missing',
        tokenType: typeof session?.accessToken,
        fullSession: JSON.stringify(session)
      });
      
      const requestData = {
        name: repo.name,
        repo: repo.name,
        githubUsername: session?.user?.login,
      };
      console.log("Making room creation request with data:", requestData);

      // Use the same Bearer token format as the GitHub API request
      const headers = {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json',
      };
      console.log("Request headers:", {
        ...headers,
        Authorization: headers.Authorization.substring(0, 20) + '...'
      });

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/room/create`;
      console.log("Making request to:", apiUrl, "with credentials:", true);

      const response = await axios.post(
        apiUrl,
        requestData,
        {
          headers,
          withCredentials: true
        }
      );
      console.log("Room creation successful:", response.data);

      router.push(`/room/${response.data._id}`);
    } catch (error: any) {
      console.error("Failed to create room - Full error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        toast({
          title: "Error",
          description: "Failed to create collaboration room",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-200 mx-auto"></div>
            <p className="mt-4 text-gray-200">Loading your repositories...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Your Repositories</h1>
            <p className="text-zinc-400">Select a repository to start collaborating</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{repo.name}</h2>
                    {repo.description && (
                      <p className="mt-2 text-zinc-400 text-sm">{repo.description}</p>
                    )}
                  </div>
                  {repo.private && (
                    <span className="bg-zinc-700 text-xs px-2 py-1 rounded text-zinc-300">
                      Private
                    </span>
                  )}
                </div>

                <button
                  onClick={() => startCollaboration(repo)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors"
                >
                  <FaCodeBranch />
                  Start Collaboration
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 