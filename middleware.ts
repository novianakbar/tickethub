import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// RBAC: Routes that require admin role
const ADMIN_ONLY_ROUTES = [
    "/admin/users",
    "/admin/categories",
    "/admin/support-levels",
    "/admin/templates",
    "/admin/email-templates",
    "/admin/attachments",
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Protect /admin routes (except /admin/login)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        if (!token) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // RBAC: Check admin-only routes
        const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(
            (route) => pathname === route || pathname.startsWith(route + "/")
        );

        if (isAdminOnlyRoute && token.role !== "admin") {
            // Redirect non-admin to dashboard with access denied flag
            const dashboardUrl = new URL("/admin?access=denied", request.url);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // Redirect authenticated users away from login page
    if (pathname === "/admin/login" && token) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api (API routes - NextAuth handles its own protection)
         */
        "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
