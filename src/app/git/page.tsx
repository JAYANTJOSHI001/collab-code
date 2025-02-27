"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
}

export default function GitHubRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const username = "JAYANTJOSHI001"; // Change this to your GitHub username
        const response = await axios.get(`https://api.github.com/users/${username}/repos`);
        setRepos(response.data);
      } catch (err) {
        setError("Failed to load repositories.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">GitHub Repositories</h1>

      {loading && <p className="text-center">Loading repositories...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <div key={repo.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{repo.name}</h2>
            <p className="text-gray-400 text-sm mb-3">
              {repo.description ? repo.description : "No description available"}
            </p>
            <p className="text-gray-300 text-sm mb-3">
              Language: <span className="font-medium">{repo.language || "Unknown"}</span>
            </p>
            <a
              href={`/git/${repo.name}`}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all"
            >
              View Code
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
