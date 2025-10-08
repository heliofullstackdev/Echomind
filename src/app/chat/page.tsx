"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ role: "assistant", content: "Hi there! What can I help you with today?" },
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const endRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/login?callbackUrl=/chat");
		}
	}, [status, router]);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	if (status === "loading") {
		return (
			<div className="flex h-[100dvh] items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

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
		<div className="mx-auto flex h-[100dvh] w-full max-w-3xl flex-col px-4">
			<header className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
				<div className="mx-auto flex w-full max-w-3xl items-center justify-between">
					<h1 className="text-center text-xl font-semibold text-foreground">EchoMind</h1>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
							<div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
								{session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
							</div>
							<span className="text-sm text-foreground max-w-[150px] truncate">
								{session.user?.name || session.user?.email}
							</span>
						</div>
						<button
							onClick={() => signOut({ callbackUrl: "/" })}
							className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
						>
							Sign out
						</button>
						<ThemeToggle />
					</div>
				</div>
			</header>
			<main className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
				{messages.map((m, i) => {
					const isUser = m.role === "user";
					return (
						<div key={i} className={`flex w-full items-end ${isUser ? "justify-end" : "justify-start"}`}>
							{!isUser && (
								<div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">AI</div>
							)}
							<div className={`${isUser ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground" : "rounded-2xl rounded-bl-sm bg-muted text-foreground"} max-w-[75%] px-4 py-3 shadow-sm`}>
								<p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
							</div>
							{isUser && (
								<div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">You</div>
							)}
						</div>
					);
				})}
				<div ref={endRef} />
			</main>
			<footer className="-mx-4 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
				<div className="mx-auto flex w-full max-w-3xl items-center gap-2">
					<div className="relative flex-1">
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={onKeyDown}
							placeholder="Type your message..."
							className="w-full rounded-xl border border-border bg-input/80 p-3 pr-12 text-foreground placeholder-muted-foreground shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
						/>
						<button onClick={sendMessage} disabled={loading} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
							{loading ? "Sending..." : "Send"}
						</button>
					</div>
				</div>
			</footer>
		</div>
	);
}