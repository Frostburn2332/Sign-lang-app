"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useLanguage } from "@/context/LanguageContext";
import { FilesetResolver, GestureRecognizer, DrawingUtils } from "@mediapipe/tasks-vision";

// Hindi translations
const gestureTranslations: Record<string, string> = {
    "I Love You": "मैं तुमसे प्यार करता हूँ",
    "Y / Rock On": "Y / रॉक ऑन",
    "V / Peace / 2": "V / शांति / 2",
    "K": "K",
    "U / No": "U / नहीं",
    "W / 6 / Water": "W / 6 / पानी",
    "B": "B",
    "Hello / Open Hand": "नमस्ते / खुला हाथ",
    "Stop / Open Hand": "रुको / खुला हाथ",
    "F / OK": "F / ठीक है",
    "L / Loser": "L / हारने वाला",
    "I / J": "I / J",
    "S / Yes": "S / हाँ",
    "A / Sorry": "A / क्षमा करें",
    "E": "E",
    "T": "T",
    "N": "N",
    "M": "M",
    "D / 1": "D / 1",
    "C / Drink": "C / पीना",
    "G": "G",
    "Q": "Q",
    "H": "H",
    "X": "X",
    "P": "P",
    "Unknown": "अज्ञात"
};

interface CameraProps {
    ttsEnabled?: boolean;
    onGestureDetected?: (gesture: string) => void;
}

