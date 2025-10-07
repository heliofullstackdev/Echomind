"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold text-foreground">EchoMind</h1>
      <p className="text-muted-foreground">Your AI assistant. Start chatting now!</p>
      <div className="flex gap-3">
        <a href="/chat" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Start Chatting</a>
      </div>
    </div>
  );
}
