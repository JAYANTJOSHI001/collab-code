"use client";

import { useToast } from "@/hooks/use-toast";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.variant === "destructive"
              ? "bg-red-500/10 border border-red-500"
              : "bg-green-500/10 border border-green-500"
          }`}
          role="alert"
        >
          {toast.variant === "destructive" ? (
            <FaExclamationCircle className="text-red-500 text-xl" />
          ) : (
            <FaCheckCircle className="text-green-500 text-xl" />
          )}
          <div>
            <p className="font-medium text-white">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-zinc-300">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              // Close toast
            }}
            className="ml-4 text-zinc-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
} 