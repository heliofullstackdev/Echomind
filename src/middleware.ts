export { auth as middleware } from "next-auth/middleware";

export const config = {
	matcher: ["/dashboard/:path*", "/chat/:path*"],
};
