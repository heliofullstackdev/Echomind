import { NextRequest } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET() {
	// TODO: tie to session user; for now list all keys (dev only)
	const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" } });
	return new Response(JSON.stringify({ keys }), { headers: { "Content-Type": "application/json" } });
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const name = (body?.name as string) || "Key";
	const plain = randomBytes(24).toString("hex");
	const hashedKey = createHash("sha256").update(plain).digest("hex");
	const created = await prisma.apiKey.create({ data: { name, hashedKey, userId: "dev-user" } });
	return new Response(JSON.stringify({ id: created.id, key: plain }), { headers: { "Content-Type": "application/json" } });
}
