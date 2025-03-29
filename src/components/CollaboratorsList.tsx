import { User } from "@/types/room";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";

interface CollaboratorsListProps {
  users?: User[];
  currentFile?: string | null;
}

export function CollaboratorsList({ users = []}: CollaboratorsListProps) {
  useEffect(() => {
    console.log("Active users:", users);
  }, [users]);

  return (
    <div className="p-4 bg-zinc-900 border-l border-zinc-800 w-64">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">Active Collaborators</h3>
      <div className="space-y-3">
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