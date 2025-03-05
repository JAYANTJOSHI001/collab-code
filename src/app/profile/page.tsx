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
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-6">
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
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                GitHub Profile
              </div>
              <h1 className="mt-2 text-3xl font-bold text-zinc-900">
                {profile?.name || profile?.username}
              </h1>
              <p className="mt-2 text-zinc-600">@{profile?.username}</p>
              
              {profile?.bio && (
                <p className="mt-4 text-zinc-600">{profile.bio}</p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-zinc-500">Company</h3>
                  <p className="font-medium">{profile?.company || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-zinc-500">Location</h3>
                  <p className="font-medium">{profile?.location || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-zinc-500">Email</h3>
                  <p className="font-medium">{profile?.email || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-zinc-500">Member Since</h3>
                  <p className="font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-6">
                <div>
                  <span className="text-2xl font-bold text-zinc-900">{profile?.followers}</span>
                  <p className="text-zinc-500">Followers</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-zinc-900">{profile?.following}</span>
                  <p className="text-zinc-500">Following</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-zinc-900">{profile?.public_repos}</span>
                  <p className="text-zinc-500">Repositories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 