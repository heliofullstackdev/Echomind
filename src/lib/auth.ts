import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

export const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma) as any,
	providers: [
		...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
			? [
					GitHub({
						clientId: process.env.GITHUB_ID,
						clientSecret: process.env.GITHUB_SECRET,
					}),
			  ]
			: []),
		...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
			? [
					Google({
						clientId: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET,
					}),
			  ]
			: []),
		Credentials({
			id: "credentials",
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					const schema = z.object({ 
						email: z.string().email(), 
						password: z.string().min(6) 
					});
					const parsed = schema.safeParse(credentials);
					
					if (!parsed.success) {
						return null;
					}

					const user = await prisma.user.findUnique({ 
						where: { email: parsed.data.email } 
					});
					
					if (!user) {
						return null;
					}

					const account = await prisma.account.findFirst({ 
						where: { 
							userId: user.id, 
							provider: "credentials" 
						} 
					});
					
					if (!account?.refresh_token) {
						return null;
					}

					const ok = await compare(parsed.data.password, account.refresh_token);
					
					if (!ok) {
						return null;
					}

					return { 
						id: user.id, 
						name: user.name ?? undefined, 
						email: user.email ?? undefined, 
						image: user.image ?? undefined 
					};
				} catch (error) {
					console.error("Auth error:", error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = "user";
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user && token) {
				session.user.id = token.id as string;
				session.user.role = (token.role as string) || "user";
			}
			return session;
		},
	},
	pages: { 
		signIn: "/auth/login",
		error: "/auth/login",
	},
	session: { 
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},
	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);