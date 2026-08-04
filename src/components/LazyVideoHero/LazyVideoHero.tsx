import { useEffect, useRef, useState } from 'react';

interface LazyVideoHeroProps {
  children?: React.ReactNode;
}

export default function LazyVideoHero({ children }: LazyVideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(() => {
              // Ignore autoplay restrictions if browser blocks
            });
          } else {
            videoRef.current.pause();
          }
        }
      },
      {
        threshold: 0.1, // Pause when 90% of section is out of view
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      {/* ─── Optimized Video Background ────────────────────────────────────────── */}
      <div 
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        style={{
          contain: 'strict',
          willChange: 'transform',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{
            filter: 'contrast(1.08) brightness(0.85) saturate(1.05)',
            opacity: isIntersecting ? 1 : 0,
            contain: 'strict',
          }}
        >
          <source src="/video/whatsapp-video.mp4" type="video/mp4" />
          <source src="/video/whatsapp-video.webm" type="video/webm" />
          <source src="/video/RIT Video.mp4" type="video/mp4" />
          <source src="/video/RIT Video.webm" type="video/webm" />
        </video>

        {/* High-Contrast Glassmorphic Overlay Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.75) 100%)',
          }}
        />
      </div>

      {/* ─── Hero Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
