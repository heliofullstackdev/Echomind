"use client";

import { useState, FormEvent } from "react";

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
            setSuccess(true);
        } catch (err: any) {
            setError(err.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h1 className="text-2xl font-semibold text-white">Create your account</h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input className="w-full rounded-md bg-neutral-900 p-3 text-white placeholder-neutral-500" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                    <input className="w-full rounded-md bg-neutral-900 p-3 text-white placeholder-neutral-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="w-full rounded-md bg-neutral-900 p-3 text-white placeholder-neutral-500" type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button disabled={loading} className="w-full rounded-md bg-white/10 p-3 text-white hover:bg-white/20 disabled:opacity-50">{loading ? "Creating..." : "Create account"}</button>
                </form>
                {error && <p className="text-sm text-red-400">{error}</p>}
                {success && <p className="text-sm text-green-400">Account created. You can now sign in.</p>}
                <div className="pt-2 text-sm text-neutral-300">
                    Already have an account? <a href="/auth/login" className="text-white underline">Sign in</a>
                </div>
            </div>
        </div>
    );
}


