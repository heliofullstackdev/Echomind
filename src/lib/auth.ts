import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

export const authConfig: NextAuthOptions = {
	providers: [
		...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
			GitHub({
				clientId: process.env.GITHUB_ID,
				clientSecret: process.env.GITHUB_SECRET,
			})
		] : []),
		...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
			Google({
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			})
		] : []),
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
				const parsed = schema.safeParse(credentials);
				if (!parsed.success) {
                    throw new Error("Invalid email or password format");
                }
				const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
				if (!user) {
                    throw new Error("Account not found");
                }
				const account = await prisma.account.findFirst({ where: { userId: user.id, provider: "credentials" } });
				if (!account?.refresh_token) {
                    throw new Error("Credentials login not set for this account");
                }
				const ok = await compare(parsed.data.password, account.refresh_token);
				if (!ok) {
                    throw new Error("Invalid email or password");
                }
				return { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined, image: user.image ?? undefined };
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }: { token: JWT; user?: User }) {
			// Initial sign in
			if (user) {
				(token as JWT & { id: string; role: string }).id = (user as User & { id: string }).id;
				(token as JWT & { id: string; role: string }).role = (user as User & { role?: string }).role ?? "user";
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			if (session.user && token) {
				(session.user as Session["user"] & { id: string; role: string }).id = (token as JWT & { id: string }).id;
				(session.user as Session["user"] & { id: string; role: string }).role = (token as JWT & { role: string }).role;
			}
			return session;
		},
	},
	pages: { signIn: "/auth/login" },
	session: { strategy: "jwt" },
	secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
