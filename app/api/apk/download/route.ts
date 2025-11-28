import { NextRequest, NextResponse } from 'next/server';
import { getExpressApiUrl } from '@/lib/url-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');
    
    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version parameter is required' },
        { status: 400 }
      );
    }

    const expressApiUrl = getExpressApiUrl();
    let downloadUrl = '';

    if (version === "latest") {
      downloadUrl = `${expressApiUrl}/api/download/latest`;
    } else {
      downloadUrl = `${expressApiUrl}/api/download/${version}`;
    }

    // Instead of redirecting, return the download URL as JSON
    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl
    });
    
  } catch (error: any) {
    console.error('Error in download API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Download failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}