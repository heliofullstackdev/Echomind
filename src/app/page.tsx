"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    // Force a hard refresh to clear all state
    window.location.href = "/";
  };

  const handleStartChatting = () => {
    if (session) {
      router.push("/chat");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {status === "loading" ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : session ? (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-foreground">{session.user?.name || session.user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-muted transition-colors text-sm"
            >
              Sign out
            </button>
          </>
        ) : (
          <a 
            href="/auth/login" 
            className="rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-muted transition-colors"
          >
            Sign in
          </a>
        )}
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold text-foreground">EchoMind</h1>
      <p className="text-muted-foreground">Your AI assistant. Start chatting now!</p>
      <div className="flex gap-3">
        <button
          onClick={handleStartChatting}
          disabled={status === "loading"}
          className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
        >
          {status === "loading" ? "Loading..." : "Start Chatting"}
        </button>
      </div>
    </div>
  );
}