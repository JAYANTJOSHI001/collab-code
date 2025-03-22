"use client";

import { useRouter } from "next/navigation";
import { FaClipboardCheck, FaCode, FaGitAlt } from "react-icons/fa";

interface SideProps {
  onCommitClick: () => void;
  isCommitView: boolean;
  onGitClick: () => void;
  isGitView: boolean;
}

export function Side({ onCommitClick, isCommitView, onGitClick, isGitView }: SideProps) {
  const router = useRouter();

  return (
    <div className="w-14 bg-black border-zinc-700 flex flex-col items-center py-4">
      <ul className="space-y-8">
        <li>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white"
          >
            <FaCode size={20} />
          </button>
        </li>
        <li>
          <button
            onClick={onCommitClick}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isCommitView
                ? "bg-blue-500 text-white hover:bg-blue-400"
                : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <FaClipboardCheck size={20} />
          </button>
        </li>
        <li>
          <button
            onClick={onGitClick}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isGitView
                ? "bg-blue-500 text-white hover:bg-blue-400"
                : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <FaGitAlt size={20} />
          </button>
        </li>
      </ul>
    </div>
  );
}
