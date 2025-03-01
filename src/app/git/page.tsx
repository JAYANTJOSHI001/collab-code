"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaPlus, FaShare } from "react-icons/fa";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stars: number;
  forks: number;
}

interface Room {
  id: string;
  name: string;
  createdAt: Date;
  repo?: string;
  createdBy?: string;
  username?: string;
  expiresAt?: Date;
  lastActivity?: Date;
}

interface UserDetails {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
}

export default function GitHubRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user details first
        const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setUserDetails(userResponse.data);

        // Then fetch repositories
        const reposResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/repos`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setRepos(reposResponse.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

  const handleCreateRepoRoom = async (repo: string) => {
    if (!userDetails?.username) return;
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
        name: repo,
        repo: repo,
        createdBy: userDetails.username,
        username: userDetails.username
      });
      router.push(`/git/${repo}/collab`);
    } catch (error) {
      console.error("Failed to create repo room:", error);
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {userDetails?.name || userDetails?.username || 'Developer'}!
        </h1>
        <p className="text-gray-600">
          You have {repos.length} repositories available for collaboration
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.map((repo) => (
          <div
            key={repo.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{repo.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {repo.description || 'No description available'}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  ⭐ {repo.stars || 0}
                </span>
                <span className="text-sm text-gray-500">
                  🔄 {repo.forks || 0}
                </span>
              </div>
              <button
                onClick={() => handleCreateRepoRoom(repo.name)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Collaborate
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {searchTerm
              ? 'No repositories found matching your search'
              : 'No repositories available'}
          </p>
        </div>
      )}
    </div>
  );
}