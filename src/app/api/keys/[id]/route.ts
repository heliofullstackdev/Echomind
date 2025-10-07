import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await prisma.apiKey.update({ where: { id }, data: { revoked: true } });
	return new Response("ok");
}
