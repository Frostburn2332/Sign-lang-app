import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SignLingo - Real-time Sign Language Detection",
    description: "Learn and communicate with sign language using AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <LanguageProvider>
                    <Navbar />
                    <main className="flex-1 flex flex-col">
                        {children}
                    </main>
                </LanguageProvider>
            </body>
        </html>
    );
}
