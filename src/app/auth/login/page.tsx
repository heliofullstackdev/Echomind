"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		// Handle OAuth errors
		const error = searchParams.get("error");
		if (error) {
			const errorMessages: Record<string, string> = {
				OAuthSignin: "Error starting OAuth sign in",
				OAuthCallback: "Error during OAuth callback",
				OAuthCreateAccount: "Could not create OAuth account",
				EmailCreateAccount: "Could not create email account",
				Callback: "Error in callback",
				OAuthAccountNotLinked: "Email already in use with different provider",
				EmailSignin: "Email sign in error",
				CredentialsSignin: "Invalid email or password",
				SessionRequired: "Please sign in to access this page",
				default: "Authentication error occurred",
			};
			setError(errorMessages[error] || errorMessages.default);
		}
	}, [searchParams]);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		
		try {
			const callbackUrl = searchParams.get("callbackUrl") || "/";
			const res = await signIn("credentials", { 
				email, 
				password, 
				redirect: false,
				callbackUrl,
			});
			
			if (res?.error) {
				// Map NextAuth error to user-friendly message
				const errorMessages: Record<string, string> = {
					CredentialsSignin: "Invalid email or password",
					default: "Authentication failed. Please try again.",
				};
				setError(errorMessages[res.error] || res.error);
			} else if (res?.ok) {
				// Redirect manually on success
				window.location.href = res.url || callbackUrl;
			}
		} catch (err) {
			console.error("Login error:", err);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthSignIn = async (provider: "github" | "google") => {
		setLoading(true);
		setError(null);
		const callbackUrl = searchParams.get("callbackUrl") || "/";
		await signIn(provider, { callbackUrl });
	};

	return (
		<div className="min-h-dvh flex items-center justify-center px-4">
			<div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-semibold text-card-foreground">Sign in to EchoMind</h1>
					<ThemeToggle />
				</div>

				{error && (
					<div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}

				<form onSubmit={onSubmit} className="space-y-4">
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
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={loading}
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-md bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-border"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="bg-card px-2 text-muted-foreground">Or continue with</span>
					</div>
				</div>

				<div className="space-y-2">
					{process.env.NEXT_PUBLIC_GITHUB_ENABLED !== "false" && (
						<button
							type="button"
							onClick={() => handleOAuthSignIn("github")}
							disabled={loading}
							className="w-full rounded-md bg-secondary p-3 text-secondary-foreground flex items-center justify-center gap-2 hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
							</svg>
							Continue with GitHub
						</button>
					)}
					<button
						type="button"
						disabled
						className="w-full rounded-md bg-muted p-3 text-muted-foreground flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						Google Login (Disabled)
					</button>
				</div>

				<div className="text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<a href="/auth/register" className="text-foreground font-medium underline hover:no-underline">
						Register
					</a>
				</div>
			</div>
		</div>
	);
}