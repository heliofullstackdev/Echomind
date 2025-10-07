import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = stripeSecret
	? new Stripe(stripeSecret, { apiVersion: "2025-09-30.clover" })
	: null;

export const pricing = {
	MONTHLY: process.env.STRIPE_PRICE_MONTHLY as string,
	YEARLY: process.env.STRIPE_PRICE_YEARLY as string,
};

export function planForPriceId(priceId?: string | null): "PRO_MONTHLY" | "PRO_YEARLY" | null {
	if (!priceId) return null;
	if (priceId === pricing.MONTHLY) return "PRO_MONTHLY";
	if (priceId === pricing.YEARLY) return "PRO_YEARLY";
	return null;
}
