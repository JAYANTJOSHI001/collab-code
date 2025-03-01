"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    // If no error is present, redirect to home
    if (!error) {
      router.push("/");
    }
  }, [error, router]);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "AccessDenied":
        return "Access was denied. Please make sure you have granted the necessary permissions.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      default:
        return "An unexpected error occurred.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <FaExclamationTriangle className="text-red-500 text-5xl" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
        <p className="text-gray-300 mb-6">
          {error ? getErrorMessage(error) : "An error occurred during authentication."}
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
} 