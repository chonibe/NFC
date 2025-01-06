import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.thestreetlamp.com/apps/verisart', {
      headers: {
        'Cookie': 'storefront_digest=xxxxx', // We'll need the actual cookie
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Referer': 'https://www.thestreetlamp.com'
      },
      credentials: 'include'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
