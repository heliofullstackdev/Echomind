import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2024-12-18.acacia",
});

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
