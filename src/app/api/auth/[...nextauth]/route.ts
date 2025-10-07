
// Dynamically import the NextAuth handler at request time to avoid
// static analysis pulling `next-auth` into other Edge-bundled files
// (like `middleware.ts`). This prevents the Edge Runtime "dynamic
// code evaluation" build error on Vercel.

async function resolveHandler() {
	const mod = await import("@/lib/auth");
	// default export in src/lib/auth.ts is already the NextAuth handler
	return mod.default;
}

export async function GET(request: Request) {
	const handler = await resolveHandler();
	return handler(request);
}

export async function POST(request: Request) {
	const handler = await resolveHandler();
	return handler(request);
}
