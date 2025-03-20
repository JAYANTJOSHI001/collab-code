"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaCodeBranch, FaSpinner } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

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
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-black via-blue-950 to-black">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-blue-200">Loading your repositories...</p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
              Your Repositories
            </h1>
            <p className="text-blue-200/80 mt-2">Select a repository to start collaborating</p>
          </motion.header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl group-hover:bg-blue-500/10 transition-all" />
                <div className="relative bg-blue-950/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {repo.name}
                      </h2>
                      {repo.description && (
                        <p className="mt-2 text-blue-200/70 text-sm line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      repo.private 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-blue-500/20 text-blue-200'
                    }`}>
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startCollaboration(repo)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25"
                  >
                    <FaCodeBranch className="text-blue-200" />
                    Start Collaboration
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}