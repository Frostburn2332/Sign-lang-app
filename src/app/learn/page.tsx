"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { SignCard } from "@/components/SignCard";
import { alphabets, words } from "@/lib/signData";
import { Volume2, Star, Camera as CameraIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Camera } from "@/components/Camera";

/* ================================================================
    MAIN LEARN PAGE
================================================================ */

export default function LearnPage() {
    const { t, locale } = useLanguage();
    const [activeTab, setActiveTab] = useState<"alphabets" | "words">("alphabets");
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [itemsViewed, setItemsViewed] = useState<Set<string>>(new Set());
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
    const [sessionPoints, setSessionPoints] = useState<number>(0);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    // PRACTICE STATE
    const [practiceOpen, setPracticeOpen] = useState<boolean>(false);
    const [selectedPractice, setSelectedPractice] = useState<string>("");
    const [detectedGesture, setDetectedGesture] = useState<string>("");

    // Handle gesture from Camera
    const handleGestureDetected = (gesture: string) => setDetectedGesture(gesture);

    // Check correctness
    const isCorrectGesture =
        !!(selectedPractice &&
            detectedGesture &&
            detectedGesture.toLowerCase().includes(selectedPractice.toLowerCase()));

    /* --------------------------
            Load TTS voices
    --------------------------- */
    useEffect(() => {
        const loadVoices = () => {
            if ("speechSynthesis" in window) {
                setVoices(window.speechSynthesis.getVoices());
            }
        };
        loadVoices();
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    /* --------------------------
            TTS Handler
    --------------------------- */
    const speak = useCallback(
        (text: string) => {
            if (!ttsEnabled || typeof window === "undefined") return;
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                const lang = locale === "hi" ? "hi-IN" : "en-US";
                utterance.lang = lang;

                const voice =
                    voices.find((v) => v.lang === lang) ||
                    voices.find((v) => v.lang.startsWith(lang.split("-")[0]));

                if (voice) utterance.voice = voice;
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            } catch { }
        },
        [ttsEnabled, locale, voices]
    );

    /* --------------------------
        Load stored progress
    --------------------------- */
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);

        const viewed = localStorage.getItem("learn_items_viewed");
        if (viewed) setItemsViewed(new Set(JSON.parse(viewed)));

        const pts = localStorage.getItem("learn_total_points");
        if (pts) setTotalPoints(Number(pts));
    }, []);

    useEffect(() => {
        localStorage.setItem("learn_items_viewed", JSON.stringify([...itemsViewed]));
        localStorage.setItem("learn_total_points", String(totalPoints));
    }, [itemsViewed, totalPoints]);

    /* --------------------------
             Track Learning
    --------------------------- */
    function trackLearning(type: "alphabet" | "word", id: string) {
        const key = `${type}-${id}`;
        // Allow re-tracking for "Practiced" status and recent activity updates
        // if (itemsViewed.has(key)) return;

        setItemsViewed((prev) => new Set(prev).add(key));
        setTotalPoints((p) => p + 5);
        setSessionPoints((p) => p + 5);

        setEarnedPoints(5);
        setTimeout(() => setEarnedPoints(null), 2200);

        if (userId) {
            fetch("/api/user/learn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, itemType: type, itemId: id }),
            }).catch(() => { });
        }
    }

    /* ================================================================
        RETURN UI
    ================================================================= */

    return (
        <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 pt-24 animate-fade-in relative">

            {/* Points Display */}
            <div className="fixed top-24 left-8 z-40 animate-slide-down">
                <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-md border-2 border-yellow-400/50 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
                    <Star className="w-7 h-7 text-yellow-400" />
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-2xl">{totalPoints}</span>
                        <span className="text-xs text-yellow-200">{t("learn.points")}</span>
                    </div>
                    {sessionPoints > 0 && <span className="text-green-300 font-bold">+{sessionPoints}</span>}
                </div>
            </div>

            {/* Earned Points Animation */}
            {earnedPoints && (
                <div className="fixed top-32 right-8 z-50 animate-bounce-in">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2">
                        <Star className="w-6 h-6 animate-spin-slow" />
                        +{earnedPoints} {t("learn.pointsEarned")}
                    </div>
                </div>
            )}

            <div className="w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-center gap-4 mb-8">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
                        {t("nav.learn")}
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-10">
                    <button
                        onClick={() => setActiveTab("alphabets")}
                        className={`btn px-8 py-3 rounded-full ${activeTab === "alphabets" ? "btn-primary" : "btn-secondary"
                            }`}
                    >
                        {t("learn.alphabets")}
                    </button>
                    <button
                        onClick={() => setActiveTab("words")}
                        className={`btn px-8 py-3 rounded-full ${activeTab === "words" ? "btn-primary" : "btn-secondary"
                            }`}
                    >
                        {t("learn.words")}
                    </button>
                </div>

                {/* PRACTICE PANEL */}
                <div
                    className="w-full flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-700 cursor-pointer"
                    onClick={() => setPracticeOpen((p) => !p)}
                >
                    <div className="flex items-center gap-3">
                        <CameraIcon className="text-indigo-400" />
                        <span className="text-white font-semibold">Practice With Camera</span>
                    </div>
                    {practiceOpen ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
                </div>

                {/* FLOATING CAMERA */}
                {practiceOpen && (
                    <DraggableFloatingCamera
                        selectedPractice={selectedPractice}
                        detectedGesture={detectedGesture}
                        isCorrectGesture={isCorrectGesture}
                        onGestureDetected={handleGestureDetected}
                    />
                )}

                {/* CARDS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-10 pb-40">
                    {activeTab === "alphabets"
                        ? alphabets.map((item) => (
                            <div
                                key={item.char}
                                onClick={() => {
                                    setSelectedPractice(item.char);
                                    speak(`${t("learn.letter")} ${item.char}`);
                                }}
                                className="cursor-pointer"
                            >
                                <SignCard
                                    title={item.char}
                                    image={item.image}
                                    isCompleted={itemsViewed.has(`alphabet-${item.char}`)}
                                    onComplete={() => trackLearning("alphabet", item.char)}
                                />
                            </div>
                        ))
                        : words.map((item) => {
                            const displayWord = locale === "hi" && item.hindi ? item.hindi : item.word;
                            return (
                                <div
                                    key={item.word}
                                    onClick={() => {
                                        setSelectedPractice(item.word);
                                        speak(displayWord);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <SignCard
                                        title={displayWord}
                                        image={item.image}
                                        isCompleted={itemsViewed.has(`word-${item.word}`)}
                                        onComplete={() => trackLearning("word", item.word)}
                                    />
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

function DraggableFloatingCamera({
    selectedPractice,
    detectedGesture,
    isCorrectGesture,
    onGestureDetected,
}: {
    selectedPractice: string;
    detectedGesture: string;
    isCorrectGesture: boolean;
    onGestureDetected: (gesture: string) => void;
}) {
    const dragRef = useRef<HTMLDivElement | null>(null);
    const pos = useRef({ x: 20, y: 140 });

    const onMouseDown = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;

        const origX = pos.current.x;
        const origY = pos.current.y;

        const onMove = (ev: MouseEvent) => {
            pos.current.x = origX + (ev.clientX - startX);
            pos.current.y = origY + (ev.clientY - startY);

            if (dragRef.current) {
                dragRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
            }
        };

        const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    return (
        <div
            ref={dragRef}
            className="fixed z-50 w-[360px] rounded-xl shadow-2xl border border-slate-600 bg-slate-900/80 backdrop-blur-xl overflow-hidden"
            style={{
                transform: `translate(${pos.current.x}px, ${pos.current.y}px)`,
            }}
        >
            {/* Header (Drag Area) */}
            <div
                className="cursor-move bg-slate-800/70 px-4 py-2 rounded-t-xl border-b border-slate-700 flex justify-between items-center"
                onMouseDown={onMouseDown}
            >
                <span className="text-white font-bold text-sm">
                    Practice: {selectedPractice || "None"}
                </span>
            </div>

            {/* Camera */}
            <Camera ttsEnabled={false} onGestureDetected={onGestureDetected} />

            {/* Result */}
            <div className="p-3 text-center">
                <p className="text-slate-300">
                    Detected: <span className="text-white font-bold">{detectedGesture || "..."}</span>
                </p>

                {selectedPractice && (
                    <div className="mt-2">
                        {isCorrectGesture ? (
                            <div className="text-green-400 text-lg font-bold">✔ Correct!</div>
                        ) : (
                            <div className="text-red-400 text-lg font-bold">✖ Try Again</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}