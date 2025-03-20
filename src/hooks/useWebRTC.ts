import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface WebRTCOptions {
  socket: Socket | null;
  roomId: string;
  userId: string;
}

interface PeerConnection {
  connection: RTCPeerConnection;
  userId: string;
  socketId: string;
}

export const useWebRTC = ({ socket, roomId, userId }: WebRTCOptions) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState<string[]>([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakingDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check browser support
  useEffect(() => {
    const isWebRTCSupported = 
      navigator.mediaDevices && 
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.RTCPeerConnection;
    
    setIsSupported(!!isWebRTCSupported);
  }, []);

  // Configure ICE servers
  const getICEServers = () => {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    };
  };

  // Create a new peer connection
  const createPeerConnection = useCallback((targetSocketId: string, targetUserId: string) => {
    try {
      console.log(`[WebRTC] Creating peer connection to ${targetUserId}`);
      const peerConnection = new RTCPeerConnection(getICEServers());
      
      // Add local stream tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          if (localStreamRef.current) {
            peerConnection.addTrack(track, localStreamRef.current);
          }
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('webrtc-ice-candidate', {
            target: targetSocketId,
            candidate: event.candidate,
            from: userId
          });
        }
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log(`[WebRTC] Received track from ${targetUserId}`);
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });
        
        // Create audio element to play the remote stream
        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.autoplay = true;
        document.body.appendChild(audioElement);
      };
      
      // Store the connection
      peerConnectionsRef.current.set(targetSocketId, {
        connection: peerConnection,
        userId: targetUserId,
        socketId: targetSocketId
      });
      
      return peerConnection;
    } catch (error) {
      console.error('[WebRTC] Error creating peer connection:', error);
      return null;
    }
  }, [socket, userId]);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      if (!isSupported) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      
      // Set up audio analysis for speaking detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Initially mute the microphone
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      
      // Start speaking detection
      startSpeakingDetection();
      
      setIsMicActive(false);
      setPermissionDenied(false);
    } catch (error) {
      console.error('[WebRTC] Error initializing WebRTC:', error);
      setPermissionDenied(true);
    }
  }, [isSupported]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (!localStreamRef.current) {
      initializeWebRTC();
      return;
    }
    
    const newState = !isMicActive;
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = newState;
    });
    
    setIsMicActive(newState);
  }, [isMicActive, initializeWebRTC]);

  // Start speaking detection
  const startSpeakingDetection = useCallback(() => {
    if (!analyserRef.current || speakingDetectionIntervalRef.current) return;
    
    const analyser = analyserRef.current;
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    speakingDetectionIntervalRef.current = setInterval(() => {
      if (!isMicActive) {
        if (isSpeaking) setIsSpeaking(false);
        return;
      }
      
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      const average = sum / bufferLength;
      const speaking = average > 20; // Threshold for speaking detection
      
      if (speaking !== isSpeaking) {
        setIsSpeaking(speaking);
        socket?.emit('webrtc-speaking', {
          roomId,
          userId,
          speaking
        });
      }
    }, 200);
    
    return () => {
      if (speakingDetectionIntervalRef.current) {
        clearInterval(speakingDetectionIntervalRef.current);
        speakingDetectionIntervalRef.current = null;
      }
    };
  }, [isMicActive, isSpeaking, roomId, socket, userId]);

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket || !isSupported) return;
    
    // Handle current users in the room
    const handleCurrentUsers = (users: Array<{ id: string, socketId: string }>) => {
      console.log('[WebRTC] Current users in room:', users);
      
      // Create peer connections to all existing users
      users.forEach(async (user) => {
        if (user.id !== userId && user.socketId) {
          const peerConnection = createPeerConnection(user.socketId, user.id);
          
          if (peerConnection && isMicActive) {
            try {
              const offer = await peerConnection.createOffer();
              await peerConnection.setLocalDescription(offer);
              
              socket.emit('webrtc-offer', {
                target: user.socketId,
                offer,
                from: userId
              });
            } catch (error) {
              console.error('[WebRTC] Error creating offer:', error);
            }
          }
        }
      });
    };
    
    // Handle WebRTC offer
    const handleOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      console.log(`[WebRTC] Received offer from ${from}`);
      
      let peerConnection = peerConnectionsRef.current.get(from)?.connection;
      
      if (!peerConnection) {
        const newConnection = createPeerConnection(from, from);
        if (newConnection) {
          peerConnection = newConnection;
        }
      }
      
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          socket.emit('webrtc-answer', {
            target: from,
            answer,
            from: userId
          });
        } catch (error) {
          console.error('[WebRTC] Error handling offer:', error);
        }
      }
    };
    
    // Handle WebRTC answer
    const handleAnswer = async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      console.log(`[WebRTC] Received answer from ${from}`);
      
      const peerConnection = peerConnectionsRef.current.get(from)?.connection;
      
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('[WebRTC] Error handling answer:', error);
        }
      }
    };
    
    // Handle ICE candidate
    const handleIceCandidate = ({ candidate, from }: { candidate: RTCIceCandidate, from: string }) => {
      console.log(`[WebRTC] Received ICE candidate from ${from}`);
      
      const peerConnection = peerConnectionsRef.current.get(from)?.connection;
      
      if (peerConnection) {
        try {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('[WebRTC] Error adding ICE candidate:', error);
        }
      }
    };
    
    // Handle user speaking status
    const handleUserSpeaking = ({ userId: speakingUserId, speaking }: { userId: string, speaking: boolean }) => {
      setSpeakingUsers((prev: string[]): string[] => {
        if (speaking && !prev.includes(speakingUserId)) {
          return [...prev, speakingUserId];
        } else if (!speaking && prev.includes(speakingUserId)) {
          return prev.filter(id => id !== speakingUserId);
        }
        return prev;
      });
    };
    
    // Handle user left
    const handleUserLeft = ({ userId: leftUserId }: { userId: string }) => {
      // Find and close the peer connection for this user
      peerConnectionsRef.current.forEach((peer, socketId) => {
        if (peer.userId === leftUserId) {
          peer.connection.close();
          peerConnectionsRef.current.delete(socketId);
        }
      });
      
      // Remove from speaking users if needed
      setSpeakingUsers(prev => prev.filter(id => id !== leftUserId));
    };
    
    // Register event listeners
    socket.on('current-users', handleCurrentUsers);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-speaking', handleUserSpeaking);
    socket.on('user-left', handleUserLeft);
    
    // Clean up
    return () => {
      socket.off('current-users', handleCurrentUsers);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('user-speaking', handleUserSpeaking);
      socket.off('user-left', handleUserLeft);
      
      // Close all peer connections
      peerConnectionsRef.current.forEach(peer => {
        peer.connection.close();
      });
      peerConnectionsRef.current.clear();
      
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = null;
      }
      
      // Stop speaking detection
      if (speakingDetectionIntervalRef.current) {
        clearInterval(speakingDetectionIntervalRef.current);
        speakingDetectionIntervalRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [socket, userId, roomId, isMicActive, isSupported, createPeerConnection]);
  
  // Initialize WebRTC when component mounts
  useEffect(() => {
    if (isSupported) {
      initializeWebRTC();
    }
    
    return () => {
      // Clean up resources
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [isSupported, initializeWebRTC]);
  
  // Inside your useWebRTC hook, add this state
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'disconnected'>('good');
  
  // Make sure to include it in the return object
  return {
    isMicActive,
    toggleMicrophone,
    isSpeaking,
    speakingUsers,
    permissionDenied,
    isSupported,
    connectionQuality, // Add this line
    setAudioDevice: (deviceId: string) => {
      if (!isSupported) return;
      
      // Stop current stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Get new stream with selected device
      navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true
        }
      }).then(stream => {
        localStreamRef.current = stream;
        
        // Update all peer connections with new stream
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMicActive;
          
          peerConnectionsRef.current.forEach(peer => {
            const senders = peer.connection.getSenders();
            const audioSender = senders.find(sender => 
              sender.track?.kind === 'audio'
            );
            
            if (audioSender) {
              audioSender.replaceTrack(track);
            }
          });
        });
        
        // Update audio analysis
        if (audioContextRef.current && analyserRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }
      }).catch(error => {
        console.error('[WebRTC] Error setting audio device:', error);
      });
    },
    setAudioVolume: (volume: number) => {
      if (!localStreamRef.current) return;
      
      localStreamRef.current.getAudioTracks().forEach(track => {
        // Use Web Audio API to control volume since MediaTrackSettings doesn't support volume
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
      });
    },
    setEchoCancellation: (enabled: boolean) => {
      if (!localStreamRef.current) return;
      
      // We need to recreate the stream with new constraints
      const deviceId = localStreamRef.current.getAudioTracks()[0]?.getSettings().deviceId;
      
      navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: enabled,
          noiseSuppression: true
        }
      }).then(stream => {
        // Same process as setAudioDevice
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMicActive;
          
          peerConnectionsRef.current.forEach(peer => {
            const senders = peer.connection.getSenders();
            const audioSender = senders.find(sender => 
              sender.track?.kind === 'audio'
            );
            
            if (audioSender) {
              audioSender.replaceTrack(track);
            }
          });
        });
        
        // Update audio analysis
        if (audioContextRef.current && analyserRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }
      }).catch(error => {
        console.error('[WebRTC] Error setting echo cancellation:', error);
      });
    },
    setNoiseSuppression: (enabled: boolean) => {
      if (!localStreamRef.current) return;
      
      // Similar to echo cancellation
      const deviceId = localStreamRef.current.getAudioTracks()[0]?.getSettings().deviceId;
      
      navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: enabled
        }
      }).then(stream => {
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMicActive; // Use current mic state instead of always disabling
          
          peerConnectionsRef.current.forEach(peer => {
            const senders = peer.connection.getSenders();
            const audioSender = senders.find(sender => 
              sender.track?.kind === 'audio'
            );
            
            if (audioSender) {
              audioSender.replaceTrack(track);
            }
          });
        });
        
        if (audioContextRef.current && analyserRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }
      }).catch(error => {
        console.error('[WebRTC] Error setting noise suppression:', error);
      });
    }
  };
};
