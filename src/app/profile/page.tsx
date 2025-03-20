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
  profile: object | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setProfile(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch profile');
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
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 mx-auto"></div>
            <p className="mt-4 text-zinc-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-zinc-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
        <div className="max-w-7xl mx-auto border-2 border-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex-col md:items-left">
            <div className="md:flex gap-6 p-6">
              {profile?.avatarUrl && (
                <div className="relative h-48 w-48 mx-auto">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name || profile.username}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col items-left justify-center">
                <h1 className="text-3xl font-bold">{profile?.name}</h1>
                <span className="text-zinc-400">@{profile?.username}</span>
                <p className="text-zinc-400">{profile?.profile?.bio}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 rounded-lg">
              <div className="flex flex-col items-left justify-center bg-white p-4 rounded-lg">
                <span className="text-black">Rooms</span>
                <p className="text-black font-semibold">{profile?.rooms?.length || "0"}</p>
              </div>
              <div className="flex flex-col items-left justify-center bg-white p-4 rounded-lg">
                <span className="text-black">Followers</span>
                <p className="text-black font-semibold">{profile?.profile?.followers || "Not Available"}</p>
              </div>
              <div className="flex flex-col items-left justify-center bg-white p-4 rounded-lg">
                <span className="text-black">Following</span>
                <p className="text-black font-semibold">{profile?.profile?.following || "Not Available"}</p>
              </div>
              <div className="flex flex-col items-left justify-center bg-white p-4 rounded-lg">
                <span className="text-black">Public Repos</span>
                <p className="text-black font-semibold">{profile?.profile?.public_repos || "Not Available"}</p>
              </div>
              <div className="flex flex-col items-left justify-center bg-white p-4 rounded-lg">
                <span className="text-black">Location</span>
                <p className="text-black font-semibold">{profile?.profile?.location || "Not Available"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 