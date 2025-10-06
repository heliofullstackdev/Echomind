"use client";

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
			<h1 className="mb-8 text-center text-4xl font-bold text-white">Pricing</h1>
			<div className="grid gap-6 sm:grid-cols-3">
				<div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white">
					<h2 className="mb-2 text-xl font-semibold">Free</h2>
					<p className="mb-6 text-neutral-400">Basic chat, limited usage</p>
					<a href="/chat" className="inline-block rounded-lg bg-white/10 px-4 py-2">Start</a>
				</div>
				<div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white">
					<h2 className="mb-2 text-xl font-semibold">Pro Monthly</h2>
					<p className="mb-6 text-neutral-400">$10 / month</p>
					<button onClick={() => checkout("monthly")} className="rounded-lg bg-white px-4 py-2 text-black">Subscribe</button>
				</div>
				<div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white">
					<h2 className="mb-2 text-xl font-semibold">Pro Yearly</h2>
					<p className="mb-6 text-neutral-400">$99 / year</p>
					<button onClick={() => checkout("yearly")} className="rounded-lg bg-white px-4 py-2 text-black">Subscribe</button>
				</div>
			</div>
		</div>
	);
}
