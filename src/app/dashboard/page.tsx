"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaCodeBranch, FaSpinner } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

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
  const [username, setUsername] = useState<string | null>(null);

  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.accessToken) {
      fetchRepositories();
    }
  }, [status, session, router]);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get<Repository[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/${username}/repos`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          withCredentials: true,
        }
      );
      setRepos(response.data);
      console.log(repos);
    } catch (error: any) {
      console.error("Failed to fetch repositories:", error);
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/room/create`,
        {
          name: repo.name,
          repo: repo.name,
          githubUsername: session?.user?.name,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          withCredentials: true,
        }
      );

      router.push(`/room/${response.data.id}`);
    } catch (error: any) {
      console.error("Failed to create room:", error);
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
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Your Repositories</h1>
        <p className="text-gray-400">Select a repository to start collaborating</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-black">{repo.name}</h2>
                {repo.description && (
                  <p className="mt-2 text-gray-400 text-sm">{repo.description}</p>
                )}
              </div>
              {repo.private && (
                <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">
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
  );
} 