export function Camera({ ttsEnabled = false, onGestureDetected }: CameraProps) {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [recognizer, setRecognizer] = useState<GestureRecognizer | null>(null);
    const [gesture, setGesture] = useState<string>("");
    const [confidence, setConfidence] = useState<number>(0);
    const { locale, t } = useLanguage();

    const lastSpokenGesture = useRef<string>("");
    const lastSpokenTime = useRef<number>(0);

    // Smoothing buffer
    const predictionBuffer = useRef<string[]>([]);
    const BUFFER_SIZE = 15;

    /* ------------------- SPEECH ------------------- */
    useEffect(() => {
        if (!ttsEnabled) return;
        if (!gesture || gesture === "Unknown") return;
        if (confidence < 0.7) return;

        const now = Date.now();
        if (gesture === lastSpokenGesture.current && now - lastSpokenTime.current < 2500) {
            return; // prevent frequent repeats
        }

        const textToSpeak =
            locale === "hi" ? (gestureTranslations[gesture] || gesture) : gesture;

        const cleanedText = textToSpeak.replace(/\//g, " or ");

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(cleanedText);
            utter.lang = locale === "hi" ? "hi-IN" : "en-US";
            utter.rate = 0.9;
            window.speechSynthesis.speak(utter);

            lastSpokenGesture.current = gesture;
            lastSpokenTime.current = now;
        }
    }, [gesture, ttsEnabled, locale, confidence]);

    /* ------------------- INIT MODEL ------------------- */
    useEffect(() => {
        const loadRecognizer = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );

            const recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numHands: 1
            });

            setRecognizer(recognizerInstance);
        };

        loadRecognizer();
    }, []);

    /* ------------------- PREDICTION LOOP ------------------- */
    useEffect(() => {
        let frameId: number;

        const predict = () => {
            if (
                recognizer &&
                webcamRef.current &&
                webcamRef.current.video &&
                webcamRef.current.video.readyState === 4
            ) {
                const video = webcamRef.current.video;
                const now = Date.now();

                const results = recognizer.recognizeForVideo(video, now);

                const ctx = canvasRef.current?.getContext("2d");
                if (ctx && canvasRef.current) {
                    canvasRef.current.width = video.videoWidth;
                    canvasRef.current.height = video.videoHeight;

                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                    if (results.landmarks?.[0]) {
                        const landmarks = results.landmarks[0];
                        const drawing = new DrawingUtils(ctx);

                        drawing.drawConnectors(
                            landmarks,
                            GestureRecognizer.HAND_CONNECTIONS,
                            { color: "#818cf8", lineWidth: 4 }
                        );

                        drawing.drawLandmarks(landmarks, {
                            color: "#fff",
                            radius: 4
                        });

                        // classify ASL
                        const rawGesture = classifyASLSign(landmarks);

                        if (rawGesture !== "Unknown") {
                            predictionBuffer.current.push(rawGesture);
                            if (predictionBuffer.current.length > BUFFER_SIZE)
                                predictionBuffer.current.shift();

                            // count frequency
                            const freq: Record<string, number> = {};
                            let maxCount = 0;
                            let best = "";

                            predictionBuffer.current.forEach(g => {
                                freq[g] = (freq[g] || 0) + 1;
                                if (freq[g] > maxCount) {
                                    maxCount = freq[g];
                                    best = g;
                                }
                            });

                            if (maxCount > BUFFER_SIZE * 0.6) {
                                setGesture(best);
                                setConfidence(maxCount / BUFFER_SIZE);

                                // 🔥 Emit gesture to parent (LearnPage)
                                if (onGestureDetected) {
                                    onGestureDetected(best);
                                }
                            }
                        } else {
                            predictionBuffer.current = [];
                            setGesture("");
                            setConfidence(0);
                        }
                    }
                }
            }

            frameId = requestAnimationFrame(predict);
        };

        if (recognizer) {
            predict();
        }

        return () => cancelAnimationFrame(frameId);
    }, [recognizer, onGestureDetected]);

    const displayGesture =
        locale === "hi" ? (gestureTranslations[gesture] || gesture) : gesture;

    return (
        <div className="relative w-full h-full aspect-video overflow-hidden bg-black">
            <Webcam
                ref={webcamRef}
                className="absolute inset-0 w-full h-full object-cover"
                mirrored
            />
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

            {/* Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pt-20">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 px-6 py-2 bg-slate-900/80 border border-indigo-500/30 rounded-full shadow-lg">
                        <span className="text-slate-400 text-sm uppercase tracking-wider">
                            {t("detect.detected")}
                        </span>
                        <div className="h-4 w-[1px] bg-slate-700" />
                        <span className="text-3xl font-bold text-white">
                            {displayGesture || <span className="text-slate-600">...</span>}
                        </span>
                    </div>

                    {/* Confidence bar */}
                    {gesture && (
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                    style={{ width: `${confidence * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-indigo-300 font-mono">
                                {Math.round(confidence * 100)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------
   CLASSIFIER FUNCTION (same as your original)
---------------------------------------------------------- */
function classifyASLSign(landmarks: any[]): string {
    const dist = (i: number, j: number) =>
        Math.hypot(
            landmarks[i].x - landmarks[j].x,
            landmarks[i].y - landmarks[j].y
        );

    const isExt = (tip: number, pip: number) =>
        landmarks[tip].y < landmarks[pip].y - 0.02;

    const thumbExt = Math.abs(landmarks[4].x - landmarks[2].x) > 0.05;
    const indexExt = isExt(8, 6);
    const middleExt = isExt(12, 10);
    const ringExt = isExt(16, 14);
    const pinkyExt = isExt(20, 18);

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const thumbIndexDist = dist(4, 8);
    const indexMiddleDist = dist(8, 12);

    // All your classifier logic here (unchanged)
    // … (keeping same logic)

    // Copy of your full classifier logic remains unchanged ↓↓↓

    /** FULL CLASSIFIER BELOW — SAME AS YOU PROVIDED **/
    // I Love You
    if (thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) return "I Love You";

    if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) return "Y / Rock On";

    if (indexExt && middleExt && !ringExt && !pinkyExt) {
        if (indexMiddleDist > 0.05) return "V / Peace / 2";
        if (dist(4, 10) < 0.05 || dist(4, 11) < 0.05) return "K";
        return "U / No";
    }

    if (indexExt && middleExt && ringExt && !pinkyExt) return "W / 6 / Water";

    if (indexExt && middleExt && ringExt && pinkyExt) {
        if (!thumbExt || thumbTip.x < indexTip.x) return "B";
        if (indexMiddleDist > 0.05) return "Hello / Open Hand";
        return "Stop / Open Hand";
    }

    if (!indexExt && middleExt && ringExt && pinkyExt && thumbIndexDist < 0.05)
        return "F / OK";

    if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) return "L / Loser";

    if (!indexExt && !middleExt && !ringExt && pinkyExt && !thumbExt) return "I / J";

    // Fist group
    if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
        if (thumbTip.y < landmarks[10].y && thumbTip.y > landmarks[5].y)
            return "S / Yes";
        if (Math.abs(thumbTip.x - indexTip.x) > 0.05 && thumbTip.y < landmarks[5].y)
            return "A / Sorry";
        if (thumbTip.y > landmarks[13].y) return "E";
        if (thumbTip.x > landmarks[5].x && thumbTip.x < landmarks[9].x) return "T";
        if (thumbTip.x > landmarks[9].x && thumbTip.x < landmarks[13].x) return "N";
        if (thumbTip.x > landmarks[13].x && thumbTip.x < landmarks[17].x) return "M";
        return "S / Yes";
    }

    if (indexExt && !middleExt && !ringExt && !pinkyExt) return "D / 1";

    const gap = dist(4, 8);
    if (!indexExt && !middleExt && !ringExt && !pinkyExt && gap > 0.08 && gap < 0.15)
        return "C / Drink";

    if (indexExt && !middleExt && !ringExt && !pinkyExt) {
        if (indexTip.y > landmarks[6].y) return "Q";
        if (Math.abs(indexTip.x - landmarks[5].x) > Math.abs(indexTip.y - landmarks[5].y))
            return "G";
    }

    if (indexExt && middleExt && !ringExt && !pinkyExt) {
        if (Math.abs(indexTip.x - landmarks[5].x) > Math.abs(indexTip.y - landmarks[5].y))
            return "H";
    }

    if (!indexExt && !middleExt && !ringExt && !pinkyExt && dist(8, 6) < 0.04)
        return "X";

    if (indexExt && middleExt && !ringExt && !pinkyExt && indexTip.y > landmarks[6].y)
        return "P";

    return "Unknown";
}