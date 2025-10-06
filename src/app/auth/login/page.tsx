"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/" });
		if (res?.error) setError(res.error);
		setLoading(false);
	};

	return (
		<div className="min-h-dvh flex items-center justify-center px-4">
			<div className="w-full max-w-md space-y-6 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
				<h1 className="text-2xl font-semibold text-white">Sign in to EchoMind</h1>
				<form onSubmit={onSubmit} className="space-y-4">
					<input className="w-full rounded-md bg-neutral-900 p-3 text-white placeholder-neutral-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
					<input className="w-full rounded-md bg-neutral-900 p-3 text-white placeholder-neutral-500" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
					<button disabled={loading} className="w-full rounded-md bg-white/10 p-3 text-white hover:bg-white/20 disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button>
				</form>
				{error && <p className="text-sm text-red-400">{error}</p>}
				<div className="pt-2">
					<button onClick={() => signIn("github", { callbackUrl: "/" })} className="w-full rounded-md bg-white p-3 text-black">Continue with GitHub</button>
				</div>
			</div>
		</div>
	);
}
