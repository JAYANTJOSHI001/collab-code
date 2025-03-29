import type React from "react"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  connectionQuality?: "good" | "fair" | "poor"
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, connectionQuality = "good" }) => {
  // Define colors based on connection quality
  const getStatusColor = () => {
    if (!isConnected) return "text-red-500"

    switch (connectionQuality) {
      case "good":
        return "text-green-500"
      case "fair":
        return "text-yellow-500"
      case "poor":
        return "text-orange-500"
      default:
        return "text-green-500"
    }
  }

  // Define status text
  const getStatusText = () => {
    if (!isConnected) return "Disconnected"

    switch (connectionQuality) {
      case "good":
        return "Connected"
      case "fair":
        return "Fair Connection"
      case "poor":
        return "Poor Connection"
      default:
        return "Connected"
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
        isConnected ? "bg-green-900/20" : "bg-red-900/20",
        getStatusColor(),
      )}
    >
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      <span>{getStatusText()}</span>
    </div>
  )
}

