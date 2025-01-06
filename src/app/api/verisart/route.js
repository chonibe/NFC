import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.thestreetlamp.com/apps/verisart', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.thestreetlamp.com/',
        'Origin': 'https://www.thestreetlamp.com'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
