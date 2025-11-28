export function getBaseUrl(): string {
  // Client-side: use relative path
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // Server-side: use absolute URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Default to localhost
  return 'http://localhost:3000';
}

export function getExpressApiUrl(): string {
  if (process.env.EXPRESS_API_URL) {
    return process.env.EXPRESS_API_URL;
  }
  
  // If Express is running on a different port in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // In production, assume same domain if not specified
  return getBaseUrl();
}