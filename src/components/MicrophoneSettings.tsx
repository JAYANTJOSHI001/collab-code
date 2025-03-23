import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface MicrophoneSettingsProps {
  onDeviceChange: (deviceId: string) => void;
  onVolumeChange: (volume: number) => void;
  onEchoChange: (enabled: boolean) => void;
  onNoiseChange: (enabled: boolean) => void;
}

export const MicrophoneSettings: React.FC<MicrophoneSettingsProps> = ({
  onDeviceChange,
  onVolumeChange,
  onEchoChange,
  onNoiseChange
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [volume, setVolume] = useState<number>(1);
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);
  
  // Get available audio input devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        setDevices(audioInputs);
        
        // Set default device if available
        if (audioInputs.length > 0 && !selectedDevice) {
          const defaultDevice = audioInputs.find(device => device.deviceId === 'default') || audioInputs[0];
          setSelectedDevice(defaultDevice.deviceId);
          onDeviceChange(defaultDevice.deviceId);
        }
      } catch (error) {
        console.error('Error getting audio devices:', error);
      }
    };
    
    getDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [onDeviceChange, selectedDevice]); // Added missing dependencies
  
  const handleDeviceChange = (value: string) => {
    setSelectedDevice(value);
    onDeviceChange(value);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };
  
  const handleEchoCancellationChange = (checked: boolean) => {
    setEchoCancellation(checked);
    onEchoChange(checked);
  };
  
  const handleNoiseSuppressionChange = (checked: boolean) => {
    setNoiseSuppression(checked);
    onNoiseChange(checked);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-white hover:text-blue-300 hover:bg-blue-950/30"
        >
          <Settings size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10">
        <DialogHeader className="sticky top-0 bg-black/80 backdrop-blur-xl z-10 pb-4">
          <DialogTitle className="text-blue-200">Microphone Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="mic-select" className="text-blue-200">Microphone</Label>
            <Select value={selectedDevice} onValueChange={handleDeviceChange}>
              <SelectTrigger id="mic-select" className="bg-blue-950/30 w-100 border-white/10 text-blue-200">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                {devices.map(device => (
                  <SelectItem 
                    key={device.deviceId} 
                    value={device.deviceId}
                    className="text-blue-200 focus:bg-blue-950/50 focus:text-blue-100"
                  >
                    {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="volume-slider" className="text-blue-200">Microphone Volume</Label>
              <span className="text-sm text-blue-300">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              id="volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={[volume]}
              onValueChange={handleVolumeChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="echo-switch" className="text-blue-200">Echo Cancellation</Label>
            <Switch
              id="echo-switch"
              checked={echoCancellation}
              onCheckedChange={handleEchoCancellationChange}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="noise-switch" className="text-blue-200">Noise Suppression</Label>
            <Switch
              id="noise-switch"
              checked={noiseSuppression}
              onCheckedChange={handleNoiseSuppressionChange}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};