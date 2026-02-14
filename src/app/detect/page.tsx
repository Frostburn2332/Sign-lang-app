"use client";

import { useState, useEffect } from "react";
import { Camera } from "@/components/Camera";
import { useLanguage } from "@/context/LanguageContext";
import { Volume2, VolumeX, Info, Sun, Maximize } from "lucide-react";

export default function DetectPage() {
    const { t } = useLanguage();
    const [ttsEnabled, setTtsEnabled] = useState(false);

    const speak = (text: string) => {
        if (ttsEnabled && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        if (ttsEnabled) speak(t("detect.intro"));
    }, [ttsEnabled]);

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-start px-2 py-12 pt-24 animate-fade-in">

            <div className="w-full max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 px-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-scale-in mb-2">
                            {t("nav.detect")}
                        </h1>
                        <p className="text-slate-400 text-lg">
                            {t("detect.subtitle")}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-300">
                                {t("detect.cameraActive")}
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                setTtsEnabled(!ttsEnabled);
                                if (!ttsEnabled) speak(t("learn.ttsEnabled"));
                            }}
                            className={`btn ${ttsEnabled ? "btn-primary" : "btn-secondary"}`}
                        >
                            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            <span className="text-sm">{t("detect.voiceFeedback")}</span>
                        </button>
                    </div>
                </div>

                {/* CAMERA CONTAINER */}
                <div className="w-full animate-slide-down mb-8">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
                        <Camera ttsEnabled={ttsEnabled} />
                    </div>
                </div>

                {/* DETECTED TEXT BELOW CAMERA */}
                <div id="detected-text-anchor" className="mt-6"></div>

                {/* TIPS SECTION */}
                <div className="mt-12 space-y-6 px-4 animate-slide-down" style={{ animationDelay: "0.2s" }}>
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Info className="text-indigo-400" size={20} />
                            {t("detect.bestPractices")}
                        </h3>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-slate-800 h-fit">
                                    <Sun size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-200">{t("detect.lighting")}</h4>
                                    <p className="text-sm text-slate-400">{t("detect.lightingDesc")}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-slate-800 h-fit">
                                    <Maximize size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-200">{t("detect.positioning")}</h4>
                                    <p className="text-sm text-slate-400">{t("detect.positioningDesc")}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-slate-800 h-fit">
                                    <Info size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-200">{t("detect.background")}</h4>
                                    <p className="text-sm text-slate-400">{t("detect.backgroundDesc")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                        <h3 className="font-bold text-white mb-2">{t("detect.didYouKnow")}</h3>
                        <p className="text-sm text-slate-400">{t("detect.didYouKnowDesc")}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}