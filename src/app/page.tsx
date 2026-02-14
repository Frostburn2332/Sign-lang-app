"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Camera, Video } from "lucide-react";

export default function Home() {
    const { t } = useLanguage();

    const features = [
        {
            title: "Learn",
            desc: "Master sign language alphabets and words with interactive lessons.",
            href: "/learn",
            icon: BookOpen,
            gradient: "from-indigo-500 to-purple-500"
        },
        {
            title: "Detect",
            desc: "Real-time hand gesture recognition using advanced AI.",
            href: "/detect",
            icon: Camera,
            gradient: "from-purple-500 to-pink-500"
        },
        {
            title: "Meet",
            desc: "Video calls with real-time sign language translation.",
            href: "/meet",
            icon: Video,
            gradient: "from-pink-500 to-cyan-500"
        },
    ];

    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] lg:min-h-[600px]">
                    <div className="flex flex-col items-start text-left space-y-8 animate-slide-down">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                            {t("hero.title")}
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                Real-time AI
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                            {t("hero.subtitle")}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link
                                href="/learn"
                                className="btn btn-primary px-8 py-3 text-lg"
                            >
                                {t("hero.cta")}
                            </Link>
                            <Link
                                href="/detect"
                                className="btn btn-secondary px-8 py-3 text-lg"
                            >
                                Try Detection
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="relative hidden lg:flex items-center justify-center animate-fade-in">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                        <div className="relative grid grid-cols-2 gap-4 p-4">
                            <div className="space-y-4 mt-8">
                                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <BookOpen className="w-8 h-8 text-indigo-400 mb-4" />
                                    <div className="h-2 w-24 bg-slate-700 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-slate-700 rounded"></div>
                                </div>
                                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <Video className="w-8 h-8 text-pink-400 mb-4" />
                                    <div className="h-2 w-24 bg-slate-700 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-slate-700 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <Camera className="w-8 h-8 text-cyan-400 mb-4" />
                                    <div className="h-2 w-24 bg-slate-700 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-slate-700 rounded"></div>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-xl flex items-center justify-center text-white font-bold text-xl">
                                    AI Powered
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-24 border-t border-slate-800">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Why Choose SignLingo?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Our advanced AI technology makes learning and communicating in sign language easier than ever before.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <Link
                                    key={feature.title}
                                    href={feature.href}
                                    className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all hover:bg-slate-800/50"
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
