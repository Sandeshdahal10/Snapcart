/**
 * proxy.ts - Next.js middleware for protecting routes using next-auth JWT tokens.
 *
 * Purpose:
 *   - Acts as middleware to allow or redirect requests based on authentication state.
 *   - Public routes are allowed through; other routes require a valid next-auth JWT.
 *
 * Exports:
 *   - proxy(req: NextRequest): Promise<NextResponse>
 *       * If the request URL matches a public route pattern, it returns NextResponse.next().
 *       * Otherwise it attempts to read the session token via next-auth's getToken().
 *       * If no token is present, redirects to /login with callbackUrl set to the original URL.
 *   - config
 *       * Contains the Next.js matcher pattern to control which paths are handled by this middleware.
 *
 * Usage notes:
 *   - Requires NEXT.js middleware support (app/router or pages based setup that runs middleware).
 *   - Expects AUTH_SECRET env var to be set for next-auth getToken() to work.
 *   - Modify publicRoutes and matcher to adjust which paths are considered public/private.
 *
 * Example:
 *   - Public: /login, /register, /api/auth, /favicon.ico, /_next
 *   - Private: all other routes matched by the configured matcher
 */

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req:NextRequest){
  const {pathname}=req.nextUrl;
  
  const publicRoutes=["/login","/register","/api/auth","/favicon.ico","/_next"]
  
  if(publicRoutes.some((path)=>pathname.startsWith(path))){
    return NextResponse.next();
  }

  const token=await getToken({req,secret:process.env.AUTH_SECRET})
  if(!token){
    // API callers (axios) need a JSON error, not the HTML of the login page
    if(pathname.startsWith("/api/")){
      return NextResponse.json({message:"Not authenticated"},{status:401});
    }
    const loginUrl=new URL('/login',req.url);
    loginUrl.searchParams.set('callbackUrl',req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role=token.role;
  if(pathname.startsWith("/user") && role!=="user"){
    return NextResponse.redirect(new URL("/unauthorized",req.url));
  }
  if(pathname.startsWith("/delivery") && role!=="deliveryBoy"){
    return NextResponse.redirect(new URL("/unauthorized",req.url));
  }
  if(pathname.startsWith("/admin") && role!=="admin"){
    return NextResponse.redirect(new URL("/unauthorized",req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: '/((?!api/socket/updateLocation|api/socket/connect|api/auth|api/user/stripe/webhook|_next/static|_next/image|favicon.ico).*)',
}

// req--------middlware-----allow-----server


// login register api auth access public
// home and other pages - private