"use client";

import { useState, FormEvent } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name || undefined, email, password }),
            });
            const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Registration failed");
                // Automatically sign in the user after successful registration
                await signIn("credentials", { email, password, redirect: true, callbackUrl: "/" });
                setSuccess(true);
        } catch (err: unknown) {
            const error = err instanceof Error ? err.message : String(err);
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-card-foreground">Create your account</h1>
                    <ThemeToggle />
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input className="w-full rounded-md bg-input p-3 text-foreground placeholder-muted-foreground" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                    <input className="w-full rounded-md bg-input p-3 text-foreground placeholder-muted-foreground" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="w-full rounded-md bg-input p-3 text-foreground placeholder-muted-foreground" type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button disabled={loading} className="w-full rounded-md bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{loading ? "Creating..." : "Create account"}</button>
                </form>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600 dark:text-green-400">Account created. You can now sign in.</p>}
                <div className="pt-2 text-sm text-muted-foreground">
                    Already have an account? <a href="/auth/login" className="text-foreground underline">Sign in</a>
                </div>
            </div>
        </div>
    );
}


