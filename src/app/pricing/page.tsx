"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function PricingPage() {
	async function checkout(price: "monthly" | "yearly") {
		const res = await fetch("/api/stripe/checkout", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ price }),
		});
		const data = await res.json();
		if (data.url) window.location.href = data.url as string;
	}
	return (
		<div className="mx-auto max-w-5xl px-6 py-12">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold text-foreground">Pricing</h1>
				<ThemeToggle />
			</div>
			<div className="grid gap-6 sm:grid-cols-3">
				<div className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
					<h2 className="mb-2 text-xl font-semibold">Free</h2>
					<p className="mb-6 text-muted-foreground">Basic chat, limited usage</p>
					<a href="/chat" className="inline-block rounded-lg bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80">Start</a>
				</div>
				<div className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
					<h2 className="mb-2 text-xl font-semibold">Pro Monthly</h2>
					<p className="mb-6 text-muted-foreground">$10 / month</p>
					<button onClick={() => checkout("monthly")} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Subscribe</button>
				</div>
				<div className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
					<h2 className="mb-2 text-xl font-semibold">Pro Yearly</h2>
					<p className="mb-6 text-muted-foreground">$99 / year</p>
					<button onClick={() => checkout("yearly")} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Subscribe</button>
				</div>
			</div>
		</div>
	);
}
