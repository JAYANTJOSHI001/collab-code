import React, { useEffect, useState, useRef } from 'react';

// Define a custom event interface for audio activity
interface AudioActivityEvent extends Event {
  detail: {
    active: boolean;
    level: number;
  };
}

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isActive, 
  isSpeaking 
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [bars, setBars] = useState<number[]>([0, 0, 0, 0, 0]);
  
  // Listen for audio activity events
  useEffect(() => {
    const handleAudioActivity = (event: AudioActivityEvent) => {
      if (isActive && event.detail.active) {
        setAudioLevel(Math.min(100, event.detail.level * 2)); // Scale up for better visualization
      } else {
        setAudioLevel(0);
      }
    };
    
    window.addEventListener('audio-activity', handleAudioActivity as EventListener);
    
    return () => {
      window.removeEventListener('audio-activity', handleAudioActivity as EventListener);
    };
  }, [isActive]);
  
  // Update visualization based on audio level
  useEffect(() => {
    if (!isActive) {
      setBars([0, 0, 0, 0, 0]);
      return;
    }
    
    const updateBars = () => {
      if (isSpeaking || audioLevel > 0) {
        // Generate random heights based on audio level
        const newBars = Array(5).fill(0).map(() => {
          const baseHeight = audioLevel * 0.8;
          const randomVariation = Math.random() * 20 - 10; // -10 to +10
          return Math.max(5, Math.min(100, baseHeight + randomVariation));
        });
        setBars(newBars);
      } else {
        // Idle state - small random movement
        const newBars = Array(5).fill(0).map(() => Math.random() * 5 + 2);
        setBars(newBars);
      }
      
      animationRef.current = requestAnimationFrame(updateBars);
    };
    
    animationRef.current = requestAnimationFrame(updateBars);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking, audioLevel]);
  
  if (!isActive) {
    return (
      <div className="flex items-end justify-center h-4 gap-[2px]">
        <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
        <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
        <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
        <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
        <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
      </div>
    );
  }
  
  // console.log("bars::::",bars);

  return (
    <div className="flex items-end justify-center h-4 gap-[2px]">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-75 ${
            isSpeaking || audioLevel > 20
              ? 'bg-green-400'
              : 'bg-zinc-400'
          }`}
          style={{ height: `${Math.max(2, height/5)}px` }}
        ></div>
      ))}
    </div>
  );
};