import { authMiddleware } from "@clerk/nextjs/server";

// Set the paths that don't require the user to be signed in
const publicRoutes = [
  "/",
  "/org(.*)",
  "/sign-in",
  "/sign-up",
  "/api(.*)",
  "/x(.*)",
  "/info(.*)",
  "/proxy(.*)",
];

export default authMiddleware({ publicRoutes });

// Stop Middleware running on static files and public folder
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public folder
     */
    "/((?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
  ],
};
