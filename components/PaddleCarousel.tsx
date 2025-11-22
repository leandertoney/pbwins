"use client";

import { useState, useEffect } from "react";

// Add new paddle URLs here - just update this array!
const PADDLE_URLS = [
  "https://www.selkirk.com/products/selkirk-labs-project-boomstik?variant=43470006583398",
];

export default function PaddleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Auto-rotate every 5 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PADDLE_URLS.length);
        setIsTransitioning(false);
      }, 600); // Match transition duration
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Mystery Paddle Indicator */}
      <div className="text-center mb-8 space-y-3">
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl animate-pulse">❓</span>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Mystery Paddle Prize
          </h3>
          <span className="text-5xl animate-pulse">❓</span>
        </div>
        <p className="text-white/70 text-lg">
          Win one of these premium paddles - which one will it be? 🎁
        </p>
      </div>

      {/* 3D Carousel Container */}
      <div className="relative h-[500px] md:h-[600px] perspective-container">
        {/* Carousel Stage */}
        <div className="absolute inset-0 flex items-center justify-center">
          {PADDLE_URLS.map((url, index) => {
            const position = (index - currentIndex + PADDLE_URLS.length) % PADDLE_URLS.length;
            const isActive = position === 0;
            const isPrev = position === PADDLE_URLS.length - 1;
            const isNext = position === 1;

            let transformStyle = "";
            let zIndex = 0;
            let opacity = 0;
            let scale = 0.7;

            if (isActive) {
              transformStyle = "translateX(0) translateZ(0) rotateY(0deg)";
              zIndex = 30;
              opacity = 1;
              scale = 1;
            } else if (isPrev) {
              transformStyle = "translateX(-50%) translateZ(-200px) rotateY(45deg)";
              zIndex = 10;
              opacity = 0.3;
              scale = 0.75;
            } else if (isNext) {
              transformStyle = "translateX(50%) translateZ(-200px) rotateY(-45deg)";
              zIndex = 10;
              opacity = 0.3;
              scale = 0.75;
            } else {
              transformStyle = "translateX(0) translateZ(-400px) rotateY(0deg)";
              zIndex = 0;
              opacity = 0;
              scale = 0.5;
            }

            return (
              <div
                key={url}
                className="absolute transition-all duration-700 ease-in-out"
                style={{
                  transform: `${transformStyle} scale(${scale})`,
                  zIndex,
                  opacity,
                  width: "90%",
                  maxWidth: "600px",
                }}
              >
                {/* Paddle Preview Card */}
                <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Glow effect for active paddle */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 animate-pulse"></div>
                  )}

                  {/* iframe preview of URL */}
                  <div className="relative aspect-[4/3] bg-black/20">
                    <iframe
                      src={url}
                      className="w-full h-full border-0"
                      title={`Paddle option ${index + 1}`}
                      loading="lazy"
                      sandbox="allow-same-origin"
                    />
                    {/* Overlay to prevent interaction */}
                    <div className="absolute inset-0 bg-transparent pointer-events-auto cursor-default"></div>
                  </div>

                  {/* URL Label */}
                  <div className="relative bg-black/60 backdrop-blur-sm p-4 border-t border-white/10">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-light hover:text-brand transition text-sm truncate block"
                    >
                      {url}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rotation Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
          {PADDLE_URLS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-brand-light"
                  : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Sparkle effects around carousel */}
        <div className="absolute top-10 left-10 text-3xl animate-pulse" style={{ animationDelay: "0s" }}>✨</div>
        <div className="absolute top-20 right-10 text-3xl animate-pulse" style={{ animationDelay: "0.5s" }}>✨</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-pulse" style={{ animationDelay: "1s" }}>✨</div>
        <div className="absolute bottom-10 right-20 text-3xl animate-pulse" style={{ animationDelay: "1.5s" }}>✨</div>
      </div>

      {/* Paddle count indicator */}
      <div className="text-center mt-8 text-white/50 text-sm">
        Option {currentIndex + 1} of {PADDLE_URLS.length}
      </div>

      <style jsx>{`
        .perspective-container {
          perspective: 1200px;
          perspective-origin: 50% 50%;
        }
      `}</style>
    </div>
  );
}
