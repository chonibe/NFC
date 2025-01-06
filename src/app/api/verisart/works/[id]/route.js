import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const response = await fetch(`https://www.thestreetlamp.com/apps/verisart/works/${params.id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = await response.text();
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch artwork data' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
