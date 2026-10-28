import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return new NextResponse('URL parameter is missing', { status: 400 });
  }

  try {
    const targetUrl = decodeURIComponent(urlParam);
    const parsedTarget = new URL(targetUrl);

    // Ambil konten dari situs sumber melalui server
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': parsedTarget.origin,
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch target: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'text/html';
    let body: string | ArrayBuffer = await response.text();

    const newHeaders = new Headers();
    newHeaders.set('Content-Type', contentType);

    // SANGAT PENTING: Jangan teruskan header keamanan pembatas dari target
    // Hapus X-Frame-Options dan Content-Security-Policy milik videonode.de
    newHeaders.delete('x-frame-options');
    newHeaders.delete('content-security-policy');
    newHeaders.delete('content-security-policy-report-only');

    // Jika konten adalah HTML, kita bisa menyuntikkan tag <base> agar path relatif 
    // seperti file script/css merujuk langsung ke domain asal (videonode.de)
    if (contentType.includes('text/html')) {
      // Sisipkan tag <base href="..."> tepat setelah tag <head>
      const baseTag = `<base href="${parsedTarget.origin}/">`;
      if (body.includes('<head>')) {
        body = body.replace('<head>', `<head>\n${baseTag}`);
      } else if (body.includes('<HEAD>')) {
        body = body.replace('<HEAD>', `<HEAD>\n${baseTag}`);
      }
    }

    return new NextResponse(body, {
      status: 200,
      headers: newHeaders,
    });
  } catch (error: any) {
    return new NextResponse(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
