export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-white">EchoMind</h1>
      <p className="text-neutral-300">Your AI assistant. Sign in and start chatting.</p>
      <div className="flex gap-3">
        <a href="/auth/login" className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20">Sign in</a>
        <a href="/chat" className="rounded-lg bg-white px-4 py-2 text-black">Open Chat</a>
      </div>
    </div>
  );
}
