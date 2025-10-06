import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

export const authConfig: NextAuthConfig = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GitHub({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
		}),
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
				const parsed = schema.safeParse(credentials);
				if (!parsed.success) return null;
				const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
				if (!user) return null;
				const account = await prisma.account.findFirst({ where: { userId: user.id } });
				if (!account?.refresh_token) return null;
				const ok = await compare(parsed.data.password, account.refresh_token);
				return ok ? { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined, image: user.image ?? undefined } : null;
			},
		}),
	],
	callbacks: {
		session: async ({ session, user }) => {
			if (session.user) {
				(session.user as any).id = user.id;
				(session.user as any).role = (user as any).role;
			}
			return session;
		},
	},
	pages: { signIn: "/auth/login" },
	session: { strategy: "database" },
	secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
