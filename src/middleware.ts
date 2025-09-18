import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
const { pathname } = req.nextUrl;
if (pathname.startsWith("/dashboard")) {
const token = req.cookies.get("auth_token")?.value;
if (!token) {
const loginUrl = new URL("/login", req.url);
loginUrl.searchParams.set("next", pathname);
return NextResponse.redirect(loginUrl);
}
}
return NextResponse.next();
}


export const config = { matcher: ["/dashboard/:path*"] };