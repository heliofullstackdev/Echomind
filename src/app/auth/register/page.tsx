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

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Client-side validation
        if (!email || !password) {
            setError("Email and password are required");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: name.trim() || undefined, 
                    email: email.trim(), 
                    password 
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            // Redirect to login page after successful registration
            window.location.href = "/auth/login?registered=true";
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center px-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-card-foreground">Create your account</h1>
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                            Name (optional)
                        </label>
                        <input 
                            id="name"
                            type="text"
                            className="w-full rounded-md bg-input p-3 text-foreground placeholder-muted-foreground border border-border focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" 
                            placeholder="Your name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                            Email
                        </label>
                        <input 
                            id="email"
                            type="email"
                            className="w-full rounded-md bg-input p-3 text-foreground placeholder-muted-foreground border border-border focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" 
                            placeholder="you@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                            Password
                        </label>
                        <input 
                            id="password"
                            type="password"
                            className="w-full rounded-md bg-input p-3 text-foreground placeholder-muted-foreground border border-border focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" 
                            placeholder="At least 6 characters" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading} 
                        className="w-full rounded-md bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className="pt-2 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-foreground font-medium underline hover:no-underline">
                        Sign in
                    </a>
                </div>
            </div>
        </div>
    );
}