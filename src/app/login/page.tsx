"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("github", { callbackUrl: "/" });
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white">
      <div className="p-8 max-w-md w-full bg-zinc-800 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-semibold mb-6">Welcome Back</h1>
        <p className="text-zinc-400 mb-4">Sign in to continue</p>

        <button
          onClick={handleLogin}
          className="flex items-center justify-center w-full py-3 px-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all"
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></span>
          ) : (
            <>
              <FaGithub className="mr-2 text-xl" />
              Sign in with GitHub
            </>
          )}
        </button>
      </div>
    </div>
  );
}
