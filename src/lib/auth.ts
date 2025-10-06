import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
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
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
