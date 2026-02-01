import { NextResponse } from 'next/server';

export function middleware(request) {
    const host = request.headers.get('host');

    // Domain Merge: Redirect krappiert.online -> krappieren.com
    if (host && host.includes('krappiert.online')) {
        const url = request.nextUrl.clone();
        url.host = 'krappieren.com';
        url.protocol = 'https';
        url.port = ''; // Clear port if any (dev mostly)
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
