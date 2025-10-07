import { NextRequest } from "next/server";
import { stripe, pricing } from "@/lib/stripe";

export async function POST(req: NextRequest) {
	try {
		if (!stripe) {
			return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		const body = await req.json();
		const priceKey: "monthly" | "yearly" = body?.price;
		const priceId = priceKey === "yearly" ? pricing.YEARLY : pricing.MONTHLY;
		if (!priceId) return new Response(JSON.stringify({ error: "Missing price configuration" }), { status: 400 });

		// TODO: pull the userId from session; placeholder for now
		const userId = "dev-user";

		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			line_items: [{ price: priceId, quantity: 1 }],
			metadata: { userId },
			success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
			cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=1`,
			allow_promotion_codes: true,
		});
		return new Response(JSON.stringify({ url: session.url }), { headers: { "Content-Type": "application/json" } });
	} catch (e: unknown) {
		const error = e instanceof Error ? e.message : "Unknown error";
		return new Response(JSON.stringify({ error }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
}
