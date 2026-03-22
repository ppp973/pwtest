import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const apiKey = '64cb3994119c683652e7f241880b1f4b3dda5e37';
    const randomAlias = 'v' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
    const apiUrl = `https://vplink.in/api?api=${apiKey}&url=${encodeURIComponent(url)}&alias=${randomAlias}&format=text`;

    const response = await fetch(apiUrl);
    const shortUrl = await response.text();

    if (!shortUrl || shortUrl.includes('error') || shortUrl.includes('Invalid') || shortUrl.includes('{"status":"error"')) {
      console.error('VPLINK API Error:', shortUrl);
      return NextResponse.json({ error: 'Failed to shorten URL', details: shortUrl }, { status: 500 });
    }

    return NextResponse.json({ shortUrl: shortUrl.trim() });
  } catch (error) {
    console.error('Shorten API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
