'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/Button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, PenTool } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'whiteboard' | 'chat'>('video');
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const isDrawing = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Connect to Socket.io Server
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://powerhour-pyj1.onrender.com';
    const newSocket = io(apiUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join-room', roomId);
    });

    // Chat listener
    newSocket.on('chat-message', (data) => {
      setMessages(prev => [...prev, { sender: 'Partner', text: data.encryptedPayload }]);
    });

    // Whiteboard listener
    newSocket.on('whiteboard-draw', (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    });

    setSocket(newSocket);

    // Setup Local Camera (Mocking WebRTC setup for UI prototype)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Camera access denied", err));
    }

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In full WebRTC, toggle the audio track enabled state here
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In full WebRTC, toggle the video track enabled state here
  };

  const handleEndCall = () => {
    window.location.href = '/dashboard';
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    
    socket.emit('chat-message', { roomId, encryptedPayload: chatInput });
    setMessages(prev => [...prev, { sender: 'You', text: chatInput }]);
    setChatInput('');
  };

  // Basic Canvas Drawing
  const startDrawing = (e: React.MouseEvent) => {
    isDrawing.current = true;
    draw(e);
  };
  const stopDrawing = () => {
    isDrawing.current = false;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current || !socket || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563eb';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit('whiteboard-draw', { roomId, drawingData: { x, y } });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      
      {/* Top Header */}
      <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950">
        <div className="font-bold text-lg">PowerHour Lesson <span className="text-gray-500 text-sm ml-2 font-normal">Room: {roomId.slice(0,8)}</span></div>
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
          <button onClick={() => setActiveTab('video')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'video' ? 'bg-gray-700' : 'text-gray-400 hover:text-white'}`}>Video</button>
          <button onClick={() => setActiveTab('whiteboard')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'whiteboard' ? 'bg-gray-700' : 'text-gray-400 hover:text-white'}`}>Whiteboard</button>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-2 text-sm text-green-400"><span className="h-2 w-2 rounded-full bg-green-500"></span> Connected</span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span> Connecting...</span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Stage (Video or Whiteboard) */}
        <div className="flex-1 relative p-4 flex items-center justify-center">
          
          {activeTab === 'video' ? (
            <div className="w-full h-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden border border-gray-800 relative">
              {/* Remote Video (Mocked as blank for now until peer connects) */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-xl font-medium">
                Waiting for partner to join...
              </div>
              <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
              
              {/* Local Video (PiP) */}
              <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl">
                {!isVideoOff ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <VideoOff className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-white rounded-xl overflow-hidden relative cursor-crosshair">
              <canvas 
                ref={canvasRef} 
                width={1200} 
                height={800} 
                className="w-full h-full"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
              />
              <div className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-1.5 rounded text-sm shadow-lg pointer-events-none">
                <PenTool className="h-4 w-4 inline mr-2" />
                Shared Whiteboard Sync Active
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Chat) */}
        <div className="w-80 border-l border-gray-800 bg-gray-950 flex flex-col">
          <div className="h-14 border-b border-gray-800 flex items-center px-4 font-semibold gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" /> Lesson Chat
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${msg.sender === 'You' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 border-t border-gray-800 bg-gray-950 flex items-center justify-center gap-4 px-6">
        <button 
          onClick={toggleMute} 
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        
        <button 
          onClick={toggleVideo} 
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>

        <button 
          onClick={handleEndCall} 
          className="h-12 px-6 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors gap-2 font-medium ml-4"
        >
          <PhoneOff className="h-5 w-5" /> Leave Room
        </button>
      </div>

    </div>
  );
}
