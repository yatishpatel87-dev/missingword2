import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface FirecrackersCelebrationProps {
  studentName: string;
  totalScore: number;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  radius: number;
  decay: number;
  sparkle?: boolean;
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
}

export const FirecrackersCelebration: React.FC<FirecrackersCelebrationProps> = ({
  studentName,
  totalScore,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());
  const animationFrameRef = useRef<number | null>(null);

  // 10-second countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When timer hits 0, auto proceed after short grace
  useEffect(() => {
    if (secondsRemaining === 0) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [secondsRemaining, onComplete]);

  // Confetti bursts at milestones
  useEffect(() => {
    const triggerConfetti = () => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
      });
    };

    triggerConfetti();
    const interval = setInterval(triggerConfetti, 2200);
    return () => clearInterval(interval);
  }, []);

  // Canvas firecracker engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    const colors = [
      '#FFD700', // Gold
      '#FF4500', // OrangeRed
      '#FF1493', // DeepPink
      '#00FF7F', // SpringGreen
      '#00BFFF', // DeepSkyBlue
      '#FF69B4', // HotPink
      '#FFFF00', // Yellow
      '#FF3366', // Vibrant Red
      '#7B68EE', // Medium Slate Blue
    ];

    const createExplosion = (x: number, y: number, color: string) => {
      sound.playFirecracker();
      const count = 70 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: Math.random() > 0.3 ? color : '#FFFFFF',
          radius: Math.random() * 3 + 1.5,
          decay: Math.random() * 0.018 + 0.012,
          sparkle: Math.random() > 0.5,
        });
      }

      // Ground sparklers shower
      for (let j = 0; j < 15; j++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * (Math.random() * 3 + 1),
          vy: Math.sin(angle) * (Math.random() * 3 + 1),
          alpha: 1,
          color: '#FFEA00',
          radius: 1.5,
          decay: 0.03,
          sparkle: true,
        });
      }
    };

    const launchRocket = () => {
      const startX = Math.random() * (width - 100) + 50;
      const targetY = Math.random() * (height * 0.45) + 60;
      rockets.push({
        x: startX,
        y: height,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 5 + 11),
        targetY,
        color: colors[Math.floor(Math.random() * colors.length)],
        exploded: false,
      });
    };

    // Initial rockets
    launchRocket();
    launchRocket();

    let lastRocketTime = Date.now();

    const render = () => {
      // Semi-transparent dark background for realistic glow trail
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Launch new rockets periodically
      const now = Date.now();
      if (now - lastRocketTime > 400 + Math.random() * 350) {
        launchRocket();
        lastRocketTime = now;
      }

      // Update & draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.12; // gravity

        // Rocket spark trail
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF7ED';
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.fill();

        // Rocket tail sparks
        for (let t = 0; t < 3; t++) {
          particles.push({
            x: r.x + (Math.random() - 0.5) * 4,
            y: r.y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2 + 1,
            alpha: 0.7,
            color: '#FFB703',
            radius: 1.5,
            decay: 0.05,
          });
        }

        if (r.y <= r.targetY || r.vy >= -1) {
          createExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.vx *= 0.98; // air drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.sparkle && Math.random() > 0.5 ? '#FFFFFF' : p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.sparkle ? 12 : 6;
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleReplay = () => {
    setSecondsRemaining(10);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      {/* Background Fireworks Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none w-full h-full" />

      {/* Top Banner with 10-Second Countdown */}
      <header className="relative z-10 w-full max-w-2xl bg-slate-900/85 backdrop-blur-md border border-amber-400/40 rounded-2xl p-4 shadow-2xl text-center text-white mt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎆</span>
            <span className="font-bold text-amber-300 text-lg tracking-wide">
              Celebration Crackers!
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-amber-400/30 transition-colors"
              title={isMuted ? 'Unmute celebration sound' : 'Mute sound'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/60 rounded-full text-amber-300 font-mono font-bold text-base">
              <span>⏱️</span>
              <span>{secondsRemaining}s</span>
            </div>
          </div>
        </div>

        {/* 10-second Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-amber-400/20">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsRemaining / 10) * 100}%` }}
          />
        </div>
      </header>

      {/* Hero Victory Center Box */}
      <div className="relative z-10 my-auto text-center px-4 max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/30 border border-amber-300/60 text-amber-200 text-sm font-semibold mb-3 shadow-lg animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>All 20 Challenges Completed! વાક્યો પૂર્ણ કર્યા!</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 drop-shadow-md font-fun mb-2">
          Hooray, Detective {studentName}!
        </h1>

        <p className="text-slate-300 text-base sm:text-lg mb-4 font-gujarati">
          તમે અદ્ભુત રીતે રહસ્યમય શબ્દો શોધી કાઢ્યા છે!
        </p>

        <div className="inline-block bg-slate-900/80 backdrop-blur-sm border border-amber-500/40 rounded-2xl p-4 shadow-xl mb-4">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            Total Detective Score
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
            {totalScore.toLocaleString()} <span className="text-lg text-amber-400 font-normal">pts</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <footer className="relative z-10 w-full max-w-md flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={handleReplay}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600 text-slate-200 font-semibold transition-all hover:scale-[1.02] shadow-lg"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Replay 10s Crackers 🎆</span>
        </button>

        <button
          onClick={onComplete}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-xl transition-all hover:scale-[1.02]"
        >
          <span>View Report & Certificate</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
