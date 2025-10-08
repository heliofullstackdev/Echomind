import { NextRequest, NextResponse } from "next/server";
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
        // Parse request body
        const body = await req.json();

        // Validate input
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        const { email, password, name } = parsed.data;

        // Check if user already exists
        const existing = await prisma.user.findUnique({ 
            where: { email } 
        });
        
        if (existing) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 409 }
            );
        }

        // Hash password
        const hashed = await hash(password, 10);

        // Create user
        const user = await prisma.user.create({ 
            data: { 
                email, 
                name: name || null,
            } 
        });

        // Create credentials account
        await prisma.account.create({
            data: {
                userId: user.id,
                type: "credentials",
                provider: "credentials",
                providerAccountId: user.id,
                refresh_token: hashed,
            },
        });

        return NextResponse.json(
            { success: true },
            { status: 201 }
        );
    } catch (e: unknown) {
        
        if (e instanceof Error) {
            // Check for specific Prisma errors
            if (e.message.includes("Unique constraint")) {
                return NextResponse.json(
                    { error: "Email already in use" },
                    { status: 409 }
                );
            }
            
            return NextResponse.json(
                { error: e.message },
                { status: 500 }
            );
        }
        
        return NextResponse.json(
            { error: "Unknown error occurred" },
            { status: 500 }
        );
    }
}