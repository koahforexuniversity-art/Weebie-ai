import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/builder(.*)",
  "/api/agents(.*)",
  "/api/deploy(.*)",
  "/api/liveblocks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)).*)", "/(api|trpc)(.*)"],
};
