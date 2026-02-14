"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Volume2, VolumeX, Mic, MicOff, User } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { locale, setLocale, t } = useLanguage();
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [sttEnabled, setSttEnabled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkLogin = () => {
            const loggedIn = localStorage.getItem('isLoggedIn');
            const userData = localStorage.getItem('user');
            setIsLoggedIn(loggedIn === 'true');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };
        checkLogin();
        // Check login status periodically
        const interval = setInterval(checkLogin, 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleLanguage = () => {
        setLocale(locale === "en" ? "hi" : "en");
    };

    const toggleTTS = () => {
        setTtsEnabled(!ttsEnabled);
        if (!ttsEnabled) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("Text to speech enabled");
                utterance.lang = locale === "en" ? "en-US" : "hi-IN";
                window.speechSynthesis.speak(utterance);
            }
        } else {
            window.speechSynthesis?.cancel();
        }
    };

    const toggleSTT = () => {
        setSttEnabled(!sttEnabled);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo and Nav Links */}
                    <div className="flex items-center gap-12">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            SignLingo
                        </Link>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                            {[
                                { href: "/", label: "nav.home" },
                                { href: "/learn", label: "nav.learn" },
                                { href: "/detect", label: "nav.detect" },
                                { href: "/meet", label: "nav.meet" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`transition-colors relative ${isActive(link.href)
                                        ? "text-white"
                                        : "hover:text-white"
                                        }`}
                                >
                                    {t(link.label)}
                                    {isActive(link.href) && (
                                        <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Controls */}
                    <div className="flex items-center gap-3">
                        {/* TTS Toggle */}
                        <button
                            onClick={toggleTTS}
                            className={`btn-icon ${ttsEnabled ? "bg-indigo-500/20 text-indigo-400" : ""}`}
                            title="Text to Speech"
                        >
                            {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>

                        {/* STT Toggle */}
                        <button
                            onClick={toggleSTT}
                            className={`btn-icon ${sttEnabled ? "bg-purple-500/20 text-purple-400" : ""}`}
                            title="Speech to Text"
                        >
                            {sttEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="ml-2 btn btn-secondary text-sm py-1.5"
                        >
                            {locale === "en" ? "हिंदी" : "English"}
                        </button>

                        {/* Profile/Dashboard Link */}
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className={`ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    isActive("/dashboard")
                                        ? "bg-indigo-500/20 text-indigo-400"
                                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                                }`}
                            >
                                <User size={16} />
                                <span className="hidden sm:inline">{user?.name || "Profile"}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="ml-2 btn btn-secondary text-sm py-1.5"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
