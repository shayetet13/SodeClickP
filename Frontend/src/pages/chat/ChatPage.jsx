import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../components/ui/notification';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import {
  MessageCircle,
  Send,
  Image,
  Smile,
  ChevronLeft,
  X,
  Clock,
  Phone,
  Video,
  MoreHorizontal,
  Search,
  ThumbsUp,
  Heart,
  PaperclipIcon
} from 'lucide-react';

const ChatPage = () => {
  const { username } = useParams(); // รับ username จาก URL params
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ถ้าได้รับ username จาก params และมี receiver จาก location state
  // จะเลือกบทสนทนานั้นโดยอัตโนมัติ
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // โหลดข้อมูลบทสนทนาทั้งหมด
    fetchConversations();

    // ถ้ามี username จาก params จะเลือกบทสนทนานั้นโดยอัตโนมัติ
    if (username && location.state?.receiver) {
      const { receiver } = location.state;
      // ตรวจสอบว่ามีบทสนทนากับผู้ใช้นี้แล้วหรือไม่
      const existingConversation = conversations.find(
        conv => conv.user.username === username
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // สร้างบทสนทนาใหม่
        const newConversation = {
          id: Date.now().toString(),
          user: receiver,
          lastMessage: '',
          unreadCount: 0,
          timestamp: new Date()
        };
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
      }
    }
  }, [isAuthenticated, username, location.state]);

  // เลื่อนไปที่ข้อความล่าสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // โหลดข้อความเมื่อเลือกบทสนทนา
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      
      // โหลดข้อมูลเพิ่มเติมของผู้ใช้เมื่อเลือกบทสนทนา
      fetchUserDetails(selectedConversation.user.username);
    }
  }, [selectedConversation]);
  
  // ฟังก์ชั่นเพื่อโหลดข้อมูลเพิ่มเติมของผู้ใช้
  const fetchUserDetails = async (username) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('ไม่พบ token การเข้าสู่ระบบ');
      }
      
      const response = await fetch(`http://localhost:5000/api/profile/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // อัพเดทข้อมูลผู้ใช้ในบทสนทนาที่เลือก
        setConversations(prev => 
          prev.map(conv => {
            if (conv.user.username === username) {
              return {
                ...conv,
                user: {
                  ...conv.user,
                  ...data.data,
                  bio: data.data.bio || '',
                  occupation: data.data.occupation || '',
                  personalDetails: data.data.personalDetails || {},
                  interests: data.data.interests || []
                }
              };
            }
            return conv;
          })
        );
        
        // อัพเดทบทสนทนาที่เลือกด้วย
        if (selectedConversation && selectedConversation.user.username === username) {
          setSelectedConversation(prev => ({
            ...prev,
            user: {
              ...prev.user,
              ...data.data,
              bio: data.data.bio || '',
              occupation: data.data.occupation || '',
              personalDetails: data.data.personalDetails || {},
              interests: data.data.interests || []
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('ไม่พบ token การเข้าสู่ระบบ');
      }
      
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setConversations(data.data);
        
        // ถ้ามี username จาก params ให้เลือกบทสนทนานั้น
        if (username) {
          const conversation = data.data.find(
            conv => conv.user.username === username
          );
          if (conversation) {
            setSelectedConversation(conversation);
          }
        }
      } else {
        throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      showError('ไม่สามารถโหลดข้อมูลการสนทนาได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('ไม่พบ token การเข้าสู่ระบบ');
      }
      
      const response = await fetch(`http://localhost:5000/api/chat/messages/${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
        
        // อัปเดตสถานะข้อความเป็นอ่านแล้ว
        if (data.data.length > 0) {
          updateMessageStatus(conversationId);
        }
      } else {
        throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('ไม่สามารถโหลดข้อความได้');
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() && !attachment) {
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'currentUser',
      text: message,
      image: attachment,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setAttachment(null);
    
    // อัพเดต conversation ด้วยข้อความล่าสุด
    if (selectedConversation) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            lastMessage: message || 'ส่งรูปภาพ',
            timestamp: new Date()
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
    }

    // จำลองการส่งข้อมูลไปยัง API
    console.log('Sending message:', newMessage);
  };

  const handleAttachFile = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // สำหรับตัวอย่าง เราจะใช้ URL.createObjectURL เพื่อแสดงตัวอย่างรูป
      setAttachment(URL.createObjectURL(file));
    } else {
      showError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === now.toDateString()) {
      return 'วันนี้';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'เมื่อวาน';
    }
    
    return messageDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null; // จะถูก redirect ไปที่หน้า login ใน useEffect
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Conversation List */}
          <div className="md:col-span-4 lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-medium text-slate-800">
                    ข้อความ
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                    <MoreHorizontal size={18} />
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="ค้นหาข้อความ"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="h-[calc(80vh-10rem)] overflow-y-auto p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {conversations.map(conversation => (
                      <div
                        key={conversation.id}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          setShowUserInfo(false); // ปิดข้อมูลผู้ใช้เมื่อเลือกบทสนทนาใหม่
                        }}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12 border border-slate-200">
                            <AvatarImage src={conversation.user.avatar} alt={conversation.user.firstName} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {conversation.user.firstName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            conversation.user.online ? 'bg-green-500' : 'bg-slate-300'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-slate-800 truncate">
                              {conversation.user.firstName} {conversation.user.lastName}
                            </h3>
                            <span className="text-xs text-slate-500">
                              {formatTime(conversation.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageCircle className="text-slate-300 h-12 w-12 mb-3" />
                    <p className="text-slate-500">ยังไม่มีข้อความ</p>
                    <p className="text-slate-400 text-sm mt-1">เริ่มต้นการสนทนาโดยส่งข้อความหาเพื่อนของคุณ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-8 lg:col-span-9">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="md:hidden text-slate-500"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.firstName} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {selectedConversation.user.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-slate-800">
                          {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {selectedConversation.user.online ? (
                            <>
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                              ออนไลน์
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              ออนไลน์ล่าสุด 2 ชั่วโมงที่แล้ว
                            </>
                          )}
                        </p>
                        {selectedConversation.user.location && (
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="inline-block">📍 {selectedConversation.user.location}</span>
                          </p>
                        )}
                        {selectedConversation.user.interests && selectedConversation.user.interests.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="inline-block">❤️ {selectedConversation.user.interests.join(', ')}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                        <Phone size={18} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                        <Video size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 hover:text-slate-700"
                        onClick={() => setShowUserInfo(!showUserInfo)}
                      >
                        <MoreHorizontal size={18} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* User Info Panel - จะปรากฏเมื่อกดปุ่ม More */}
                {showUserInfo && selectedConversation && (
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800">เกี่ยวกับ {selectedConversation.user.firstName}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 h-8 w-8 p-0"
                        onClick={() => setShowUserInfo(false)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedConversation.user.bio && (
                        <div className="md:col-span-2">
                          <p className="text-slate-600">
                            <span className="font-medium text-slate-700 block mb-1">ประวัติโดยย่อ:</span>
                            {selectedConversation.user.bio}
                          </p>
                        </div>
                      )}
                      
                      {selectedConversation.user.age && (
                        <div>
                          <span className="font-medium text-slate-700">อายุ:</span> {selectedConversation.user.age} ปี
                        </div>
                      )}
                      
                      {selectedConversation.user.location && (
                        <div>
                          <span className="font-medium text-slate-700">ที่อยู่:</span> {selectedConversation.user.location}
                        </div>
                      )}
                      
                      {selectedConversation.user.occupation && (
                        <div>
                          <span className="font-medium text-slate-700">อาชีพ:</span> {selectedConversation.user.occupation}
                        </div>
                      )}
                      
                      {selectedConversation.user.interests && selectedConversation.user.interests.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-slate-700 block mb-1">ความสนใจ:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedConversation.user.interests.map((interest, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedConversation.user.personalDetails && (
                        <div className="md:col-span-2 mt-2">
                          <span className="font-medium text-slate-700 block mb-1">ข้อมูลส่วนตัว:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            {selectedConversation.user.personalDetails.height && (
                              <div>
                                <span className="text-slate-600">ส่วนสูง:</span> {selectedConversation.user.personalDetails.height} ซม.
                              </div>
                            )}
                            {selectedConversation.user.personalDetails.bodyType && (
                              <div>
                                <span className="text-slate-600">รูปร่าง:</span> {selectedConversation.user.personalDetails.bodyType}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => navigate(`/profile/${selectedConversation.user.username}`)}
                      >
                        ดูโปรไฟล์เต็ม
                      </Button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(80vh-12rem)]">
                  {/* Date Separator */}
                  <div className="flex items-center justify-center">
                    <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
                      {formatDate(messages[0]?.timestamp || new Date())}
                    </div>
                  </div>

                  {/* Messages */}
                  {messages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === (user?.id || 'currentUser');
                    const showDate = index > 0 && 
                      formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp);
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center">
                            <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
                              {formatDate(msg.timestamp)}
                            </div>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 mb-1">
                                <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.firstName} />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {selectedConversation.user.firstName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex flex-col">
                              <div className={`rounded-2xl p-3 ${isCurrentUser 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                              }`}>
                                {msg.image && (
                                  <img 
                                    src={msg.image} 
                                    alt="Attached" 
                                    className="rounded-lg mb-2 max-w-full" 
                                  />
                                )}
                                {msg.text}
                              </div>
                              <div className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : ''} text-slate-500`}>
                                {formatTime(msg.timestamp)}
                                {isCurrentUser && (
                                  <span className="ml-1">
                                    {msg.status === 'read' ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 flex-shrink-0">
                  {attachment && (
                    <div className="mb-3 relative inline-block">
                      <img 
                        src={attachment} 
                        alt="Attached preview" 
                        className="h-20 rounded-md border border-slate-200" 
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => {
                          URL.revokeObjectURL(attachment);
                          setAttachment(null);
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="พิมพ์ข้อความ..."
                        className="w-full border border-slate-200 rounded-2xl py-3 px-4 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="1"
                        style={{ minHeight: '50px', maxHeight: '120px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 bottom-2 text-slate-400 hover:text-slate-600"
                        onClick={() => {}}
                      >
                        <Smile size={20} />
                      </Button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleAttachFile}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-slate-700"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PaperclipIcon size={20} />
                    </Button>
                    <Button
                      variant="primary"
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 h-auto"
                      onClick={handleSendMessage}
                      disabled={!message.trim() && !attachment}
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="text-blue-200 h-20 w-20 mb-4" />
                <h3 className="text-xl font-medium text-slate-800 mb-2">ข้อความของคุณ</h3>
                <p className="text-slate-500 mb-6 max-w-md">
                  เลือกบทสนทนาจากรายการด้านซ้ายเพื่อดูข้อความ หรือเริ่มต้นการสนทนาใหม่
                </p>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  เริ่มต้นการสนทนาใหม่
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
