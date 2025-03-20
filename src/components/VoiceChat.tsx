import React from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { useToast } from "@/hooks/use-toast";
import { AudioVisualizer } from './AudioVisualizer';
import { MicrophoneSettings } from './MicrophoneSettings';
import { ConnectionStatus } from './ConnectionStatus';

interface VoiceChatProps {
  socket: Socket | null;
  roomId: string;
  userId: string;
  users: Array<{ id: string; name?: string; color?: string }>;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ socket, roomId, userId, users }) => {
  console.log('[VoiceChat] Initializing component with:', { roomId, userId, usersCount: users.length });
  
  const { toast } = useToast();
  const {
    isMicActive,
    toggleMicrophone,
    isSpeaking,
    speakingUsers,
    permissionDenied,
    isSupported,
    setAudioDevice,
    setAudioVolume,
    setEchoCancellation,
    setNoiseSuppression
  } = useWebRTC({ socket, roomId, userId });
  
  console.log('[VoiceChat] WebRTC state:', { 
    isMicActive, 
    isSpeaking, 
    speakingUsersCount: speakingUsers.length,
    permissionDenied, 
    isSupported 
  });
  
  // Default connection quality as fallback
  const connectionQuality = 'good';

  // Helper function to check if a user is speaking
  const isUserSpeaking = (userIdToCheck: string) => {
    // Check if the user is in the speakingUsers array
    const isSpeakingFromHook = speakingUsers.includes(userIdToCheck);
    
    // For the current user, also check the local isSpeaking state
    const isCurrentUser = userIdToCheck === userId;
    const isLocalSpeaking = isCurrentUser && isSpeaking;
    
    const result = isSpeakingFromHook || isLocalSpeaking;
    if (result) {
      console.log('[VoiceChat] User speaking detected:', { 
        userIdToCheck, 
        isCurrentUser, 
        isSpeakingFromHook, 
        isLocalSpeaking 
      });
    }
    return result;
  };

  // Add this useEffect to ensure microphone is properly initialized when component mounts
  React.useEffect(() => {
    if (isSupported && socket?.connected) {
      // Log connection status for debugging
      console.log('[VoiceChat] WebRTC initialized, socket connected:', socket.connected);
      
      // Listen for connection events
      socket.on('webrtc-connection-status', (status) => {
        console.log('[VoiceChat] WebRTC connection status:', status);
      });

      // Add debug listeners for WebRTC events
      socket.on('webrtc-signal', (data) => {
        console.log('[VoiceChat] WebRTC signal received:', data.type);
      });

      socket.on('webrtc-user-connected', (userId) => {
        console.log('[VoiceChat] WebRTC user connected:', userId);
      });

      socket.on('webrtc-user-disconnected', (userId) => {
        console.log('[VoiceChat] WebRTC user disconnected:', userId);
      });

      // Debug audio stream
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('[VoiceChat] Audio stream obtained successfully');
          
          // Check audio tracks
          const audioTracks = stream.getAudioTracks();
          console.log('[VoiceChat] Audio tracks:', audioTracks.length);
          audioTracks.forEach((track, i) => {
            console.log(`[VoiceChat] Track ${i}:`, {
              label: track.label,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState
            });
          });
          
          // Create audio context to check audio levels
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // Create a custom event to notify the WebRTC hook about audio activity
            const audioActivityEvent = new CustomEvent('audio-activity', { 
              detail: { active: false, level: 0 } 
            });
            
            // Store the audio stream reference to be able to stop it
            let audioStreamRef = stream;
            let isAnalyzerActive = true;
            
            // Function to stop all audio tracks
            const stopAudioTracks = () => {
              if (audioStreamRef) {
                audioStreamRef.getTracks().forEach(track => {
                  track.enabled = false;
                  track.stop();
                });
                console.log('[VoiceChat] Audio tracks stopped');
              }
            };
            
            // Listen for mic toggle events
            window.addEventListener('mic-toggle', (event: any) => {
              if (!event.detail.active) {
                console.log('[VoiceChat] Mic toggled off, stopping audio analyzer');
                isAnalyzerActive = false;
                stopAudioTracks();
              } else {
                console.log('[VoiceChat] Mic toggled on, restarting audio analyzer');
                isAnalyzerActive = true;
              }
            });
            
            const checkAudioLevel = () => {
              // Check mic state at each interval
              if (!isMicActive || !isAnalyzerActive) {
                // When mic is off, explicitly set audio level to 0 via custom event
                window.dispatchEvent(new CustomEvent('audio-activity', { 
                  detail: { active: false, level: 0 } 
                }));
                
                // Continue checking but at a slower rate
                setTimeout(checkAudioLevel, 500);
                return;
              }
              
              // Only analyze audio when mic is active
              try {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i];
                }
                const average = sum / bufferLength;
                
                // Threshold for speaking detection - adjust as needed
                const isSpeakingNow = average > 25;
                
                if (isSpeakingNow && isMicActive) {
                  console.log('[VoiceChat] Audio detected, level:', average);
                  
                  // Manually emit a speaking event to the socket
                  if (socket?.connected) {
                    socket.emit('webrtc-speaking', { 
                      roomId, 
                      userId, 
                      speaking: true,
                      level: average 
                    });
                  }
                  
                  // Dispatch custom event for local state update
                  window.dispatchEvent(new CustomEvent('audio-activity', { 
                    detail: { active: true, level: average } 
                  }));
                } else if (average > 10 && isMicActive) {
                  // Still log lower levels but don't trigger speaking
                  console.log('[VoiceChat] Low audio detected, level:', average);
                  
                  // Dispatch event with inactive speaking but with the detected level
                  window.dispatchEvent(new CustomEvent('audio-activity', { 
                    detail: { active: false, level: average } 
                  }));
                } else {
                  // No audio detected, set level to 0
                  window.dispatchEvent(new CustomEvent('audio-activity', { 
                    detail: { active: false, level: 0 } 
                  }));
                }
              } catch (err) {
                console.error('[VoiceChat] Error analyzing audio:', err);
              }
              
              setTimeout(checkAudioLevel, 200); // More frequent checks for better responsiveness
            };
            
            checkAudioLevel();
            console.log('[VoiceChat] Audio analyzer set up successfully');
          } catch (err) {
            console.error('[VoiceChat] Error setting up audio analyzer:', err);
          }
        })
        .catch(err => {
          console.error('[VoiceChat] Error getting audio stream:', err);
        });
    }
    
    return () => {
      if (socket) {
        socket.off('webrtc-connection-status');
        socket.off('webrtc-signal');
        socket.off('webrtc-user-connected');
        socket.off('webrtc-user-disconnected');
        console.log('[VoiceChat] Cleaned up WebRTC listeners');
      }
      
      // Clean up event listeners
      window.removeEventListener('mic-toggle', (event: any) => {});
      
      // Stop any active audio tracks
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mic-toggle', {
          detail: { active: false }
        }));
      }
    };
  }, [isSupported, socket, roomId, userId, isMicActive]);

  // Add a separate effect to handle microphone initialization
  React.useEffect(() => {
    if (isSupported && socket?.connected && !isMicActive && toggleMicrophone) {
      // Initialize microphone on component mount
      console.log('[VoiceChat] Initializing microphone');
      setTimeout(() => {
        console.log('[VoiceChat] Activating microphone after delay');
        toggleMicrophone();
        
        // Debug socket connection after mic activation
        setTimeout(() => {
          if (socket?.connected) {
            console.log('[VoiceChat] Socket still connected after mic activation');
            
            // Test socket communication
            socket.emit('ping-test', { userId });
            socket.on('pong-test', (data) => {
              console.log('[VoiceChat] Received pong from server:', data);
            });
          } else {
            console.error('[VoiceChat] Socket disconnected after mic activation');
          }
        }, 2000);
      }, 1000); // Small delay to ensure socket is fully ready
    }
  }, [isSupported, socket?.connected, toggleMicrophone, isMicActive, userId, socket]);

  // Show error if WebRTC is not supported
  React.useEffect(() => {
    if (!isSupported) {
      console.error('[VoiceChat] WebRTC not supported in this browser');
      toast({
        title: "Voice Chat Unavailable",
        description: "Your browser doesn't support WebRTC. Try using Chrome, Firefox, or Edge.",
        variant: "destructive"
      });
    }
  }, [isSupported, toast]);

  // Show error if microphone permission is denied
  React.useEffect(() => {
    if (permissionDenied) {
      console.error('[VoiceChat] Microphone permission denied by user');
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice chat.",
        variant: "destructive"
      });
    }
  }, [permissionDenied, toast]);

  if (!isSupported) {
    return (
      <div className="p-4 bg-zinc-800/50 rounded-md border border-zinc-700">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={16} />
          <span>Voice chat not supported in your browser</span>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-800/50 rounded-md border border-zinc-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2 text-zinc-200">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Voice Chat
        </h3>
        <div className="flex items-center gap-2">
          <MicrophoneSettings 
            onDeviceChange={(deviceId) => {
              console.log('[VoiceChat] Audio device changed:', deviceId);
              setAudioDevice(deviceId);
            }}
            onVolumeChange={(volume) => {
              console.log('[VoiceChat] Audio volume changed:', volume);
              setAudioVolume(volume);
            }}
            onEchoChange={(enabled) => {
              console.log('[VoiceChat] Echo cancellation changed:', enabled);
              setEchoCancellation(enabled);
            }}
            onNoiseChange={(enabled) => {
              console.log('[VoiceChat] Noise suppression changed:', enabled);
              setNoiseSuppression(enabled);
            }}
          />
          <button
            onClick={() => {
              console.log('[VoiceChat] Toggling microphone, current state:', isMicActive);
              
              // Force update audio activity state when turning mic off
              if (isMicActive) {
                // First dispatch the event to set audio level to 0
                window.dispatchEvent(new CustomEvent('audio-activity', { 
                  detail: { active: false, level: 0 } 
                }));
                
                // Dispatch mic toggle event to stop audio analyzer
                window.dispatchEvent(new CustomEvent('mic-toggle', {
                  detail: { active: false }
                }));
                
                console.log('[VoiceChat] Explicitly setting audio level to 0 before mic off');
                
                // Then toggle the microphone
                toggleMicrophone();
              } else {
                // Dispatch mic toggle event to restart audio analyzer
                window.dispatchEvent(new CustomEvent('mic-toggle', {
                  detail: { active: true }
                }));
                
                // Just toggle the microphone on
                toggleMicrophone();
              }
            }}
            className={`p-2 rounded-full transition-all duration-200 ${
              isMicActive
                ? 'bg-green-900/30 text-green-400 hover:bg-green-800/40'
                : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
            }`}
            title={isMicActive ? "Mute microphone" : "Unmute microphone"}
          >
            {isMicActive ? (
              <Mic size={18} className={isSpeaking ? "animate-pulse" : ""} />
            ) : (
              <MicOff size={18} />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-1">
        <ConnectionStatus 
          isConnected={isSupported && !permissionDenied && Boolean(socket?.connected)}
          connectionQuality={connectionQuality}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-zinc-400 font-medium">Connected Users</p>
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {users.map((user, index) => {
            const isCurrentUser = user.id === userId;
            const userSpeaking = isUserSpeaking(user.id);
            
            // Ensure unique key by combining user.id with index
            const uniqueKey = `${user.id}-${index}`;
            
            return (
              <li 
                key={uniqueKey}
                className={`flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors duration-200 ${
                  userSpeaking 
                    ? 'bg-green-900/30 border border-green-800/50' 
                    : 'bg-zinc-700/50 border border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${userSpeaking ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: user.color || '#888' }}
                  />
                  <span className={`${isCurrentUser ? 'font-medium' : ''} text-zinc-200`}>
                    {user.name || user.id.substring(0, 6)}
                    {isCurrentUser && " (you)"}
                  </span>
                </div>
                <div className="w-16">
                  <AudioVisualizer 
                    isActive={isCurrentUser ? isMicActive : true} 
                    isSpeaking={userSpeaking}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {permissionDenied && (
        <div className="p-3 bg-red-900/20 rounded-md text-xs text-red-400 flex items-center gap-2 border border-red-800/50">
          <AlertCircle size={14} />
          <span>Microphone access denied. Please check your browser settings.</span>
        </div>
      )}
    </div>
  );
};