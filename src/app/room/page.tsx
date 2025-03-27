'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, Users, GitBranch, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import axios from 'axios';

interface Room {
  _id: string;
  name: string;
  repo: string;
  createdBy: string;
  users: Array<{
    userId: string;
    username: string;
    joinedAt: Date;
  }>;
  createdAt: string;
  lastActivity: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchRooms = async () => {
      try {
        // Updated to use axios and the correct API endpoint
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          withCredentials: true
        });
        
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.accessToken) {
      fetchRooms();
    }
  }, [status, session, router]);

  const handleRoomClick = (roomId: string) => {
    window.location.href = `/room/${roomId}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-black via-blue-950 to-black">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-blue-200">Loading your rooms...</p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-6">
             <div className="flex flex-row justify-between items-center">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                  >
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                    Your Rooms
                  </h1>
                  <p className="text-blue-200/80 mt-2">Join a room to collaborate on code</p>
                </motion.header>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    Dashboard
                  </Button>
                </motion.div>
            </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, index) => (
              <motion.div
                key={room._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
                onClick={() => handleRoomClick(room._id)}
              >
                <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl group-hover:bg-blue-500/10 transition-all" />
                <div className="relative bg-blue-950/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">{room.name}</h3>
                      <Badge variant="outline" className="bg-blue-500/10 text-white">
                        {room.users.length} <Users className="ml-1 h-3 w-3" />
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-blue-200/70 space-x-2">
                      <GitBranch className="h-4 w-4" />
                      <span>{room.repo}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-blue-200/70 space-x-4">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {formatDistanceToNow(new Date(room.lastActivity), { addSuffix: true })}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {rooms.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-16"
            >
              <div className="p-8 rounded-xl bg-blue-950/20 backdrop-blur-sm border border-white/10 max-w-md mx-auto">
                <p className="text-blue-200">No rooms available. Create a new room from the dashboard to get started!</p>
                <Button 
                  className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}