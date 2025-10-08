import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
	// Try both secure and non-secure cookie names
	const token = 
		req.cookies.get("__Secure-next-auth.session-token")?.value || 
		req.cookies.get("next-auth.session-token")?.value;
	
	if (!token) {
		const loginUrl = new URL("/auth/login", req.url);
		loginUrl.searchParams.set("callbackUrl", req.url);
		return NextResponse.redirect(loginUrl);
	}

	try {
		const secret = process.env.NEXTAUTH_SECRET;
		if (!secret) {
			throw new Error("NEXTAUTH_SECRET is not defined");
		}
		await jwtVerify(token, new TextEncoder().encode(secret));
		return NextResponse.next();
	} catch (err) {
		console.error("JWT verification failed:", err);
		const loginUrl = new URL("/auth/login", req.url);
		loginUrl.searchParams.set("callbackUrl", req.url);
		return NextResponse.redirect(loginUrl);
	}
}

export const config = {
	matcher: ["/dashboard/:path*"],
};