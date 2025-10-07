import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";

const schema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const { email, password, name } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409, headers: { "Content-Type": "application/json" } });
        }

        const user = await prisma.user.create({ data: { email, name } });
        const hashed = await hash(password, 10);
        await prisma.account.create({
            data: {
                userId: user.id,
                type: "credentials",
                provider: "credentials",
                providerAccountId: user.id,
                refresh_token: hashed,
            },
        });

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}


