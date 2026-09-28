import { User } from "@/types/room";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceChat } from "@/components/VoiceChat";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";

interface CollaboratorsListProps {
  users?: User[];
  currentFile?: string | null;
  roomId?: string;
}

export function CollaboratorsList({ users = [], currentFile, roomId }: CollaboratorsListProps) {
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const { data: session } = useSession();
  
  // Create a default user object from session data
  const socketUser = {
    id: session?.user?.id || 'anonymous',
    name: session?.user?.name || undefined,
    email: session?.user?.email || undefined,
    image: session?.user?.image || undefined
  };
  
  // Pass both roomId and user to useSocket
  const { socket } = useSocket({ 
    roomId: roomId || "", 
    user: socketUser 
  });
  
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    console.log("Active users:", users);
    console.log("Current file:", currentFile);
  }, [users]);

  const toggleVoiceChat = () => {
    setShowVoiceChat(!showVoiceChat);
  };

  return (
    <div className="p-4 bg-zinc-900 border-l border-zinc-800 w-64 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-zinc-300">Active Collaborators</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleVoiceChat}
          className={showVoiceChat ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {showVoiceChat ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
      </div>
      
      {showVoiceChat && roomId && session?.user?.id && (
        <div className="mb-4 p-3 bg-zinc-800 rounded-md">
          <VoiceChat 
            socket={socket} 
            roomId={roomId} 
            userId={session.user.id} 
            users={users.map(user => ({ 
              id: user.id, 
              name: user.name || user.email || 'Anonymous', 
              color: user.color 
            }))} 
          />
        </div>
      )}
      
      <div className="space-y-3 flex-1 overflow-y-auto">
        {users?.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.email ? `https://www.gravatar.com/avatar/${Buffer.from(user.email).toString('hex')}?d=identicon` : undefined} 
                />
                <AvatarFallback>
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span 
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900"
                style={{ backgroundColor: user.color }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-zinc-200 truncate">
                {user.name || user.email || 'Anonymous'}
              </span>
              {user.currentFile && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-500 truncate">
                    {user.isTyping ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">typing...</span>
                      </span>
                    ) : (
                      <>Editing: {user.currentFile}</>
                    )}
                  </span>
                  {user.cursorPosition && (
                    <span className="text-xs text-zinc-600">
                      (Ln {user.cursorPosition.lineNumber}, Col {user.cursorPosition.column})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}