"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome, {session.user?.name || session.user?.email}
        </span>
        <Link 
          href="/dashboard" 
          className="text-sm text-primary hover:text-primary/80"
        >
          Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link 
        href="/auth/login" 
        className="text-sm text-primary hover:text-primary/80"
      >
        Sign in
      </Link>
      <Link 
        href="/auth/register" 
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Register
      </Link>
    </div>
  );
}
