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
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (videoRef.current) {
          if (entry.isIntersecting) {
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
      {/* Ambient Mesh Backdrop (Used when video is loading or absent) */}
      <div className="absolute top-0 left-0 right-0 h-[650px] overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #F97316 0%, #FB923C 100%)' }}
        />
        <div 
          className="absolute top-[10%] -right-[10%] w-[50%] h-[70%] rounded-full opacity-15 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #EA580C 0%, #F97316 100%)' }}
        />
      </div>

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
          onPlaying={() => setIsVideoPlaying(true)}
          onError={() => setIsVideoPlaying(false)}
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{
            filter: 'contrast(1.08) brightness(0.85) saturate(1.05)',
            opacity: (isIntersecting && isVideoPlaying) ? 1 : 0,
            contain: 'strict',
          }}
        >
          <source src="/video/whatsapp-video.mp4" type="video/mp4" />
          <source src="/video/whatsapp-video.webm" type="video/webm" />
          <source src="/video/RIT Video.mp4" type="video/mp4" />
          <source src="/video/RIT Video.webm" type="video/webm" />
        </video>

        {/* High-Contrast Glassmorphic Overlay Gradient (Only active when video plays) */}
        {isVideoPlaying && (
          <div 
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.75) 100%)',
            }}
          />
        )}
      </div>

      {/* ─── Hero Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
