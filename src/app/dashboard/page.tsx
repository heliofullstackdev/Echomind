"use client";

import { useEffect, useState } from "react";

type ApiKey = { id: string; name: string; createdAt: string; revoked: boolean };

export default function DashboardPage() {
	const [keys, setKeys] = useState<ApiKey[]>([]);
	const [name, setName] = useState("");
	const [status, setStatus] = useState<string>("Loading...");

	async function refresh() {
		const res = await fetch("/api/keys");
		const data = await res.json();
		setKeys(data.keys ?? []);
		setStatus(data.subscription ?? "Free");
	}
	useEffect(() => { refresh(); }, []);

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

	return (
		<div className="mx-auto max-w-3xl px-6 py-10">
			<h1 className="mb-4 text-3xl font-bold text-white">Dashboard</h1>
			<p className="mb-8 text-neutral-300">Subscription: {status}</p>
			<div className="mb-6 flex gap-2">
				<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" className="flex-1 rounded-md bg-neutral-900 p-3 text-white" />
				<button onClick={generate} className="rounded-md bg-white px-4 py-2 text-black">Generate</button>
			</div>
			<ul className="space-y-2">
				{keys.map((k) => (
					<li key={k.id} className="flex items-center justify-between rounded-md border border-neutral-800 p-3 text-white">
						<div>
							<div className="font-medium">{k.name}</div>
							<div className="text-xs text-neutral-400">{new Date(k.createdAt).toLocaleString()}</div>
						</div>
						<button onClick={() => revoke(k.id)} className="rounded-md bg-white/10 px-3 py-1.5">Revoke</button>
					</li>
				))}
			</ul>
		</div>
	);
}
