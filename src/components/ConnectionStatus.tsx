import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  connectionQuality
}) => {
  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-green-400';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-orange-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getStatusText = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'Excellent connection';
      case 'good':
        return 'Good connection';
      case 'fair':
        return 'Fair connection';
      case 'poor':
        return 'Poor connection';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown status';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${getStatusColor()}`}>
            {isConnected ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}
            <span className="text-xs">{connectionQuality !== 'disconnected' ? 'Connected' : 'Disconnected'}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};