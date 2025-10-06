import { NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe, planForPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function statusToEnum(status: Stripe.Subscription.Status) {
	if (status === "active") return "ACTIVE";
	if (status === "past_due") return "PAST_DUE";
	if (status === "canceled") return "CANCELED";
	return "INACTIVE";
}

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
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const userId = (session.metadata?.userId as string) || undefined;
				const subscriptionId = (session.subscription as string) || undefined;
				if (userId && subscriptionId) {
					await prisma.subscription.upsert({
						where: { stripeSubscriptionId: subscriptionId },
						update: { userId },
						create: { userId, plan: "PRO_MONTHLY", status: "ACTIVE", stripeSubscriptionId: subscriptionId },
					});
				}
				break;
			}
			case "customer.subscription.created":
			case "customer.subscription.updated": {
				const sub = event.data.object as Stripe.Subscription;
				const priceId = sub.items.data[0]?.price?.id ?? null;
				await prisma.subscription.upsert({
					where: { stripeSubscriptionId: sub.id },
					update: {
						plan: planForPriceId(priceId) ?? "PRO_MONTHLY",
						status: statusToEnum(sub.status),
						stripeCustomerId: typeof sub.customer === "string" ? sub.customer : undefined,
						stripePriceId: typeof priceId === "string" ? priceId : undefined,
						currentPeriodEnd: new Date(sub.current_period_end * 1000),
					},
					create: {
						userId: "unknown",
						plan: planForPriceId(priceId) ?? "PRO_MONTHLY",
						status: statusToEnum(sub.status),
						stripeCustomerId: typeof sub.customer === "string" ? sub.customer : undefined,
						stripeSubscriptionId: sub.id,
						stripePriceId: typeof priceId === "string" ? priceId : undefined,
						currentPeriodEnd: new Date(sub.current_period_end * 1000),
					},
				});
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
