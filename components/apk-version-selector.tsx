'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { animate, createScope, spring } from 'animejs';
import { QRCode, QRCodeSkeleton, QRCodeCanvas, QRCodeOverlay } from './ui/qr-code';

interface ApkVersion {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  apk_available: boolean;
  apk_info: {
    name: string;
    download_url: string;
    size: number;
    download_count: number;
  } | null;
}

interface ApkVersionSelectorProps {
  versions: ApkVersion[];
  selectedVersion: ApkVersion;
}

export function ApkVersionSelector({ versions, selectedVersion }: ApkVersionSelectorProps) {
  const [selectedVersionId, setSelectedVersionId] = useState(selectedVersion.id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const scope = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Make container visible immediately
    setIsVisible(true);

    scope.current = createScope({ root: containerRef.current }).add((self) => {
      // Container entrance animation - use the actual DOM elements
      if (containerRef.current) {
        animate(containerRef.current, {
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutCubic'
        });
      }

      // Register method for version info animation
      self?.add('animateVersionInfo', () => {
        if (infoRef.current) {
          animate(infoRef.current, {
            translateX: [-20, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutCubic'
          });
        }
      });

      // Register method for download button animation
      self?.add('pulseDownloadButton', () => {
        const button = containerRef.current?.querySelector('.version-download-btn');
        if (button) {
          animate(button, {
            scale: [1, 0.95, 1],
            duration: 300,
            easing: 'easeInOutQuad'
          });
        }
      });
    });

    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    // Animate version info when version changes
    if (infoRef.current && currentVersion.apk_info) {
      // Reset opacity to 0 before animating
      if (infoRef.current) {
        infoRef.current.style.opacity = '0';
        infoRef.current.style.transform = 'translateX(-20px)';
      }
      
      setTimeout(() => {
        scope.current?.methods.animateVersionInfo();
      }, 10);
    }
  }, [selectedVersionId]);

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Button animation
    scope.current?.methods.pulseDownloadButton();

    try {
      const version = versions.find(v => v.id === selectedVersionId);
      if (!version?.apk_info) {
        console.error('No APK info available for selected version');
        return;
      } else {
        window.open(version.apk_info.download_url, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const currentVersion = versions.find(v => v.id === selectedVersionId) || selectedVersion;

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-4xl mx-auto space-y-6"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
      }}
    >
      {/* Version Selection */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Version
          </label>
          <Select 
            value={selectedVersionId.toString()} 
            onValueChange={(value) => setSelectedVersionId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{version.tag_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {version.name}
                    </Badge>
                    {version.id === selectedVersion.id && (
                      <Badge variant="default" className="text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          size="lg" 
          className="version-download-btn bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleDownload}
          disabled={isDownloading || !currentVersion.apk_info}
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download APK'}
        </Button>
      </div>

      {/* Version Info with QR Code */}
      {currentVersion.apk_info && (
        <div 
          ref={infoRef} 
          className="bg-gray-50 rounded-lg p-6"
          style={{ opacity: 0, transform: 'translateX(-20px)' }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* File Info - Left Side */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  {currentVersion.tag_name}
                </h3>
                <Badge variant="outline" className="ml-2">
                  {formatFileSize(currentVersion.apk_info.size)}
                </Badge>
                {currentVersion.id === selectedVersion.id && (
                  <Badge variant="default" className="ml-2">
                    Latest
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Released: {formatDate(currentVersion.published_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Downloads: {currentVersion.apk_info.download_count}</span>
                </div>
              </div>

              {/* File Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">File Information:</h4>
                <p className="text-sm text-gray-700">
                  {currentVersion.apk_info.name}
                </p>
              </div>
            </div>

            {/* QR Code - Right Side */}
            <div className="flex flex-col items-center gap-3 lg:border-l lg:pl-6 lg:border-gray-200">
              <h4 className="font-medium text-gray-900 text-sm">Scan to Download</h4>
              <QRCode
                value={currentVersion.apk_info.download_url}
                size={120}
                level="H"
              >
                <QRCodeSkeleton />
                <QRCodeCanvas />
                <QRCodeOverlay className="rounded-full border-2 border-white p-2">
                  <Package className="w-5 h-5 text-blue-600" />
                </QRCodeOverlay>
              </QRCode>
              <p className="text-xs text-gray-500 text-center max-w-[140px]">
                Scan this QR code to download<br />the APK directly to your device
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}