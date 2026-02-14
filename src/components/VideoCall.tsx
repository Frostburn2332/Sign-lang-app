"use client";

import { useState, useEffect, useRef } from "react";
import { Camera } from "./Camera";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Captions, Languages } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VideoCallProps {
    roomId: string;
}

interface Message {
    sender: string;
    text: string;
    timestamp: Date;
    type?: 'voice' | 'sign' | 'text';
}

export function VideoCall({ roomId }: VideoCallProps) {
    const [isCallActive, setIsCallActive] = useState(true); // Auto-start when in room
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [translationEnabled, setTranslationEnabled] = useState(false);
    const [detectedSign, setDetectedSign] = useState<string>("");
    const [signDetectionActive, setSignDetectionActive] = useState(false);
    const { isListening, transcript, startListening, stopListening, supported } = useSpeechRecognition();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleCall = () => setIsCallActive(!isCallActive);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simulate receiving messages from peer (in real app, this would come from WebRTC)
    useEffect(() => {
        if (isCallActive) {
            const interval = setInterval(() => {
                const phrases = [
                    "Hello!",
                    "How are you?",
                    "Nice to meet you.",
                    "I am learning sign language.",
                    "Can you see me?",
                    "This is working great!"
                ];
                const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
                setMessages((prev) => [...prev, { 
                    sender: "Peer", 
                    text: randomPhrase,
                    timestamp: new Date(),
                    type: 'text'
                }]);
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [isCallActive]);

    // Add transcript to messages when it changes
    useEffect(() => {
        if (transcript && transcript.trim()) {
            setMessages((prev) => [...prev, { 
                sender: "You (Voice)", 
                text: transcript,
                timestamp: new Date(),
                type: 'voice'
            }]);
        }
    }, [transcript]);

    // Simulate sign detection (in real app, this would come from Camera component)
    useEffect(() => {
        if (signDetectionActive && translationEnabled) {
            const interval = setInterval(() => {
                // Simulate detecting signs (in real app, this would come from MediaPipe)
                const signs = ['A', 'B', 'C', 'Hello', 'Thank You', 'Yes', 'No'];
                const randomSign = signs[Math.floor(Math.random() * signs.length)];
                setDetectedSign(randomSign);
                
                // Add to messages
                setMessages((prev) => [...prev, { 
                    sender: "You (Sign)", 
                    text: `Detected: ${randomSign}`,
                    timestamp: new Date(),
                    type: 'sign'
                }]);
            }, 3000);
            return () => clearInterval(interval);
        } else {
            setDetectedSign("");
        }
    }, [signDetectionActive, translationEnabled]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[80vh] w-full max-w-6xl mx-auto gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                {/* Local Video */}
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                    {!isVideoOff ? (
                        <div className="absolute inset-0">
                            <Camera />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                            <div className="text-center">
                                <VideoOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                <p>Camera Off</p>
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded-lg text-white text-sm font-medium">
                        You
                    </div>
                    {translationEnabled && signDetectionActive && detectedSign && (
                        <div className="absolute top-4 left-4 bg-indigo-600/90 px-4 py-2 rounded-lg text-white font-bold text-lg shadow-lg">
                            {detectedSign}
                        </div>
                    )}
                </div>

                {/* Remote Video */}
                <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl flex items-center justify-center">
                    {isCallActive ? (
                        <div className="text-center">
                            <div className="w-24 h-24 bg-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {roomId[0].toUpperCase()}
                            </div>
                            <p className="text-slate-300 font-medium">Waiting for peer to join...</p>
                            <p className="text-slate-500 text-sm mt-2">Room: {roomId}</p>
                        </div>
                    ) : (
                        <div className="text-slate-500">Call ended</div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded-lg text-white text-sm font-medium">
                        Remote Peer
                    </div>
                </div>
            </div>

            {/* Controls & Chat */}
            <div className="h-1/3 flex gap-4">
                <div className="flex-1 glass-panel p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <MessageSquare size={20} />
                            Live Transcript & Translation
                        </h3>
                        {translationEnabled && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                Translation Active
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No messages yet. Start speaking or enable sign detection.</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div 
                                    key={i} 
                                    className={`p-3 rounded-lg max-w-[85%] ${
                                        msg.sender.includes('You') 
                                            ? 'bg-indigo-600/50 ml-auto' 
                                            : 'bg-slate-700/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-slate-300 font-medium">{msg.sender}</p>
                                        <p className="text-xs text-slate-400">{formatTime(msg.timestamp)}</p>
                                    </div>
                                    <p className="text-white">{msg.text}</p>
                                    {msg.type === 'sign' && (
                                        <span className="inline-block mt-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                            Sign Language
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-3 p-4 glass-panel">
                    <button 
                        onClick={() => setIsMuted(!isMuted)} 
                        className={`p-4 rounded-full transition-colors ${
                            isMuted 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    
                    <button 
                        onClick={() => setIsVideoOff(!isVideoOff)} 
                        className={`p-4 rounded-full transition-colors ${
                            isVideoOff 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                        title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    
                    {supported && (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-4 rounded-full transition-colors ${
                                isListening 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                            title={isListening ? "Stop captions" : "Start captions"}
                        >
                            <Captions size={20} />
                        </button>
                    )}
                    
                    <button
                        onClick={() => {
                            setTranslationEnabled(!translationEnabled);
                            setSignDetectionActive(!translationEnabled);
                        }}
                        className={`p-4 rounded-full transition-colors ${
                            translationEnabled 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                        title={translationEnabled ? "Disable translation" : "Enable sign language translation"}
                    >
                        <Languages size={20} />
                    </button>
                    
                    <button 
                        onClick={toggleCall} 
                        className={`p-4 rounded-full transition-colors ${
                            isCallActive 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        title={isCallActive ? "End call" : "Start call"}
                    >
                        {isCallActive ? <PhoneOff size={20} /> : <Video size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
