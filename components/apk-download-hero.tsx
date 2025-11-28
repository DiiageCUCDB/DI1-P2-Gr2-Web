"use client";

import { Shield, Download, Smartphone, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { animate, createScope, spring } from 'animejs';

export function ApkDownloadHero() {
  const [isDownloading, setIsDownloading] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scope = useRef<any>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    scope.current = createScope({ root: heroRef.current }).add((self) => {
      // Hero title animation
      animate('h1, p, .badge', {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        delay: (el, i) => i * 200,
        easing: 'easeOutCubic'
      });
      
      // Register method for button animations
      animate('.download-btn', {
        scale: [1, 1.05, 1],
        duration: 2000,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate'
      });

      self.add('successButton', () => {
        animate('.download-btn', {
          backgroundColor: ['#f59e0b', '#10b981'],
          scale: [1, 1.05, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .8)'
        });
      });

      self.add('errorButton', () => {
        animate('.download-btn', {
          backgroundColor: ['#f59e0b', '#ef4444'],
          scale: [1, 0.98, 1],
          duration: 400,
          easing: 'easeOutQuad'
        });
      });
    });

    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    if (!featuresRef.current) return;

    // Animate features when they come into view
    const observer = new IntersectionObserver(
        (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && scope.current) {
            animate('.feature-card', {
                translateX: [240, 0], // Changed from translateY to translateX
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 600,
                delay: (el, i) => i * 150 + 500,
                easing: 'easeOutCubic'
            });
            
            observer.unobserve(entry.target);
            }
        });
        },
        { threshold: 0.3 }
    );

    observer.observe(featuresRef.current);

    return () => observer.disconnect();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/apk/download?version=latest`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.downloadUrl) {
          // Success animation
          scope.current?.methods.successButton();
          
          // Open the download URL after animation
          setTimeout(() => {
            window.open(data.downloadUrl, '_blank');
          }, 500);
        } else {
          console.error('Failed to get download URL:', data.error);
          scope.current?.methods.errorButton();
        }
      } else {
        console.error('API request failed');
        scope.current?.methods.errorButton();
      }
    } catch (error) {
      console.error('Download failed:', error);
      scope.current?.methods.errorButton();
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Learn cybersecurity',
      description: 'Fun challenges to test your cyber-knowledge'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Seamless experience on all mobile devices'
    },
    {
      icon: Users,
      title: 'Teaching-oriented app',
      description: 'Built for educational institutions'
    }
  ];

  return (
    <section ref={heroRef} className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-sky to-blue-dark overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-custom/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <div className="badge inline-flex items-center rounded-full border border-blue-sky bg-white px-3 py-1 text-sm font-medium text-blue-dark">
              <Download className="w-4 h-4 mr-2" />
              Download Now Available
            </div>
            
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
              Web EduSec
              <span className="block text-yellow-custom">
                Mobile App
              </span>
            </h1>
            
            <p className="text-xl text-white max-w-2xl mx-auto">
              Secure, reliable, and feature-rich mobile application for educational security management. 
              Download the latest version and get started today.
            </p>
          </div>

          {/* Features Grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-blue-sky hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
              >
                <div className="p-3 bg-blue-sky rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-blue-dark" />
                </div>
                <h3 className="text-lg font-semibold text-blue-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-dark text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <div className="pt-8">
            <button 
              className="download-btn bg-yellow-custom text-blue-dark px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="w-5 h-5 inline mr-2" />
              {isDownloading ? 'Preparing Download...' : 'Download APK'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}