import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Mic,
  MicOff,
  Users,
  MessageCircle,
  Monitor,
  X,
  Send,
  Settings,
  Ban,
  Shield,
  Music,
  Radio,
  Headphones,
  Wifi,
  WifiOff,
  Speaker,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DJDashboard() {
  const { user } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSong, setCurrentSong] = useState('ไม่มีข้อมูลเพลง');
  const [volume, setVolume] = useState(50);
  const [isMicOn, setIsMicOn] = useState(false);
  const [djChat, setDjChat] = useState([]);
  const [djChatInput, setDjChatInput] = useState('');
  const [listeners, setListeners] = useState(45);
  const [djRequests, setDjRequests] = useState([
    { id: 1, user: 'ผู้ใช้ A', message: 'ขอเพลง "เพลงรัก"', status: 'pending' },
    { id: 2, user: 'ผู้ใช้ B', message: 'เปิดเพลงเศร้า ๆ หน่อย', status: 'pending' }
  ]);
  const [showStreamGuide, setShowStreamGuide] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [isSystemAudioEnabled, setIsSystemAudioEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Initialize audio streaming
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start system audio capture
  const startSystemAudioCapture = async () => {
    try {
      // Request screen capture with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });

      // Create audio context
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const gainNode = audioCtx.createGain();
      const destination = audioCtx.createMediaStreamDestination();

      // Connect audio nodes
      source.connect(gainNode);
      gainNode.connect(destination);
      gainNode.gain.value = volume / 100;

      // Store references
      streamRef.current = stream;
      audioContextRef.current = audioCtx;
      gainNodeRef.current = gainNode;

      setAudioStream(stream);
      setAudioContext(audioCtx);
      setIsSystemAudioEnabled(true);
      setIsStreaming(true);

      // Handle stream end
      stream.getVideoTracks().forEach(track => {
        track.onended = () => {
          stopSystemAudioCapture();
        };
      });

      console.log('System audio capture started');
    } catch (error) {
      console.error('Error starting system audio capture:', error);
      alert('ไม่สามารถเข้าถึงเสียงระบบได้ กรุณาอนุญาตการแชร์หน้าจอพร้อมเสียง');
    }
  };

  // Stop system audio capture
  const stopSystemAudioCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioStream(null);
    setAudioContext(null);
    setIsSystemAudioEnabled(false);
    setIsStreaming(false);
    setCurrentSong('ไม่มีข้อมูลเพลง');
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  // Handle DJ chat
  const handleDJChat = (e) => {
    e.preventDefault();
    if (!djChatInput.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      user: 'DJ ' + user.username,
      message: djChatInput,
      timestamp: new Date(),
      isDJ: true
    };
    
    setDjChat(prev => [...prev, newMessage]);
    setDjChatInput('');
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    if (!isMicOn) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Here you would typically send this to your streaming server
        setIsMicOn(true);
        console.log('Microphone enabled');
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('ไม่สามารถเข้าถึงไมโครโฟนได้');
      }
    } else {
      setIsMicOn(false);
      console.log('Microphone disabled');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-full">
              <Radio size={32} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-purple-400">DJ Dashboard</h1>
              <p className="text-zinc-400">สวัสดี DJ {user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
              <Users size={16} className="text-green-400" />
              <span className="text-green-400 font-medium">{listeners} คนฟัง</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowStreamGuide(true)}
              className="gap-2"
            >
              <Headphones size={16} />
              วิธีสตรีม
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Player & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Audio Streaming */}
          <Card className="bg-zinc-900 border-purple-500/30">
            <CardHeader>
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <Radio size={20} />
                สตรีมเสียงจากระบบ
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stream Status */}
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full ${isStreaming ? 'bg-green-500/20' : 'bg-zinc-700'}`}>
                    {isStreaming ? <Wifi size={24} className="text-green-400" /> : <WifiOff size={24} className="text-zinc-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {isStreaming ? 'กำลังสตรีมเสียง' : 'ไม่ได้สตรีม'}
                    </h3>
                    <p className="text-zinc-400">
                      {isStreaming ? 'เสียงจากโปรแกรมในคอมพิวเตอร์' : 'คลิกเริ่มสตรีมเพื่อแชร์เสียง'}
                    </p>
                  </div>
                </div>
                
                {/* Stream Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant={isStreaming ? "default" : "outline"}
                    size="lg"
                    onClick={isStreaming ? stopSystemAudioCapture : startSystemAudioCapture}
                    className="gap-2"
                  >
                    {isStreaming ? (
                      <>
                        <Pause size={20} />
                        หยุดสตรีม
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        เริ่มสตรีม
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <Volume2 size={20} />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="flex-1"
                      disabled={!isStreaming}
                    />
                    <span className="text-sm text-zinc-400 w-12">{volume}%</span>
                  </div>
                </div>

                {/* Current Audio Info */}
                {isStreaming && (
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Speaker size={20} className="text-purple-400" />
                      <div>
                        <p className="text-white font-medium">สตรีมเสียงจากระบบ</p>
                        <p className="text-zinc-400 text-sm">เสียงจากโปรแกรมที่เปิดอยู่ในคอมพิวเตอร์</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mic Control */}
                <div className="flex items-center gap-4 pt-4 border-t border-zinc-700">
                  <Button
                    variant={isMicOn ? "default" : "outline"}
                    onClick={toggleMicrophone}
                    className="gap-2"
                  >
                    {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                    {isMicOn ? 'ไมค์เปิด' : 'ไมค์ปิด'}
                  </Button>
                  <div className="text-sm text-zinc-400">
                    {isMicOn ? 'คุณสามารถพูดคุยกับผู้ฟังได้' : 'กดเพื่อเปิดไมค์'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stream Information */}
          <Card className="bg-zinc-900 border-purple-500/30">
            <CardHeader>
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <Monitor size={20} />
                ข้อมูลการสตรีม
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-blue-400" />
                      <span className="text-sm text-zinc-400">ผู้ฟัง</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{listeners}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Radio size={16} className="text-green-400" />
                      <span className="text-sm text-zinc-400">สถานะ</span>
                    </div>
                    <p className={`text-lg font-bold ${isStreaming ? 'text-green-400' : 'text-red-400'}`}>
                      {isStreaming ? 'กำลังสตรีม' : 'ออฟไลน์'}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-2">วิธีการใช้งาน:</h3>
                  <ul className="text-sm text-zinc-300 space-y-1">
                    <li>1. เปิดโปรแกรมเพลงในคอมพิวเตอร์ (Spotify, YouTube Music, etc.)</li>
                    <li>2. คลิก "เริ่มสตรีม" และเลือกแชร์หน้าจอพร้อมเสียง</li>
                    <li>3. เล่นเพลงในโปรแกรม ผู้ฟังจะได้ยินเสียงแบบเรียลไทม์</li>
                    <li>4. ใช้ไมค์เพื่อพูดคุยกับผู้ฟัง</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Settings size={16} className="text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-yellow-400 mb-1">เคล็ดลับ:</h4>
                      <p className="text-sm text-zinc-300">
                        ปรับระดับเสียงในโปรแกรมเพลงและใช้ slider ด้านบนเพื่อควบคุมเสียงที่ส่งให้ผู้ฟัง
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chat & Requests */}
        <div className="space-y-6">
          {/* DJ Chat */}
          <Card className="bg-zinc-900 border-purple-500/30">
            <CardHeader>
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <MessageCircle size={20} />
                แชท DJ
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {djChat.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={msg.isDJ ? 'bg-purple-500' : 'bg-zinc-600'}>
                        {msg.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${msg.isDJ ? 'text-purple-400' : 'text-white'}`}>
                          {msg.user}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(msg.timestamp).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleDJChat} className="flex gap-2">
                <input
                  type="text"
                  value={djChatInput}
                  onChange={(e) => setDjChatInput(e.target.value)}
                  placeholder="พิมพ์ข้อความถึงผู้ฟัง..."
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button type="submit" size="sm">
                  <Send size={16} />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Listener Requests */}
          <Card className="bg-zinc-900 border-purple-500/30">
            <CardHeader>
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <Users size={20} />
                คำขอจากผู้ฟัง
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {djRequests.map((request) => (
                  <div key={request.id} className="bg-zinc-800 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-white">{request.user}</p>
                        <p className="text-sm text-zinc-400">{request.message}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status === 'pending' ? 'รอดำเนินการ' :
                         request.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                      </span>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-400 border-green-400 hover:bg-green-500/20"
                          onClick={() => {
                            setDjRequests(prev => prev.map(r =>
                              r.id === request.id ? {...r, status: 'approved'} : r
                            ));
                          }}
                        >
                          อนุมัติ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400 hover:bg-red-500/20"
                          onClick={() => {
                            setDjRequests(prev => prev.map(r =>
                              r.id === request.id ? {...r, status: 'rejected'} : r
                            ));
                          }}
                        >
                          ปฏิเสธ
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stream Guide Modal */}
      {showStreamGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-zinc-700">
              <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                <Headphones size={24} />
                วิธีการสตรีมเพลงเป็น DJ
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStreamGuide(false)}
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-3">🎵 วิธีการสตรีมเสียงจากระบบ</h3>
                <ol className="space-y-2 text-sm text-zinc-300">
                  <li>1. เปิดโปรแกรมเพลงในคอมพิวเตอร์ (Spotify, YouTube Music, Apple Music, etc.)</li>
                  <li>2. คลิกปุ่ม "เริ่มสตรีม" ในหน้า DJ Dashboard</li>
                  <li>3. เลือก "แชร์หน้าจอ" และเปิดใช้งาน "แชร์เสียงระบบ"</li>
                  <li>4. เล่นเพลงในโปรแกรม ผู้ฟังจะได้ยินเสียงแบบเรียลไทม์</li>
                  <li>5. ใช้ slider ปรับระดับเสียงที่ส่งให้ผู้ฟัง</li>
                </ol>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-3">🎤 การใช้ไมโครโฟน</h3>
                <ol className="space-y-2 text-sm text-zinc-300">
                  <li>1. คลิกปุ่ม "ไมค์ปิด" เพื่อเปิดไมโครโฟน</li>
                  <li>2. อนุญาตให้เบราว์เซอร์เข้าถึงไมโครโฟนของคุณ</li>
                  <li>3. พูดคุยกับผู้ฟังได้แบบเรียลไทม์</li>
                  <li>4. ปิดไมค์เมื่อเล่นเพลงเพื่อคุณภาพเสียงที่ดี</li>
                </ol>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-green-400 mb-3">💬 การแชทกับผู้ฟัง</h3>
                <ol className="space-y-2 text-sm text-zinc-300">
                  <li>1. ใช้กล่องแชท DJ เพื่อส่งข้อความถึงผู้ฟัง</li>
                  <li>2. ตอบคำขอเพลงจากผู้ฟังในส่วน "คำขอจากผู้ฟัง"</li>
                  <li>3. สร้างบรรยากาศที่ดีด้วยการโต้ตอบ</li>
                </ol>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">⚠️ ข้อควรระวัง</h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• ใช้เพลงที่มีลิขสิทธิ์ถูกต้องเท่านั้น</li>
                  <li>• รักษามารยาทในการพูดคุย</li>
                  <li>• ตรวจสอบคุณภาพเสียงและระดับเสียงก่อนเริ่มสตรีม</li>
                  <li>• ปิดโปรแกรมอื่นที่อาจส่งเสียงรบกวน</li>
                  <li>• ใช้หูฟังเพื่อป้องกัน feedback เสียง</li>
                  <li>• Admin สามารถระงับสิทธิ์ได้หากมีการใช้งานที่ไม่เหมาะสม</li>
                </ul>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-green-400 mb-3">💡 เคล็ดลับเพิ่มเติม</h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• สามารถสตรีมจากโปรแกรมใดก็ได้ที่เล่นเสียงในคอมพิวเตอร์</li>
                  <li>• ไม่ต้องอัพโหลดไฟล์ ประหยัดพื้นที่เซิร์ฟเวอร์</li>
                  <li>• เสียงจะถูกส่งแบบเรียลไทม์ไปยังผู้ฟัง</li>
                  <li>• สามารถเปลี่ยนเพลงได้ทันทีในโปรแกรมเพลง</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}