"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="bg-zinc-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button 
                onClick={() => router.push('/git')}
                className="text-xl font-bold text-white hover:text-gray-200 transition-colors"
              >
                Collab
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            {session?.user?.image ? (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-medium text-white">
                  {session.user.name}
                </span>
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={session?.user?.image || ''}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ) : (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <FaUser className="h-5 w-5" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 