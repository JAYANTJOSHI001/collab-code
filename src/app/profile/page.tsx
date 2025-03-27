"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { FaArrowLeft } from "react-icons/fa";

interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  profile: Profile | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  rooms: number;
}

interface Profile{
  bio:string,
  followers: number,
  following: number,
  location : string,
  public_repos: number,
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login");
    }
  }, [status, router, session]);

  console.log("this is session::",session?.accessToken);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.accessToken){
        console.error('Access token is missing');
        return; 
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        console.log("profile:", response.data);
        setProfile(response.data);
      } catch (error: unknown) {
        // Use a type assertion with a more specific type
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };
        console.log("axiosError",axiosError);
        setError(axiosError.response?.data?.message || 'Failed to fetch profile');
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-black to-blue-950">
          <div className="text-center">
            <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-blue-200">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-black to-blue-950">
          <div className="text-center">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <p className="text-blue-200">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-950 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-300 hover:text-blue-100 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="max-w-4xl mx-auto bg-blue-950/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="md:flex items-center gap-8 mb-8">
              {profile?.avatarUrl && (
                <div className="relative h-32 w-32 mx-auto md:mx-0 mb-6 md:mb-0">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name || profile.username}
                    fill
                    className="rounded-full object-cover border-2 border-blue-500/50"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{profile?.name}</h1>
                <span className="text-blue-300">@{profile?.username}</span>
                {profile?.profile?.bio && (
                  <p className="text-blue-200/70 mt-2">{profile.profile.bio}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                <span className="text-blue-300 text-sm">Rooms</span>
                <p className="text-white font-semibold text-xl">{profile?.rooms || "0"}</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                <span className="text-blue-300 text-sm">Followers</span>
                <p className="text-white font-semibold text-xl">{profile?.profile?.followers || "0"}</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                <span className="text-blue-300 text-sm">Following</span>
                <p className="text-white font-semibold text-xl">{profile?.profile?.following || "0"}</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                <span className="text-blue-300 text-sm">Public Repos</span>
                <p className="text-white font-semibold text-xl">{profile?.profile?.public_repos || "0"}</p>
              </div>
              {profile?.profile?.location && (
                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg md:col-span-2">
                  <span className="text-blue-300 text-sm">Location</span>
                  <p className="text-white font-semibold text-xl">{profile.profile.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}