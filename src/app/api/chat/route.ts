import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
	try {
        if (!process.env.OPENAI_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
		const body = await req.json();
		const messages = (body?.messages ?? []) as { role: string; content: string }[];
		const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

		const response = await client.chat.completions.create({
			model: "gpt-4o-mini",
			messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
			stream: true,
		});

		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				(async () => {
					for await (const chunk of response) {
						const delta = chunk.choices?.[0]?.delta?.content ?? "";
						if (delta) controller.enqueue(new TextEncoder().encode(delta));
					}
					controller.close();
				})().catch((err) => {
					controller.error(err);
				});
			},
		});

        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
	} catch (e: unknown) {
		const error = e instanceof Error ? e.message : "Unknown error";
		return new Response(JSON.stringify({ error }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
}
