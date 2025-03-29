
import { Share, History, Github, Terminal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActionBarProps {
  onCommit: () => void;
  onShare: () => void;
  onViewHistory: () => void;
  onToggleConsole: () => void;
  showConsole: boolean;
  roomId: string;
}

const ActionBar = ({ 
  onCommit, 
  onShare, 
  onViewHistory, 
  onToggleConsole, 
  showConsole, 
  roomId 
}: ActionBarProps) => {
  return (
    <div className="flex items-center h-12 px-4 border-b border-gray-800 bg-gray-900 justify-between">
      <div className="flex items-center">
        <span className="mr-2 font-semibold text-sm">Room ID: {roomId}</span>
      </div>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showConsole ? "secondary" : "outline"} 
                size="sm" 
                onClick={onToggleConsole}
              >
                <Terminal size={16} className="mr-2" />
                Console
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle console panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onViewHistory}>
                <History size={16} className="mr-2" />
                History
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View file history</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share size={16} className="mr-2" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this room</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onCommit}>
                <Github size={16} className="mr-2" />
                Commit
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Commit changes to GitHub</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ActionBar;
