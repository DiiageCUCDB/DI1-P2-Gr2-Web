import { ApkDownloadHero } from '@/components/apk-download-hero';
import { ApkVersionSelector } from '@/components/apk-version-selector';
import { getBaseUrl } from '@/lib/url-utils';
import { Shield } from 'lucide-react';

async function getReleases() {
  try {
    // For server components, we need to use the full URL
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/api/releases`, {
      //next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch releases');
    }
    
    const data = await response.json();

    // The API returns { result: { releases: [...] } }
    const releases = data.result?.releases || data.releases || [];
    
    // Filter only releases with APK available and sort by published date (newest first)
    const releasesWithApk = releases
      .filter((release: any) => release.apk_available)
      .sort((a: any, b: any) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    
    return releasesWithApk;
  } catch (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
}

export default async function HomePage() {
  const releases = await getReleases();
  const latestVersion = releases[0] || null;

  console.log('Rendering with releases:', releases);
  console.log('Latest version:', latestVersion);

  return (
    <main className="min-h-screen">
      <ApkDownloadHero />
      
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tighter text-blue-dark">
                Download Latest Version
              </h2>
              <p className="text-blue-dark">
                Choose your preferred version below. We recommend using the latest 
                stable release for the best experience and security.
              </p>
            </div>

            {latestVersion ? (
              <ApkVersionSelector 
                versions={releases} 
                selectedVersion={latestVersion}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-dark">No versions available at the moment.</p>
                <p className="text-blue-dark text-sm mt-2">
                  Check the GitHub repository for available releases.
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mt-12">
              <div className="space-y-4 p-6 bg-blue-sky rounded-lg border border-blue-dark">
                <h3 className="text-lg font-semibold text-blue-dark">
                  System Requirements
                </h3>
                <ul className="space-y-2 text-sm text-blue-dark">
                  <li>• Android 13.0+ (Tiramisu)</li>
                  <li>• 2GB RAM minimum</li>
                  <li>• 50MB free storage</li>
                  <li>• Internet connection</li>
                </ul>
              </div>
              
              <div className="space-y-4 p-6 bg-blue-sky rounded-lg border border-blue-dark">
                <h3 className="text-lg font-semibold text-blue-dark">
                  Installation Guide
                </h3>
                <ul className="space-y-2 text-sm text-blue-dark">
                  <li>1. Download the APK file</li>
                  <li>2. Enable "Install from unknown sources"</li>
                  <li>3. Open the downloaded file</li>
                  <li>4. Follow installation prompts</li>
                </ul>
              </div>
            </div>

            {/* Security Notice */}
            <div className="max-w-4xl w-full mt-8">
              <div className="p-6 bg-yellow-custom rounded-lg border border-blue-dark">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-dark mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-dark mb-2">
                      Security Notice
                    </h4>
                    <p className="text-blue-dark text-sm">
                      This app is designed for educational purposes only. Always download 
                      from official sources and ensure your device security settings 
                      are properly configured.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}