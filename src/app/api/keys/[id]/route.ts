import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params;
	await prisma.apiKey.update({ where: { id }, data: { revoked: true } });
	return new Response("ok");
}
