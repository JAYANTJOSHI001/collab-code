"use client";

import { useEffect, useState, useCallback } from "react"; 
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaCodeBranch } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";


type ExtendedUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  login?: string | null; // Add login field
};
interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  url: string;
  defaultBranch: string;
}

// Define a proper error interface
interface ApiError extends Error {
  response?: {
    data?: unknown;
    status?: number;
    headers?: Record<string, string>;
  };
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

// Add Room interface
interface Room {
  _id: string;
  name: string;
  repo: string;
  createdBy: string;
  users: Array<{
    userId: string;
    username: string;
    joinedAt: Date;
  }>;
  createdAt: string;
  lastActivity: string;
}

// Add cache interfaces
interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Add cache duration constants
const CACHE_DURATION = {
  REPOS: 5 * 60 * 1000, // 5 minutes
  ROOMS: 30 * 1000,     // 30 seconds
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const username = (session?.user as ExtendedUser)?.login ?? "Guest";

  // Fetch repositories callback
    // Add last fetch timestamps
    const [lastRepoFetch, setLastRepoFetch] = useState<number>(0);
    const [lastRoomFetch, setLastRoomFetch] = useState<number>(0);
  
    // Cache management functions
    const getCachedData = useCallback(<T,>(key: string): CacheData<T> | null => {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    }, []);
  
    const setCachedData = useCallback(<T,>(key: string, data: T) => {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    }, []);
  
    // Modified fetch repositories function
    const fetchRepositories = useCallback(async () => {
      const now = Date.now();
      const cachedRepos = getCachedData<Repository[]>('repos');
      
      // Return cached data if it's still valid
      if (cachedRepos && (now - cachedRepos.timestamp) < CACHE_DURATION.REPOS) {
        setRepos(cachedRepos.data);
        return;
      }
  
      try {
        const response = await axios.get<Repository[]>(`https://api.github.com/users/${username}/repos`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          }
        });
        
        setRepos(response.data);
        setCachedData('repos', response.data);
        setLastRepoFetch(now);
      } catch (error) {
        const apiError = error as ApiError;
        console.error("Failed to fetch repositories - Full error:", apiError);
        console.error("Error response data:", apiError.response?.data);
        console.error("Error response status:", apiError.response?.status);
        console.error("Error response headers:", apiError.response?.headers);
        if (apiError.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please sign in again to continue",
            variant: "destructive",
            className: "bg-red-950 border-red-800 text-white",
            duration: 5000,
          });
          router.push("/login");
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch repositories",
            variant: "destructive",
            className: "bg-red-950 border-red-800 text-white",
            duration: 5000,
          });
        }
      } finally {
        setLoading(false);
      }
    }, [username, session, toast, router, getCachedData, setCachedData]);
  
    // Modified fetch rooms function
    const fetchRooms = useCallback(async () => {
      const now = Date.now();
      const cachedRooms = getCachedData<Room[]>('rooms');
      
      // Return cached data if it's still valid
      if (cachedRooms && (now - cachedRooms.timestamp) < CACHE_DURATION.ROOMS) {
        setRooms(cachedRooms.data);
        return;
      }
  
      try {
        const response = await axios.get<Room[]>(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          withCredentials: true
        });
        
        setRooms(response.data);
        setCachedData('rooms', response.data);
        setLastRoomFetch(now);
      } catch (error) {
        const apiError = error as ApiError;
        console.error("Failed to fetch rooms - Full error:", apiError);
        console.error("Error response data:", apiError.response?.data);
        console.error("Error response status:", apiError.response?.status);
        console.error("Error response headers:", apiError.response?.headers);
        if (apiError.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please sign in again to continue",
            variant: "destructive",
            className: "bg-red-950 border-red-800 text-white",
            duration: 5000,
          });
          router.push("/login");
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch rooms",
            variant: "destructive",
            className: "bg-red-950 border-red-800 text-white",
            duration: 5000,
          });
        }
      } finally {
        setLoading(false);
      }
    }, [session, toast, getCachedData, setCachedData, router]); // Added router to dependency array
  
    // Modified useEffect for controlled polling
    useEffect(() => {
      if (status === "unauthenticated") {
        window.location.href = "/login";
        return;
      }
  
      if (status === "authenticated" && session?.accessToken) {
        // Initial fetch
        fetchRepositories();
        fetchRooms();
  
        // Set up polling intervals
        const repoInterval = setInterval(() => {
          if (Date.now() - lastRepoFetch >= CACHE_DURATION.REPOS) {
            fetchRepositories();
          }
        }, CACHE_DURATION.REPOS);
  
        const roomInterval = setInterval(() => {
          if (Date.now() - lastRoomFetch >= CACHE_DURATION.ROOMS) {
            fetchRooms();
          }
        }, CACHE_DURATION.ROOMS);
  
        // Cleanup intervals
        return () => {
          clearInterval(repoInterval);
          clearInterval(roomInterval);
        };
      }
    }, [status, session, router, fetchRepositories, fetchRooms, lastRepoFetch, lastRoomFetch]);

  const startCollaboration = async (repo: Repository) => {
    try {
      // Add loading state
      setLoading(true);

      console.log("Starting collaboration with session:", {
        user: session?.user,
        accessToken: session?.accessToken ? session?.accessToken.substring(0, 10) + '...' : 'missing',
        tokenType: typeof session?.accessToken,
        fullSession: JSON.stringify(session)
      });
      
      const requestData = {
        name: repo.name,
        repo: repo.name,
        githubUsername: (session?.user as ExtendedUser)?.login ?? "Guest",
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

      // Use window.location instead of router.push to avoid re-render issues
      window.location.href = `/room/${response.data._id}`;
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to create room - Full error:", {
        message: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data,
        headers: apiError.response?.headers,
        config: {
          url: apiError.config?.url,
          method: apiError.config?.method,
          headers: apiError.config?.headers
        }
      });
            
      if (apiError.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
        window.location.href = "/login";
      } else {
        toast({
          title: "Error",
          description: "Failed to create collaboration room",
          variant: "destructive",
          className: "bg-red-950 border-red-800 text-white",
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
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
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-row justify-between items-center mb-12">
              <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                  Your Repositories
                </h1>
                <p className="text-blue-200/80 mt-2">Select a repository to start collaborating</p>
              </motion.header>
              {rooms && rooms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => window.location.href = "/room"}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    My Rooms
                  </Button>
                </motion.div>
              )}
            </div>
            {/* Repositories section */}
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
      </div>
    </>
  );
}