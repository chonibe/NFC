import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const runtime = "edge";
export const preferredRegion = ["iad1"];

export async function GET(request) {
  const dashboardHTML = `<div id="verisart-app"><div class="ver-mx-20 ver-flex ver-flex-col ver-my-5">
    <!-- Full HTML goes here -->
  </div></div>`;

  try {
    return new NextResponse(dashboardHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
