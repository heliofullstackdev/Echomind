"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type ApiKey = { id: string; name: string; createdAt: string; revoked: boolean };

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [keys, setKeys] = useState<ApiKey[]>([]);
	const [name, setName] = useState("");
	const [statusText, setStatusText] = useState<string>("Loading...");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/login?callbackUrl=/dashboard");
		}
	}, [status, router]);

	async function refresh() {
		const res = await fetch("/api/keys");
		const data = await res.json();
		setKeys(data.keys ?? []);
		setStatusText(data.subscription ?? "Free");
	}
	
	useEffect(() => { 
		if (session) {
			refresh(); 
		}
	}, [session]);

	const handleSignOut = async () => {
		await signOut({ redirect: false });
		// Force a hard refresh to clear all state
		window.location.href = "/";
	};

	async function generate() {
		const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
		const data = await res.json();
		if (data.key) alert(`Your API key: ${data.key}\nStore it now; it won't be shown again.`);
		setName("");
		refresh();
	}
	
	async function revoke(id: string) {
		await fetch(`/api/keys/${id}`, { method: "DELETE" });
		refresh();
	}

	if (status === "loading") {
		return (
			<div className="flex h-[100dvh] items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="mx-auto max-w-3xl px-6 py-10">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
						<div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
							{session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
						</div>
						<span className="text-sm text-foreground max-w-[150px] truncate">
							{session.user?.name || session.user?.email}
						</span>
					</div>
					<button
						onClick={handleSignOut}
						className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
					>
						Sign out
					</button>
					<ThemeToggle />
				</div>
			</div>
			<p className="mb-8 text-muted-foreground">Subscription: {statusText}</p>
			<div className="mb-6 flex gap-2">
				<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" className="flex-1 rounded-md bg-input p-3 text-foreground placeholder-muted-foreground" />
				<button onClick={generate} className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Generate</button>
			</div>
			<ul className="space-y-2">
				{keys.map((k) => (
					<li key={k.id} className="flex items-center justify-between rounded-md border border-border p-3 text-foreground">
						<div>
							<div className="font-medium">{k.name}</div>
							<div className="text-xs text-muted-foreground">{new Date(k.createdAt).toLocaleString()}</div>
						</div>
						<button onClick={() => revoke(k.id)} className="rounded-md bg-secondary px-3 py-1.5 text-secondary-foreground hover:bg-secondary/80">Revoke</button>
					</li>
				))}
			</ul>
		</div>
	);
}