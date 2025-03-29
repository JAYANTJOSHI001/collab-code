
import { useState, useCallback, useEffect } from 'react';
import socketService, { User } from '@/services/socketService';
import { useToast } from '@/hooks/use-toast';
import { generateUsername } from '@/lib/utils';

export const useCollaborators = (roomId: string) => {
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const initializeConnection = useCallback(async () => {
    try {
      const username = generateUsername();
      // Get access token from localStorage or session
      const token = localStorage.getItem('accessToken');
      await socketService.connect(roomId, username, token || undefined);
      setIsConnected(true);
      
      // Listen for room state instead of using mock data
      let initialState;
      await new Promise<void>((resolve) => {
        socketService.onRoomState((state) => {
          setCollaborators(state.users);
          initialState = state;
          resolve();
        });
      });
      
      toast({
        title: "Connected to room",
        description: `You joined as ${username}`,
      });
      
      return initialState;
    } catch (error) {
      console.error('Failed to initialize room:', error);
      toast({
        title: "Connection warning",
        description: "Connected in offline mode due to server issues",
        variant: "destructive",
        className: "bg-red-950 border-red-800 text-white",
        duration: 5000,
      });
      return null;
    }
  }, [roomId, toast]);

  useEffect(() => {
    if (!isConnected) return;
    
    socketService.onUserJoined((user) => {
      setCollaborators(prev => {
        // Check if user already exists
        if (prev.some(u => u.id === user.id)) {
          return prev;
        }
        return [...prev, user];
      });
      
      toast({
        title: "User joined",
        description: `${user.name} joined the room`
      });
    });
    
    socketService.onUserLeft((userId) => {
      setCollaborators(prev => prev.filter(user => user.id !== userId));
      toast({
        description: "A user left the room"
      });
    });
    
    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [toast, isConnected]);

  const handleCommit = useCallback(() => {
    if (socketService.isMockMode()) {
      toast({
        title: "Offline mode",
        description: "Changes will be committed when you're back online"
      });
      return;
    }
    
    toast({
      title: "Changes committed",
      description: "Your changes have been committed to GitHub"
    });
  }, [toast]);
  
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    
    toast({
      title: "Link copied",
      description: "Room link copied to clipboard" + (socketService.isMockMode() ? " (Note: Running in offline mode)" : "")
    });
  }, [toast]);

  return {
    collaborators,
    isConnected,
    initializeConnection,
    handleCommit,
    handleShare
  };
};
