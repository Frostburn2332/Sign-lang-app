"use client";

import React, { createContext, useContext, useState } from "react";
import { Locale } from "@/lib/i18n";

type LanguageContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Locale, Record<string, string>> = {
    en: {
        "nav.home": "Home",
        "nav.learn": "Learn",
        "nav.detect": "Detect",
        "nav.meet": "Meet",
        "hero.title": "Break the Silence",
        "hero.subtitle": "Real-time Sign Language Detection & Learning Platform",
        "hero.cta": "Start Learning",
        "learn.alphabets": "Alphabets",
        "learn.words": "Words",
        "learn.points": "Points",
        "learn.markDone": "Mark Done",
        "learn.learned": "Learned",
        "learn.loginToEarn": "Login to earn points",
        "learn.pointsEarned": "Points!",
        "learn.ttsEnabled": "Text to speech enabled",
        "learn.alphabetsSelected": "Alphabets selected",
        "learn.wordsSelected": "Words selected",
        "learn.letter": "Letter",
        "learn.word": "Word",
        "detect.subtitle": "Real-time American Sign Language detection",
        "detect.cameraActive": "Camera Active",
        "detect.voiceFeedback": "Voice Feedback",
        "detect.bestPractices": "Best Practices",
        "detect.lighting": "Lighting",
        "detect.lightingDesc": "Ensure your environment is well-lit, preferably with light facing you.",
        "detect.positioning": "Positioning",
        "detect.positioningDesc": "Keep your hand within the frame and at a comfortable distance.",
        "detect.background": "Background",
        "detect.backgroundDesc": "A plain background helps the AI detect gestures more accurately.",
        "detect.didYouKnow": "Did you know?",
        "detect.didYouKnowDesc": "ASL uses both manual signs (hand gestures) and non-manual markers (facial expressions) to convey meaning.",
        "detect.detected": "Detected",
        "detect.intro": "Sign detection page. Ensure you are in a well-lit environment and your hand is clearly visible to the camera.",
    },
    hi: {
        "nav.home": "होम",
        "nav.learn": "सीखें",
        "nav.detect": "पहचानें",
        "nav.meet": "मिलें",
        "hero.title": "खामोशी तोड़ें",
        "hero.subtitle": "रियल-टाइम सांकेतिक भाषा पहचान और शिक्षण मंच",
        "hero.cta": "सीखना शुरू करें",
        "learn.alphabets": "वर्णमाला",
        "learn.words": "शब्द",
        "learn.points": "अंक",
        "learn.markDone": "चिन्हित करें",
        "learn.learned": "सीखा",
        "learn.loginToEarn": "अंक अर्जित करने के लिए लॉगिन करें",
        "learn.pointsEarned": "अंक!",
        "learn.ttsEnabled": "पाठ से वाक् सक्षम",
        "learn.alphabetsSelected": "वर्णमाला चयनित",
        "learn.wordsSelected": "शब्द चयनित",
        "learn.letter": "अक्षर",
        "learn.word": "शब्द",
        "detect.subtitle": "रियल-टाइम अमेरिकी सांकेतिक भाषा पहचान",
        "detect.cameraActive": "कैमरा सक्रिय",
        "detect.voiceFeedback": "वॉयस फीडबैक",
        "detect.bestPractices": "सर्वोत्तम प्रथाएं",
        "detect.lighting": "प्रकाश व्यवस्था",
        "detect.lightingDesc": "सुनिश्चित करें कि आपका वातावरण अच्छी तरह से प्रकाशित है, अधिमानतः आपके सामने प्रकाश के साथ।",
        "detect.positioning": "स्थिति",
        "detect.positioningDesc": "अपना हाथ फ्रेम के भीतर और आरामदायक दूरी पर रखें।",
        "detect.background": "पृष्ठभूमि",
        "detect.backgroundDesc": "एक सादे पृष्ठभूमि एआई को इशारों को अधिक सटीक रूप से पहचानने में मदद करती है।",
        "detect.didYouKnow": "क्या आप जानते हैं?",
        "detect.didYouKnowDesc": "एएसएल अर्थ व्यक्त करने के लिए मैनुअल संकेतों (हाथ के इशारों) और गैर-मैनुअल मार्कर (चेहरे के भाव) दोनों का उपयोग करता है।",
        "detect.detected": "पहचाना गया",
        "detect.intro": "संकेत पहचान पृष्ठ। सुनिश्चित करें कि आप अच्छी तरह से प्रकाशित वातावरण में हैं और आपका हाथ कैमरे को स्पष्ट रूप से दिखाई दे रहा है।",
    }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>("en");

    const t = (key: string) => {
        return translations[locale][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
