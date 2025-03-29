import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  timestamp: Date;
}

interface ChatPanelProps {
  roomId: string;
  socket:  Socket | null;
  onClose: () => void;
}

export function ChatPanel({ roomId, socket, onClose }: ChatPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    const handleChatMessage = (message: Message) => {
      console.log('📩 [Chat] Received message:', message);
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }]);
    };

    // Listen for chat history when joining
    const handleChatHistory = (history: Message[]) => {
      console.log('📚 [Chat] Received chat history:', history.length);
      setMessages(history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    };

    // Register event listeners
    socket.on('chatMessage', handleChatMessage);
    socket.on('chatHistory', handleChatHistory);

    // Request chat history
    socket.emit('getChatHistory', { roomId });

    // Cleanup
    return () => {
      socket.off('chatMessage', handleChatMessage);
      socket.off('chatHistory', handleChatHistory);
    };
  }, [socket, roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() || !session?.user) return;

    const messageData = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: session.user.email || '',
        name: session.user.name,
        image: session.user.image
      },
      timestamp: new Date(),
      roomId
    };

    // Send message via socket
    socket?.emit('sendChatMessage', messageData);
    
    // Optimistically add to local state
    setMessages(prev => [...prev, messageData]);
    
    // Clear input
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className='text-white hover:text-black'>
          Close
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender.id === session?.user?.email;
              
              return (
                <div 
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.image || ''} />
                      <AvatarFallback>
                        {message.sender.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`rounded-lg px-3 py-2 ${
                      isCurrentUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-800 text-zinc-100'
                    }`}>
                      <div className="text-xs text-zinc-400 mb-1">
                        {message.sender.name || 'Anonymous'} • {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </div>
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

