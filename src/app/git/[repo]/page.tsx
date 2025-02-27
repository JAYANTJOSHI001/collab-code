"use client";
import { useRouter } from "next/navigation";

export default function RepoPage({ params }: { params: { repo: string } }) {
  const router = useRouter();
  const repoName = params.repo;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">{repoName}</h1>
      <p className="text-gray-400">Collaborate in real-time with your team.</p>

      <button
        onClick={() => router.push(`/git/${repoName}/collab`)}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
      >
        Edit Code
      </button>

      <button
        onClick={() => router.push("/git")}
        className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg"
      >
        Back to Repos
      </button>
    </div>
  );
}
