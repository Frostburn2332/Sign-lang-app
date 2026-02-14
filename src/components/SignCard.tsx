"use client";

import Image from "next/image";
import { Volume2, Check, Circle } from "lucide-react";

interface SignCardProps {
    title: string;
    image: string;
    onComplete?: () => void;
    isCompleted?: boolean;
}

export function SignCard({ title, image, onComplete, isCompleted }: SignCardProps) {
    return (
        <div
            className="glass-panel p-4 flex flex-col items-center gap-4 hover-lift cursor-pointer group relative overflow-hidden"
        >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer pointer-events-none"></div>

            {/* Speaker icon */}
            <div className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10">
                <Volume2 size={16} />
            </div>

            {/* Image container */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-800 border-2 border-slate-700 group-hover:border-indigo-500 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                    onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231e293b' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%23636e88'%3E${title}%3C/text%3E%3C/svg%3E`;
                    }}
                />
            </div>

            {/* Title */}
            <span className="text-xl font-bold text-slate-200 group-hover:text-indigo-400 transition-colors group-hover:scale-110 transform duration-200">
                {title}
            </span>

            {/* Mark as Done Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onComplete?.();
                }}
                className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${isCompleted
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : "bg-slate-700/50 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-600 hover:border-indigo-500"
                    }`}
            >
                {isCompleted ? <Check size={16} /> : <Circle size={16} />}
                <span className="text-sm font-medium">{isCompleted ? "Learned" : "Mark Done"}</span>
            </button>
        </div>
    );
}
