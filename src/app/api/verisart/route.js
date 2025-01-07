export async function GET() {
  try {
    const response = await fetch('https://www.thestreetlamp.com/apps/verisart', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Origin': 'https://www.thestreetlamp.com'
      }
    });

    const html = await response.text();
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
