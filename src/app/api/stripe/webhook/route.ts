import { NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
	const sig = req.headers.get("stripe-signature");
	if (!sig) return new Response("Missing signature", { status: 400 });
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
	const rawBody = await req.text();
	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
	} catch (err: any) {
		return new Response(`Webhook Error: ${err.message}`, { status: 400 });
	}

	try {
		switch (event.type) {
			case "customer.subscription.created":
			case "customer.subscription.updated": {
				const sub = event.data.object as Stripe.Subscription;
				const customerId = sub.customer as string;
				await prisma.subscription.upsert({
					where: { stripeSubscriptionId: sub.id },
					update: {
						stripeCustomerId: customerId,
						stripeSubscriptionId: sub.id,
						stripePriceId: typeof sub.items.data[0]?.price?.id === "string" ? sub.items.data[0]?.price?.id : undefined,
						status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : sub.status === "canceled" ? "CANCELED" : "INACTIVE",
						currentPeriodEnd: new Date(sub.current_period_end * 1000),
					},
					create: {
						userId: "unknown", // Will be linked after checkout session completion if needed
						plan: "PRO_MONTHLY",
						status: "ACTIVE",
						stripeCustomerId: customerId,
						stripeSubscriptionId: sub.id,
						stripePriceId: typeof sub.items.data[0]?.price?.id === "string" ? sub.items.data[0]?.price?.id : undefined,
						currentPeriodEnd: new Date(sub.current_period_end * 1000),
					},
				});
				break;
			}
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				// TODO: link to authenticated user via metadata or email
				break;
			}
			default:
				break;
		}
		return new Response("ok");
	} catch (e: any) {
		return new Response(`Webhook handler error: ${e?.message ?? e}`, { status: 500 });
	}
}
