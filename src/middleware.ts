
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// This secret should match NEXTAUTH_SECRET or your JWT secret
declare const process: {
	env: { NEXTAUTH_SECRET: string }
};

export async function middleware(req: NextRequest) {
	const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value;
	if (!token) {
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}
	try {
		await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));
		return NextResponse.next();
	} catch (e) {
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}
}

export const config = {
	matcher: ["/dashboard/:path*"],
};
