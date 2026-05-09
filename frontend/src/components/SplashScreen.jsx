import React, { useEffect, useState } from 'react';

/**
 * SplashScreen Component
 * A premium, fullscreen loading screen for SplitIt.
 * Features:
 * - Fade-in and scale animation for the logo.
 * - Soft purple glow background.
 * - Minimal circular spinner.
 * - Smooth transition when finished.
 */
const SplashScreen = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate initial loading (e.g., fetching user data, checking auth)
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to finish before calling onComplete
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 2500); // Total splash duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-glow" />

      {/* Content Container */}
      <div className="relative flex flex-col items-center">
        {/* Logo with Glow Effect */}
        <div className="animate-fade-in-scale mb-8 relative group">
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-150 animate-pulse-glow opacity-50" />
          <img
            src="/logo.png"
            alt="SplitIt Logo"
            className="w-32 h-auto relative z-10 rounded-2xl shadow-2xl purple-glow transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              console.warn('Logo image not found at /public/logo.png');
            }}
          />
        </div>

        {/* Tagline (Optional Enhancement) */}
        <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-12 animate-fade-in-scale [animation-delay:200ms] opacity-0 fill-mode-forwards">
          Splitting made simple
        </p>

        {/* Minimal Spinner Loader */}
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500/20 rounded-full" />
          <div className="absolute w-8 h-8 border-2 border-t-purple-500 rounded-full animate-slow-rotate" />
        </div>
      </div>

      {/* Footer Branding (Optional) */}
      <div className="absolute bottom-12 text-gray-600 text-[10px] font-bold tracking-[0.2em] uppercase">
        Secure Fintech Infrastructure
      </div>
    </div>
  );
};

export default SplashScreen;
