"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface MicrophoneSettingsProps {
  onDeviceChange: (deviceId: string) => void
  onVolumeChange: (volume: number) => void
  onEchoChange: (enabled: boolean) => void
  onNoiseChange: (enabled: boolean) => void
}

export const MicrophoneSettings: React.FC<MicrophoneSettingsProps> = ({
  onDeviceChange,
  onVolumeChange,
  onEchoChange,
  onNoiseChange,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [volume, setVolume] = useState<number>(100)
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true)
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Get available audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true })

        // Then get the list of devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioDevices = devices.filter((device) => device.kind === "audioinput")

        setDevices(audioDevices)

        // Set default device if available
        if (audioDevices.length > 0 && !selectedDevice) {
          const defaultDevice = audioDevices.find((d) => d.deviceId === "default") || audioDevices[0]
          setSelectedDevice(defaultDevice.deviceId)
          onDeviceChange(defaultDevice.deviceId)
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
      }
    }

    if (isOpen) {
      getDevices()
    }
  }, [isOpen, onDeviceChange, selectedDevice])

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId)
    onDeviceChange(deviceId)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    onVolumeChange(newVolume / 100)
  }

  const handleEchoCancellationChange = (checked: boolean) => {
    setEchoCancellation(checked)
    onEchoChange(checked)
  }

  const handleNoiseSuppressionChange = (checked: boolean) => {
    setNoiseSuppression(checked)
    onNoiseChange(checked)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700">
          <Settings size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-200 border-zinc-700">
        <DialogHeader>
          <DialogTitle>Microphone Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="microphone" className="text-right">
              Microphone
            </Label>
            <Select value={selectedDevice} onValueChange={handleDeviceChange}>
              <SelectTrigger className="col-span-3 bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {devices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                  </SelectItem>
                ))}
                {devices.length === 0 && (
                  <SelectItem value="none" disabled>
                    No microphones found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="volume" className="text-right">
              Volume
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Slider
                id="volume"
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
              <span className="w-8 text-sm">{volume}%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="echo" className="text-right">
              Echo Cancellation
            </Label>
            <div className="col-span-3">
              <Switch id="echo" checked={echoCancellation} onCheckedChange={handleEchoCancellationChange} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="noise" className="text-right">
              Noise Suppression
            </Label>
            <div className="col-span-3">
              <Switch id="noise" checked={noiseSuppression} onCheckedChange={handleNoiseSuppressionChange} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

