// Authentication middleware disabled
// export { auth as middleware } from "next-auth/middleware";

export const config = {
	matcher: ["/dashboard/:path*"], // Only protect dashboard, not chat
};
