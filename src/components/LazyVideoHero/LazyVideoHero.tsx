import { useEffect, useRef, useState } from 'react';

interface LazyVideoHeroProps {
  children?: React.ReactNode;
}

export default function LazyVideoHero({ children }: LazyVideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.1 }
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
        style={{ contain: 'strict', willChange: 'transform' }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{
            filter: 'contrast(1.1) brightness(0.85) saturate(1.1)',
            opacity: isIntersecting ? 1 : 0,
            contain: 'strict',
          }}
        >
          <source src="/video/whatsapp-video.mp4" type="video/mp4" />
          <source src="/video/whatsapp-video.webm" type="video/webm" />
        </video>

        {/* High-Contrast Glassmorphic Overlay Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
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
