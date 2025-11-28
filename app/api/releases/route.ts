import { NextResponse } from 'next/server';
import { getExpressApiUrl } from '@/lib/url-utils';

export async function GET() {
  try {
    const expressApiUrl = getExpressApiUrl();
    const response = await fetch(`${expressApiUrl}/api/download/releases`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Express API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching releases:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch releases',
        details: error.message
      },
      { status: 500 }
    );
  }
}