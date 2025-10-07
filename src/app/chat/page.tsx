"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ role: "assistant", content: "Hi there! What can I help you with today?" },
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const endRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	async function sendMessage() {
		if (!input.trim() || loading) return;
		const userMsg: ChatMessage = { role: "user", content: input.trim() };
		setMessages((m) => [...m, userMsg]);
		setInput("");
		setLoading(true);
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: [...messages, userMsg] }),
			});
			if (!res.body) {
				const data = await res.json();
				throw new Error(data.error || "No response body");
			}
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let assistantText = "";
			setMessages((m) => [...m, { role: "assistant", content: "" }]);
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				assistantText += decoder.decode(value, { stream: true });
				setMessages((m) => {
					const clone = m.slice();
					clone[clone.length - 1] = { role: "assistant", content: assistantText };
					return clone;
				});
			}
		} catch (err: unknown) {
			const error = err instanceof Error ? err.message : String(err);
			setMessages((m) => [...m, { role: "assistant", content: `Sorry, something went wrong: ${error}` }]);
		} finally {
			setLoading(false);
		}
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	return (
		<div className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-4">
			<header className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
				<div className="flex items-center justify-between">
					<h1 className="text-center text-xl font-semibold text-foreground">EchoMind</h1>
					<ThemeToggle />
				</div>
			</header>
			<main className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
				{messages.map((m, i) => (
					<div key={i} className={`w-full rounded-2xl px-4 py-3 ${m.role === "assistant" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground ml-auto"}`}>
						<p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
					</div>
				))}
				<div ref={endRef} />
			</main>
			<footer className="-mx-4 border-t border-border bg-background p-4">
				<div className="flex items-center gap-2">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={onKeyDown}
						placeholder="Type your message..."
						className="flex-1 rounded-xl bg-input p-3 text-foreground placeholder-muted-foreground outline-none"
					/>
					<button onClick={sendMessage} disabled={loading} className="rounded-xl bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
						{loading ? "Sending..." : "Send"}
					</button>
				</div>
			</footer>
		</div>
	);
}
