import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  Heart,
  ThumbsUp,
  Link as LinkIcon,
  Youtube,
  MessageSquare,
  MoreVertical,
  UserPlus,
  Phone,
  Video as VideoIcon,
  X,
  Users,
  Clock,
  ChevronDown
} from 'lucide-react';

// YouTube embed component
const YouTubeEmbed = ({ url }) => {
  // Extract video ID from YouTube URL
  const getYouTubeID = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = getYouTubeID(url);
  
  if (!videoId) return <div className="text-red-400 text-xs">ไม่สามารถแสดงวิดีโอได้ โปรดตรวจสอบลิงก์</div>;
  
  return (
    <div className="w-full rounded-lg overflow-hidden aspect-video">
      <iframe 
        width="100%" 
        height="100%" 
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen>
      </iframe>
    </div>
  );
};

// URL preview component
const LinkPreview = ({ url }) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-zinc-800 rounded-lg border border-blue-500/30 p-3 hover:bg-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-2 text-blue-400">
        <LinkIcon size={14} />
        <span className="text-sm truncate">{url}</span>
      </div>
    </a>
  );
};

// Image preview component
const ImagePreview = ({ src, alt = "Shared image" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setIsExpanded(false)}>
        <img 
          src={src} 
          alt={alt} 
          className="max-w-[90%] max-h-[90vh] object-contain"
        />
        <button className="absolute top-4 right-4 text-white">
          <X size={24} />
        </button>
      </div>
    );
  }
  
  return (
    <div 
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-zinc-700"
      onClick={() => setIsExpanded(true)}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full max-h-[300px] object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <div className="bg-black/60 p-2 rounded-full">
          <ImageIcon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export function PremiumChatWindow({ selectedUser, onBack, socket, isConnected }) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageType, setMessageType] = useState('text'); // 'text', 'image', 'youtube', 'link'
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [likedMessages, setLikedMessages] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(8); // Mock data for online users
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Socket.IO connection
  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        // Initialize like count for new messages
        message.likeCount = message.likeCount || 0;
        setChatMessages(prev => [...prev, message]);
      });

      socket.on('messages_loaded', (messages) => {
        // Initialize like count for loaded messages
        const messagesWithLikes = messages.map(msg => ({
          ...msg,
          likeCount: msg.likeCount || 0
        }));
        setChatMessages(messagesWithLikes);
      });

      // Load messages when component mounts
      socket.emit('load_messages');

      return () => {
        socket.off('new_message');
        socket.off('messages_loaded');
      };
    }
  }, [socket]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file);

    // Normally, you would upload to a server here
    // For this example, we'll just use the local URL
    setTimeout(() => {
      setAttachmentUrl(imageUrl);
      setMessageType('image');
      setIsUploading(false);
    }, 1000);
  };

  // Handle message sending
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if ((!chatInput.trim() && messageType === 'text') || !socket) return;
    
    let messageContent = chatInput;
    let messageTypeToSend = messageType;
    
    // Check if input contains a YouTube link
    if (messageType === 'text' && chatInput.includes('youtube.com/watch') || chatInput.includes('youtu.be/')) {
      messageTypeToSend = 'youtube';
    }
    
    // Check if input contains a general link
    else if (messageType === 'text' && (chatInput.includes('http://') || chatInput.includes('https://'))) {
      messageTypeToSend = 'link';
    }
    
    const messageData = {
      from: "me",
      text: messageContent,
      user: selectedUser,
      timestamp: new Date(),
      messageType: messageTypeToSend,
      attachment: attachmentUrl,
      likeCount: 0
    };

    socket.emit('send_message', messageData);
    setChatInput('');
    setMessageType('text');
    setAttachmentUrl('');
  };

  // Handle like action
  const handleLikeMessage = (messageIndex) => {
    const updatedMessages = [...chatMessages];
    
    if (!updatedMessages[messageIndex].likeCount) {
      updatedMessages[messageIndex].likeCount = 0;
    }
    
    if (likedMessages[messageIndex]) {
      updatedMessages[messageIndex].likeCount--;
      setLikedMessages({...likedMessages, [messageIndex]: false});
    } else {
      updatedMessages[messageIndex].likeCount++;
      setLikedMessages({...likedMessages, [messageIndex]: true});
    }
    
    setChatMessages(updatedMessages);
    
    // Update like count on server (if implemented)
    // socket.emit('update_like', { messageId: updatedMessages[messageIndex]._id, likeCount: updatedMessages[messageIndex].likeCount });
  };

  // Handle Enter key for sending
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border-b border-blue-500/30 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left side with profile info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-blue-400/50">
              <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} className="object-cover" />
              <AvatarFallback className="bg-blue-900 text-blue-300 text-xl">
                {selectedUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                <div className={`w-2 h-2 rounded-full ${selectedUser.status === "ออนไลน์" ? "bg-green-400" : "bg-zinc-400"}`}></div>
              </div>
              <div className="text-xs text-blue-300 flex items-center gap-2">
                <Clock size={12} />
                <span>ออนไลน์ล่าสุด 2 นาทีที่แล้ว</span>
              </div>
            </div>
          </div>
          
          {/* Right side with actions */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-blue-300 flex items-center gap-1 mr-4">
              <Users size={14} />
              <span>{onlineUsers} คนกำลังออนไลน์</span>
            </div>
            <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-200 hover:bg-blue-950">
              <Phone size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-200 hover:bg-blue-950">
              <VideoIcon size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-200 hover:bg-blue-950">
              <UserPlus size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-200 hover:bg-blue-950">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black p-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* System message */}
          <div className="text-center my-4">
            <div className="inline-block bg-zinc-800/80 px-3 py-1 rounded-full text-xs text-zinc-400">
              วันนี้ - เริ่มการสนทนา
            </div>
          </div>
          
          {/* Chat messages */}
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {/* Message container */}
              <div className="flex items-start gap-3">
                {/* Avatar - Always on left */}
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10 border border-blue-500/30">
                    <AvatarImage 
                      src={msg.from === "me" ? selectedUser.avatar : msg.user?.avatar || selectedUser.avatar} 
                      alt={msg.from === "me" ? selectedUser.name : msg.user?.name || "User"} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-900 text-blue-300 text-sm">
                      {msg.from === "me" ? selectedUser.name.charAt(0) : (msg.user?.name.charAt(0) || "U")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Message content */}
                <div className="flex-1 max-w-[80%]">
                  {/* Name and timestamp */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-blue-300">
                      {msg.from === "me" ? selectedUser.name : (msg.user?.name || "Anonymous")}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {msg.timestamp 
                        ? new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                        : new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                      }
                    </span>
                  </div>
                  
                  {/* Message bubble */}
                  <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-r-xl rounded-bl-xl mb-1">
                    {/* Regular text message */}
                    {(!msg.messageType || msg.messageType === 'text') && (
                      <p className="text-white">{msg.text}</p>
                    )}
                    
                    {/* Image attachment */}
                    {msg.messageType === 'image' && (
                      <div className="mt-2">
                        <ImagePreview src={msg.attachment} alt="Shared image" />
                      </div>
                    )}
                    
                    {/* YouTube embed */}
                    {msg.messageType === 'youtube' && (
                      <div className="mt-2">
                        <YouTubeEmbed url={msg.text} />
                      </div>
                    )}
                    
                    {/* Link preview */}
                    {msg.messageType === 'link' && (
                      <div className="mt-2">
                        <p className="text-white mb-2">{msg.text}</p>
                        <LinkPreview url={msg.text} />
                      </div>
                    )}
                  </div>
                  
                  {/* Like button and count */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLikeMessage(idx)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        likedMessages[idx] 
                          ? 'text-red-400 bg-red-900/20' 
                          : 'text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      <Heart size={12} className={likedMessages[idx] ? 'fill-red-400' : ''} />
                      <span>
                        {msg.likeCount > 0 ? msg.likeCount : 'Like'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Attachment preview */}
          {messageType !== 'text' && attachmentUrl && (
            <div className="bg-zinc-800 border border-blue-500/30 rounded-lg p-3 mb-4 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-300">
                  {messageType === 'image' ? 'รูปภาพที่แนบ' : 
                   messageType === 'youtube' ? 'วิดีโอที่แนบ' : 'ลิงก์ที่แนบ'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setMessageType('text');
                    setAttachmentUrl('');
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
              
              {messageType === 'image' && (
                <ImagePreview src={attachmentUrl} alt="Attachment preview" />
              )}
              
              {messageType === 'youtube' && (
                <YouTubeEmbed url={attachmentUrl} />
              )}
              
              {messageType === 'link' && (
                <LinkPreview url={attachmentUrl} />
              )}
            </div>
          )}
          
          {isUploading && (
            <div className="text-center p-4">
              <div className="inline-block bg-zinc-800 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-zinc-300">กำลังอัปโหลด...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-gradient-to-r from-indigo-950 to-black border-t border-amber-500/30 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex flex-col">
            {/* Attachment options */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => fileInputRef.current.click()}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/30"
              >
                <ImageIcon size={18} className="mr-1" />
                <span className="text-xs">รูปภาพ</span>
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setMessageType('youtube');
                  setChatInput('https://youtube.com/');
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
              >
                <Youtube size={18} className="mr-1" />
                <span className="text-xs">YouTube</span>
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setMessageType('link');
                  setChatInput('https://');
                }}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
              >
                <LinkIcon size={18} className="mr-1" />
                <span className="text-xs">ลิงก์</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6 mx-2" />
              
              <div className="ml-auto flex items-center gap-1 text-xs text-zinc-400">
                <MessageSquare size={14} />
                <span>กำลังพิมพ์...</span>
              </div>
            </div>
            
            {/* Text input and send button */}
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="พิมพ์ข้อความ..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-500/30 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none min-h-[50px] max-h-32"
                  rows="1"
                  style={{ 
                    overflow: 'hidden',
                    resize: 'none'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className="absolute right-2 bottom-2 text-amber-400 hover:text-amber-300"
                >
                  <Smile size={20} />
                </Button>
              </div>
              
              <Button 
                type="submit"
                disabled={(!chatInput.trim() && messageType === 'text') || !isConnected || isUploading}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-xl h-[50px] w-[50px] flex items-center justify-center disabled:opacity-50"
              >
                <Send size={20} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
