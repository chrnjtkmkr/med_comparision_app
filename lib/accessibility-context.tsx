"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type AccessibilityContextType = {
    fontSize: "normal" | "large" | "extra-large";
    isElderMode: boolean;
    setFontSize: (size: "normal" | "large" | "extra-large") => void;
    toggleElderMode: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("normal");
    const [isElderMode, setIsElderMode] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("accessibility_settings");
        if (saved) {
            const { fontSize, isElderMode } = JSON.parse(saved);
            setFontSize(fontSize);
            setIsElderMode(isElderMode);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("accessibility_settings", JSON.stringify({ fontSize, isElderMode }));

        // Apply global classes
        document.documentElement.classList.remove("text-normal", "text-large", "text-extra-large");
        document.documentElement.classList.add(`text-${fontSize}`);

        if (isElderMode) {
            document.documentElement.classList.add("elder-mode");
        } else {
            document.documentElement.classList.remove("elder-mode");
        }
    }, [fontSize, isElderMode]);

    const toggleElderMode = () => setIsElderMode(!isElderMode);

    return (
        <AccessibilityContext.Provider value={{ fontSize, isElderMode, setFontSize, toggleElderMode }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
    return context;
}
