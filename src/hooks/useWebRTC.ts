"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import type { Socket } from "socket.io-client"

interface UseWebRTCOptions {
  socket: Socket | null
  roomId: string
  userId: string
}

export const useWebRTC = ({ socket, roomId, userId }: UseWebRTCOptions) => {
  const [isMicActive, setIsMicActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingUsers, setSpeakingUsers] = useState<string[]>([])
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({})
  const audioContextRef = useRef<AudioContext | null>(null)

  // Check if WebRTC is supported
  useEffect(() => {
    const isWebRTCSupported = navigator.mediaDevices && window.RTCPeerConnection

    setIsSupported(!!isWebRTCSupported)
  }, [])

  // Set up audio activity detection
  useEffect(() => {
    const handleAudioActivity = (event: CustomEvent<{ active: boolean; level: number }>) => {
      setIsSpeaking(event.detail.active)

      // Notify other users about speaking state
      if (socket?.connected) {
        socket.emit("webrtc-speaking", {
          roomId,
          userId,
          speaking: event.detail.active,
        })
      }
    }

    window.addEventListener("audio-activity", handleAudioActivity as EventListener)

    return () => {
      window.removeEventListener("audio-activity", handleAudioActivity as EventListener)
    }
  }, [socket, roomId, userId])

  // Listen for speaking events from other users
  useEffect(() => {
    if (!socket) return

    const handleUserSpeaking = (data: { userId: string; speaking: boolean }) => {
      setSpeakingUsers((prev) => {
        if (data.speaking && !prev.includes(data.userId)) {
          return [...prev, data.userId]
        } else if (!data.speaking && prev.includes(data.userId)) {
          return prev.filter((id) => id !== data.userId)
        }
        return prev
      })
    }

    socket.on("webrtc-user-speaking", handleUserSpeaking)

    return () => {
      socket.off("webrtc-user-speaking", handleUserSpeaking)
    }
  }, [socket])

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    try {
      if (isMicActive) {
        // Turn off microphone
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop()
          })
          localStreamRef.current = null
        }

        // Notify other users
        if (socket?.connected) {
          socket.emit("webrtc-mute", { roomId, userId })
        }

        setIsMicActive(false)
        setIsSpeaking(false)

        // Dispatch event to stop audio analyzer
        window.dispatchEvent(
          new CustomEvent("mic-toggle", {
            detail: { active: false },
          }),
        )
      } else {
        // Turn on microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

        localStreamRef.current = stream

        // Notify other users
        if (socket?.connected) {
          socket.emit("webrtc-unmute", { roomId, userId })
        }

        setIsMicActive(true)
        setPermissionDenied(false)

        // Dispatch event to start audio analyzer
        window.dispatchEvent(
          new CustomEvent("mic-toggle", {
            detail: { active: true },
          }),
        )
      }
    } catch (error) {
      console.error("Error toggling microphone:", error)
      setPermissionDenied(true)
    }
  }, [isMicActive, socket, roomId, userId])

  // Set audio device
  const setAudioDevice = useCallback(
    async (deviceId: string) => {
      if (!isMicActive) return

      try {
        // Stop current tracks
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop()
          })
        }

        // Get new stream with selected device
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: deviceId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

        localStreamRef.current = stream

        // Update peer connections with new stream
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "audio")
          if (sender && stream.getAudioTracks()[0]) {
            sender.replaceTrack(stream.getAudioTracks()[0])
          }
        })
      } catch (error) {
        console.error("Error setting audio device:", error)
      }
    },
    [isMicActive],
  )

  // Set audio volume
  const setAudioVolume = useCallback((volume: number) => {
    if (!localStreamRef.current) return

    try {
      const audioTracks = localStreamRef.current.getAudioTracks()
      if (audioTracks.length > 0) {
        // Use Web Audio API for volume control instead of constraints
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        
        // const track = audioTracks[0];
        const source = audioContextRef.current.createMediaStreamSource(localStreamRef.current);
        const gainNode = audioContextRef.current.createGain();
        
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
      }
    } catch (error) {
      console.error("Error setting audio volume:", error)
    }
  }, [])

  // Set echo cancellation
  const setEchoCancellation = useCallback(
    async (enabled: boolean) => {
      if (!isMicActive || !localStreamRef.current) return

      try {
        // Stop current tracks
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop()
        })

        // Get new stream with updated constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: enabled,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

        localStreamRef.current = stream

        // Update peer connections with new stream
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "audio")
          if (sender && stream.getAudioTracks()[0]) {
            sender.replaceTrack(stream.getAudioTracks()[0])
          }
        })
      } catch (error) {
        console.error("Error setting echo cancellation:", error)
      }
    },
    [isMicActive],
  )

  // Set noise suppression
  const setNoiseSuppression = useCallback(
    async (enabled: boolean) => {
      if (!isMicActive || !localStreamRef.current) return

      try {
        // Stop current tracks
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop()
        })

        // Get new stream with updated constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: enabled,
            autoGainControl: true,
          },
        })

        localStreamRef.current = stream

        // Update peer connections with new stream
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "audio")
          if (sender && stream.getAudioTracks()[0]) {
            sender.replaceTrack(stream.getAudioTracks()[0])
          }
        })
      } catch (error) {
        console.error("Error setting noise suppression:", error)
      }
    },
    [isMicActive],
  )

  return {
    isMicActive,
    toggleMicrophone,
    isSpeaking,
    speakingUsers,
    permissionDenied,
    isSupported,
    setAudioDevice,
    setAudioVolume,
    setEchoCancellation,
    setNoiseSuppression,
  }
}

