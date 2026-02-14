"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VideoCall } from "@/components/VideoCall";
import { useLanguage } from "@/context/LanguageContext";
import { Volume2, Copy, Users, Video, Link as LinkIcon, ArrowLeft } from "lucide-react";

export default function MeetPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const [meetingLink, setMeetingLink] = useState<string>("");
    const [joinRoomId, setJoinRoomId] = useState<string>("");

    // Check if joining via link
    useEffect(() => {
        const room = searchParams.get('room');
        if (room) {
            setRoomId(room);
            setIsInCall(true);
            setMeetingLink(window.location.href);
        }
    }, [searchParams]);

    const speak = (text: string) => {
        if (ttsEnabled && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Generate a random room ID
    const generateRoomId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    // Create a new meeting
    const createMeeting = () => {
        const newRoomId = generateRoomId();
        setRoomId(newRoomId);
        const link = `${window.location.origin}/meet?room=${newRoomId}`;
        setMeetingLink(link);
        setIsInCall(true);
        // Update URL without reload
        router.push(`/meet?room=${newRoomId}`);
    };

    // Join an existing meeting
    const joinMeeting = () => {
        if (joinRoomId.trim()) {
            setRoomId(joinRoomId.trim());
            setIsInCall(true);
            const link = `${window.location.origin}/meet?room=${joinRoomId.trim()}`;
            setMeetingLink(link);
            router.push(`/meet?room=${joinRoomId.trim()}`);
        }
    };

    // Copy meeting link to clipboard
    const copyLink = () => {
        navigator.clipboard.writeText(meetingLink);
        alert('Meeting link copied to clipboard!');
    };

    // Leave meeting
    const leaveMeeting = () => {
        setIsInCall(false);
        setRoomId(null);
        setMeetingLink("");
        setJoinRoomId("");
        router.push('/meet');
    };

    useEffect(() => {
        if (ttsEnabled && !isInCall) {
            speak("Video call page. Create a new meeting or join an existing one.");
        }
    }, [ttsEnabled, isInCall]);

    // If in call, show video call interface
    if (isInCall && roomId) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-start px-4 py-12 pt-24 animate-fade-in">
                <div className="w-full max-w-7xl mx-auto flex flex-col">
                    {/* Header with Meeting Info */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={leaveMeeting}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Meeting Room</h1>
                                <p className="text-sm text-slate-400">Room ID: {roomId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {meetingLink && (
                                <button
                                    onClick={copyLink}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Link
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setTtsEnabled(!ttsEnabled);
                                    if (!ttsEnabled) {
                                        speak("Text to speech enabled");
                                    }
                                }}
                                className={`btn-icon ${ttsEnabled ? "bg-indigo-500/20 text-indigo-400" : ""}`}
                                title="Toggle Text to Speech"
                            >
                                <Volume2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Video Call Component */}
                    <div className="animate-slide-down">
                        <VideoCall roomId={roomId} />
                    </div>
                </div>
            </div>
        );
    }

    // Show create/join interface
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-start px-4 py-12 pt-24 animate-fade-in">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-scale-in">
                        {t("nav.meet")}
                    </h1>
                    <button
                        onClick={() => {
                            setTtsEnabled(!ttsEnabled);
                            if (!ttsEnabled) {
                                speak("Text to speech enabled");
                            }
                        }}
                        className={`btn-icon ${ttsEnabled ? "bg-indigo-500/20 text-indigo-400" : ""}`}
                        title="Toggle Text to Speech"
                    >
                        <Volume2 size={24} />
                    </button>
                </div>

                {/* Create/Join Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create New Meeting */}
                    <div className="glass-panel p-8 animate-slide-down">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <Video className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">New Meeting</h2>
                        </div>
                        <p className="text-slate-400 mb-6">
                            Start an instant meeting and share the link with others to join.
                        </p>
                        <button
                            onClick={createMeeting}
                            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <Video className="w-5 h-5" />
                            Start Meeting
                        </button>
                    </div>

                    {/* Join Meeting */}
                    <div className="glass-panel p-8 animate-slide-down" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Join Meeting</h2>
                        </div>
                        <p className="text-slate-400 mb-6">
                            Enter a meeting ID or paste a meeting link to join.
                        </p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter Meeting ID or Link"
                                value={joinRoomId}
                                onChange={(e) => {
                                    // Extract room ID from full URL if pasted
                                    const input = e.target.value;
                                    const urlMatch = input.match(/room=([a-z0-9]+)/i);
                                    if (urlMatch) {
                                        setJoinRoomId(urlMatch[1]);
                                    } else {
                                        setJoinRoomId(input);
                                    }
                                }}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        joinMeeting();
                                    }
                                }}
                            />
                            <button
                                onClick={joinMeeting}
                                disabled={!joinRoomId.trim()}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <LinkIcon className="w-5 h-5" />
                                Join Meeting
                            </button>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        How it works
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Click "Start Meeting" to create a new room and get a shareable link</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Share the link with others to invite them to join</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Or enter a meeting ID to join an existing meeting</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>After joining, enable translation features for sign language communication</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
