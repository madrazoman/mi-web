import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';

const PROJECTS = [
  {
    id: 'warriorcats',
    title: "Warrior Cats: Clans of the Forest",
    year: "2026",
    platforms: "PlayStation 5 • Switch 2 • XBOX Series X|S • PC",
    platforms_short: "PS5 • Switch • XBOX • PC",
    tech: "Unreal Engine / Handheld Optimization",
    img: "/assets/proj/warriorcats.png"
  },
  {
    id: 'hwr',
    title: "Hot Wheels: Let's Race",
    year: "2025",
    platforms: "PlayStation 5 • XBOX Series X|S • Switch • PC",
    platforms_short: "PS5 • XBOX • Switch • PC",
    tech: "Unreal Engine / Logitech Wheel",
    img: "/assets/proj/hwr.png"
  },
  {
    id: 'lts',
    title: "Looney Tunes: Wacky World of Sports",
    year: "2024",
    platforms: "PlayStation 5/4 • XBOX Series X|S • Switch • PC",
    platforms_short: "PS • XBOX • Switch • PC",
    tech: "Unreal Engine / Core Systems & Multiplayer",
    img: "/assets/proj/lts.png"
  },
  {
    id: 'dwr',
    title: "Dreamworks All-Star Kart Racing",
    year: "2023",
    platforms: "PlayStation 5/4 • XBOX • Switch • PC",
    platforms_short: "PS • XBOX • Switch • PC",
    tech: "Unreal Engine / CPU & GPU Frame-Time Optimization",
    img: "/assets/proj/dwr.png"
  },
  {
    id: 'ala',
    title: "Avatar: The Last Airbender – Quest for Balance",
    year: "2023",
    platforms: "PlayStation 5/4 • XBOX Series X|S • Switch • PC",
    platforms_short: "PS • XBOX • Switch • PC",
    tech: "Unreal Engine / VFX & Friend Invite",
    img: "/assets/proj/ala.png"
  },
  {
    id: 'nkr3',
    title: "Nickelodeon Kart Racers 3: Slime Speedway",
    year: "2022",
    platforms: "PlayStation 5/4 • XBOX Series X|S • Switch • PC",
    platforms_short: "PS • XBOX • Switch • PC",
    tech: "Custom Dynamic Slime Shader & Distance Fields",
    img: "/assets/proj/nkr3.png"
  },
  {
    id: 'nkr2',
    title: "Nickelodeon Kart Racers 2: Grand Prix",
    year: "2020",
    platforms: "Playstation 4 • XB1 • Switch • PC",
    platforms_short: "PS4 • XB1 • Switch • PC",
    tech: "Real-Time Rendering Pipeline & Memory Profiling",
    img: "/assets/proj/nkr2.png"
  },
  {
    id: 'nkr1',
    title: "Nickelodeon Kart Racers",
    year: "2018",
    platforms: "Playstation 4 • XB1 • Switch • PC",
    platforms_short: "PS4 • XB1 • Switch • PC",
    tech: "Custom C++ Engine Architecture",
    img: "/assets/proj/nkr1.png"
  },
  {
    id: 'powerrangers',
    title: "S.M.M. Power Rangers: Mega Battle",
    year: "2017",
    platforms: "Playstation 4 • XB1",
    platforms_short: "PS4 • XB1",
    tech: "PlayStation Gnmx / DirectX Native API Port",
    img: "/assets/proj/powerrangers.png"
  },
  {
    id: 'kiilka',
    title: "Kilka: Card Gods",
    year: "2014",
    platforms: "PlayStation Vita • Android • iOS",
    platforms_short: "PS Vita • Android • iOS",
    tech: "1st LatAm Studio Release on Sony Hardware",
    img: "/assets/proj/kiilka.png"
  },
  {
    id: 'kizi',
    title: "Kizi Adventures",
    year: "2014",
    platforms: "Android • iOS",
    platforms_short: "Android • iOS",
    tech: "Cross-Platform C++ Mobile Engine",
    img: "/assets/proj/kizi.png"
  }
];

// 3 sets prevent right-edge scroll clamping & flickering on 4K / ultra-wide monitors
const INFINITE_PROJECTS = [...PROJECTS, ...PROJECTS, ...PROJECTS];

const CUBE_FACES = [
  { cls: 'face-front', label: 'CORE', value: 'C++23' },
  { cls: 'face-back', label: 'ENGINE', value: 'UE 4/5' },
  { cls: 'face-right', label: 'SHADERS', value: 'HLSL' },
  { cls: 'face-left', label: 'GRAPHICS', value: 'DirectX' },
  { cls: 'face-top', label: 'CHROMIUM', value: 'ANGLE' },
  { cls: 'face-bottom', label: 'CONSOLE', value: 'GNMX' }
];

const TABS = [
  { id: 'overview', label: 'Profile', short: 'Profile' },
  { id: 'architecture', label: 'Architecture & R&D', short: 'Architecture' },
  { id: 'academic', label: 'Waseda & Open Source', short: 'Academic' }
];

const CYAN = '#00E5FF';
const ORANGE = '#FF9A1F';

const HOLD_MS = 8000;
const AUTO_PAUSE_MS = 2800;
const TAP_SLOP = 8;

function Panel({ children, className = '' }) {
  return (
    <div className={`tron-panel ${className}`}>
      <div className="tron-panel-inner">{children}</div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);
  const [appScale, setAppScale] = useState(1);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const appScaleRef = useRef(1);
  const cubeRef = useRef(null);
  const carouselRef = useRef(null);

  const physics = useRef({
    rotX: -22,
    rotY: 35,
    velRotX: 0,
    velRotY: 0,
    scrollPos: 0,
    baseCarouselSpeed: 1.35,
    carouselBoost: 0,
    targetScroll: null,
    isDragging: false,
    dragActive: false,
    dragGain: 1,
    downX: 0,
    startX: 0,
    lastMoveTime: 0,
    isPaused: false,
    holdUntil: 0,
    pauseUntil: 0,
    lastStoppedIndex: -1,
    lastSelectedId: null,
    cubeDragging: false,
    cubeMoved: 0,
    cubeLastX: 0,
    cubeLastY: 0,
    reduceMotion: false,
    dragVelocity: 0,
    dragTotal: 0,
    isInitialized: false,
    isAutoMode: false
  });

  const releaseHold = useCallback(() => {
    const p = physics.current;
    p.isPaused = false;
    p.holdUntil = 0;
  }, []);

  useEffect(() => {
    physics.current.isAutoMode = isAutoMode;
  }, [isAutoMode]);

  useEffect(() => {
    let timeoutId = null;

    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let nextScale = 1;

      if (w < 768 && h > w) {
        // Mobile Portrait (intacto)
        nextScale = Math.min(Math.max(w / 360, 0.88), 1.12);
      } else if (h < 520 && w > h) {
        // Mobile Landscape
        nextScale = Math.min(Math.max(h / 760, 0.45), 0.75);
      } else {
        // PC / Tablet / Monitores (1080p, 1440p, 4K):
        // Respetamos tus escalas por ancho (w) Y limitamos por alto (h / 920)
        // para que en 1080p el carrusel nunca aplaste el panel central.
        let widthScale = 1;
        if (w < 400) {
          widthScale = Math.min(Math.max(w / 1200, 0.3), 1.5);
        } else if (w < 1000) {
          widthScale = Math.min(Math.max(w / 1400, 0.4), 1.5);
        } else if (w < 1620) {
          widthScale = Math.min(Math.max(w / 1600, 0.55), 1.5);
        } else {
          widthScale = Math.min(Math.max(w / 1800, 0.8), 1.5);
        }
        const heightCap = Math.min(Math.max(h / 920, 0.5), 1.5);
        nextScale = Math.min(widthScale, heightCap);
      }

      appScaleRef.current = nextScale;
      setAppScale(nextScale);
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScale, 100);
    };

    updateScale();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const p = physics.current;
    p.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame;

    const tick = () => {
      const now = performance.now();

      // 1. 3D cube: idle spin + momentum
      if (!p.cubeDragging) {
        p.rotY += (p.reduceMotion ? 0 : 0.22) + p.velRotY;
        p.rotX += (p.reduceMotion ? 0 : 0.06) + p.velRotX;
        p.velRotY *= 0.94;
        p.velRotX *= 0.94;
      }
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateX(${p.rotX}deg) rotateY(${p.rotY}deg)`;
      }

      // 2. Infinite carousel (3 sets: stay inside middle set [loop, 2*loop) to avoid 4K edge clamping)
      const el = carouselRef.current;
      if (el && el.children.length >= PROJECTS.length * 2) {
        const loop = el.children[PROJECTS.length].offsetLeft - el.children[0].offsetLeft;

        if (!p.isInitialized && el.clientWidth > 0 && loop > 0) {
          const startIndex = PROJECTS.length;
          const startCard = el.children[startIndex];
          const target = startCard.offsetLeft - el.clientWidth / 2 + startCard.offsetWidth / 2;

          p.scrollPos = target;
          el.scrollLeft = Math.round(target);
          p.isInitialized = true;
        }

        if (p.pauseUntil > 0 && now >= p.pauseUntil) {
          p.pauseUntil = 0;
          if (!p.isPaused && !p.isDragging) {
            if (p.lastSelectedId !== null) {
              p.lastSelectedId = null;
              setSelectedProject(null);
            }
          }
        }

        const isAutoPaused = p.pauseUntil > now;

        if (!p.isDragging) {
          if (p.targetScroll !== null && loop > 0) {
            let diff = (((p.targetScroll - p.scrollPos) % loop) + loop) % loop;
            if (diff > loop / 2) diff -= loop;
            if (Math.abs(diff) < 0.6) {
              p.scrollPos += diff;
              p.targetScroll = null;
            } else {
              p.scrollPos += diff * 0.2;
            }
          }

          const stopped = p.isPaused || isAutoPaused || p.reduceMotion;
          const speed = stopped ? 0.0 : p.baseCarouselSpeed;
          p.scrollPos += speed + p.carouselBoost;
          p.carouselBoost *= 0.92;
          if (Math.abs(p.carouselBoost) < 0.05) p.carouselBoost = 0;

          if (loop > 0) {
            if (p.scrollPos >= loop * 2) {
              p.scrollPos -= loop;
              if (p.lastStoppedIndex >= PROJECTS.length) {
                p.lastStoppedIndex -= PROJECTS.length;
              }
            } else if (p.scrollPos < loop * 0.5) {
              p.scrollPos += loop;
              if (p.lastStoppedIndex >= 0 && p.lastStoppedIndex < PROJECTS.length * 2) {
                p.lastStoppedIndex += PROJECTS.length;
              }
            }
            el.scrollLeft = Math.round(p.scrollPos);
          }
        }

        // 3. Dynamic opacity & closest-to-centre detection
        const currentScroll = el.scrollLeft;
        const containerCenter = el.clientWidth / 2;
        const maxDist = el.clientWidth / 1.5;

        let closestIndex = -1;
        let minDist = Infinity;

        for (let i = 0; i < el.children.length; i++) {
          const card = el.children[i];
          const cardCenter = card.offsetLeft + card.offsetWidth / 2 - currentScroll;
          const dist = Math.abs(cardCenter - containerCenter);

          if (dist < minDist) {
            minDist = dist;
            closestIndex = i;
          }

          const img = card.querySelector('.carousel-card-img');
          const isSelected = card.getAttribute('aria-pressed') === 'true';

          if (img) {
            const targetOp = isSelected
              ? '1'
              : (1 - Math.min(Math.max(dist / maxDist, 0), 1) * 0.65).toFixed(2);
            if (img.style.opacity !== targetOp) {
              img.style.opacity = targetOp;
            }
          }
        }

        if (p.isPaused && !p.isDragging && now >= p.holdUntil) {
          releaseHold();
          p.pauseUntil = 0;
          if (closestIndex !== -1 && minDist <= 45) p.lastStoppedIndex = closestIndex;
          if (p.lastSelectedId !== null) {
            p.lastSelectedId = null;
            setSelectedProject(null);
          }
        }

        if (!p.isPaused && p.lastStoppedIndex !== -1 && closestIndex !== -1) {
          const stoppedCard = el.children[p.lastStoppedIndex];
          if (stoppedCard) {
            const stoppedCenter = stoppedCard.offsetLeft + stoppedCard.offsetWidth / 2 - currentScroll;
            if (Math.abs(stoppedCenter - containerCenter) > 45) {
              p.lastStoppedIndex = -1;
            }
          }
        }

        const isActivelyDragging = p.isDragging && p.dragActive;
        if (isActivelyDragging || Math.abs(p.carouselBoost) > 6) {
          p.pauseUntil = 0;
          if (p.lastSelectedId !== null) {
            p.lastSelectedId = null;
            setSelectedProject(null);
          }
        } else if (
          p.isAutoMode &&
          !p.isDragging &&
          !p.isPaused &&
          !isAutoPaused &&
          Math.abs(p.carouselBoost) < 3.5 &&
          closestIndex !== -1 &&
          minDist <= 10 &&
          p.lastStoppedIndex !== closestIndex &&
          !p.reduceMotion
        ) {
          const cardNode = el.children[closestIndex];
          const targetScrollLeft = cardNode.offsetLeft - containerCenter + cardNode.offsetWidth / 2;

          p.scrollPos = targetScrollLeft;
          el.scrollLeft = Math.round(targetScrollLeft);
          p.carouselBoost = 0;
          p.pauseUntil = now + AUTO_PAUSE_MS;
          p.lastStoppedIndex = closestIndex;

          const proj = INFINITE_PROJECTS[closestIndex];
          if (proj && p.lastSelectedId !== proj.id) {
            p.lastSelectedId = proj.id;
            setSelectedProject(proj);
          }
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [releaseHold]);

  /* ---------- input handlers ---------- */
  const handleWheel = (e) => {
    const panel = e.target && e.target.closest ? e.target.closest('.tron-panel-inner') : null;
    if (panel && panel.scrollHeight > panel.clientHeight + 1) return;

    const p = physics.current;
    p.velRotY += e.deltaY * 0.018;
    p.velRotX += e.deltaY * 0.008;
    p.pauseUntil = 0;
    p.targetScroll = null;
    releaseHold();
    p.carouselBoost += e.deltaY * 0.06;
  };

  const boostCarousel = (amount) => {
    const p = physics.current;
    p.pauseUntil = 0;
    p.targetScroll = null;
    releaseHold();
    p.lastStoppedIndex = -1;
    p.carouselBoost += amount;
    p.velRotY += amount * 0.10;
  };

  const onCarouselDown = (e) => {
    const el = carouselRef.current;
    if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const p = physics.current;
    const x = e.clientX / appScaleRef.current;
    p.isDragging = true;
    p.dragActive = false;
    p.dragGain = e.pointerType === 'mouse' ? 1.35 : 1;
    p.downX = x;
    p.startX = x;
    p.dragTotal = 0;
    p.dragVelocity = 0;
    p.lastMoveTime = e.timeStamp;
    p.carouselBoost = 0;
    p.targetScroll = null;
  };

  const onCarouselMove = (e) => {
    const p = physics.current;
    const el = carouselRef.current;
    if (!p.isDragging || !el) return;

    const x = e.clientX / appScaleRef.current;
    const dx = x - p.startX;
    p.startX = x;
    p.dragTotal = Math.max(p.dragTotal, Math.abs(x - p.downX));

    if (!p.dragActive) {
      if (p.dragTotal < TAP_SLOP) return;
      p.dragActive = true;
      p.pauseUntil = 0;
      p.lastStoppedIndex = -1;
      releaseHold();
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      p.lastMoveTime = e.timeStamp;
      return;
    }

    const dt = Math.max(e.timeStamp - p.lastMoveTime, 1);
    p.lastMoveTime = e.timeStamp;
    if (Math.abs(dx) > 0.2) {
      p.dragVelocity = p.dragVelocity * 0.35 + (dx / dt) * 16.7 * 0.65;
    }

    p.scrollPos -= dx * p.dragGain;

    const loop = el.children.length > PROJECTS.length
      ? el.children[PROJECTS.length].offsetLeft - el.children[0].offsetLeft
      : 0;
    if (loop > 0) {
      if (p.scrollPos >= loop * 2) p.scrollPos -= loop;
      if (p.scrollPos < loop * 0.5) p.scrollPos += loop;
    }
    el.scrollLeft = Math.round(p.scrollPos);
  };

  const onCarouselUp = (e) => {
    const p = physics.current;
    const el = carouselRef.current;
    if (!p.isDragging) return;

    if (p.dragActive) {
      if (e && e.timeStamp - p.lastMoveTime > 80) p.dragVelocity = 0;
      const momentum = Math.min(Math.max(-p.dragVelocity * 1.5, -35), 35);
      if (Math.abs(momentum) > 1.5) {
        p.carouselBoost = momentum;
      }
    }

    if (el && e && el.hasPointerCapture && el.hasPointerCapture(e.pointerId)) {
      try { el.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    p.isDragging = false;
    p.dragActive = false;
    p.dragVelocity = 0;
  };

  const onCubeDown = (e) => {
    const p = physics.current;
    p.cubeDragging = true;
    p.cubeMoved = 0;
    p.cubeLastX = e.clientX;
    p.cubeLastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onCubeMove = (e) => {
    const p = physics.current;
    if (!p.cubeDragging) return;
    const dx = e.clientX - p.cubeLastX;
    const dy = e.clientY - p.cubeLastY;
    p.cubeLastX = e.clientX;
    p.cubeLastY = e.clientY;
    p.cubeMoved += Math.abs(dx) + Math.abs(dy);
    p.rotY += dx * 0.5;
    p.rotX -= dy * 0.5;
    p.velRotY = dx * 0.15;
    p.velRotX = -dy * 0.15;
  };
  const onCubeUp = () => {
    const p = physics.current;
    p.cubeDragging = false;
    if (p.cubeMoved < 4) boostCarousel(14);
  };

  const centerProject = (proj, index) => {
    const p = physics.current;

    if (p.dragTotal > TAP_SLOP) {
      p.dragTotal = 0;
      return;
    }

    if (p.isPaused && p.lastSelectedId === proj.id) {
      p.lastSelectedId = null;
      setSelectedProject(null);
      boostCarousel(window.innerWidth < 768 ? 12 : 18);
      return;
    }

    const el = carouselRef.current;
    const cardNode = el && el.children[index];
    if (!el || !cardNode) return;

    p.targetScroll = cardNode.offsetLeft - el.clientWidth / 2 + cardNode.offsetWidth / 2;
    p.carouselBoost = 0;
    p.pauseUntil = 0;
    p.isPaused = true;
    p.holdUntil = performance.now() + HOLD_MS;
    p.lastStoppedIndex = index;
    p.lastSelectedId = proj.id;
    setSelectedProject(proj);
  };

  useEffect(() => {
    const panel = document.querySelector('.tron-panel-inner');
    if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div
      onWheel={handleWheel}
      className="tron overflow-hidden bg-[#02050a] text-slate-100 flex flex-col select-none"
      style={{
        '--s': appScale,
        transform: `scale(${appScale})`,
        transformOrigin: 'top left',
        width: `${100 / appScale}%`,
        height: `${100 / appScale}dvh`,
        position: 'absolute',
        top: 0,
        left: 0
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@300;400&display=swap');

        html, body { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; overscroll-behavior: none; }
        .tron { font-family: 'Inter', 'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; }
        .orb  { font-family: 'Inter', 'Roboto', system-ui, sans-serif; font-weight: 700; }
        .light-copy { font-family: 'Roboto', 'Inter', system-ui, sans-serif; font-weight: 300; }
        .tron button, .tron a, .tron [role="button"] { touch-action: manipulation; }

        .tron a:focus-visible, .tron button:focus-visible, .tron [role="button"]:focus-visible {
          outline: 2px solid ${ORANGE};
          outline-offset: 3px;
        }

        /* ---- Grid floor: perspective plane scrolling toward the viewer ---- */
        .grid-floor {
          position: absolute; left: -50%; right: -50%; bottom: 0; height: 62%;
          background-image:
            linear-gradient(to right, rgba(0,229,255,0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,229,255,0.35) 1px, transparent 1px);
          background-size: 64px 64px;
          transform: perspective(420px) rotateX(62deg);
          transform-origin: 50% 100%;
          -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 85%);
                  mask-image: linear-gradient(to top, #000 0%, transparent 85%);
          animation: grid-run 2.4s linear infinite;
          pointer-events: none;
        }
        @keyframes grid-run { from { background-position: 0 0; } to { background-position: 0 64px; } }
        .horizon {
          position: absolute; left: 0; right: 0; bottom: 38%; height: 1px;
          background: linear-gradient(90deg, transparent, ${CYAN}, transparent);
          box-shadow: 0 0 18px 2px rgba(0,229,255,0.55);
          opacity: .55; pointer-events: none;
        }

        /* ---- Chamfered neon panel (cut corners, glowing edge) ---- */
        .tron-panel {
          --c: 20px;
          position: relative; padding: 1px; max-height: 100%; display: flex; min-height: 0;
          background: linear-gradient(135deg, ${CYAN} 0%, rgba(0,229,255,0.18) 45%, ${CYAN} 100%);
          clip-path: polygon(0 0, calc(100% - var(--c)) 0, 100% var(--c), 100% 100%, var(--c) 100%, 0 calc(100% - var(--c)));
        }
        .tron-panel-inner {
          background: rgba(3, 12, 20, 0.94); width: 100%; min-height: 0; overflow-y: auto;
          overscroll-behavior: contain;
          clip-path: polygon(0 0, calc(100% - var(--c)) 0, 100% var(--c), 100% 100%, var(--c) 100%, 0 calc(100% - var(--c)));
        }
        .tron-panel-inner::-webkit-scrollbar { width: 6px; }
        .tron-panel-inner::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.4); }
        .tron-panel-inner::after {
          content: ''; display: block; position: sticky; bottom: 0; height: 22px; margin-top: -22px;
          background: linear-gradient(to bottom, rgba(3,12,20,0), rgba(3,12,20,0.96));
          pointer-events: none;
        }

        /* ---- Cube ---- */
        .cube-scene { perspective: 800px; touch-action: pan-y; cursor: grab; }
        .cube-scene:active { cursor: grabbing; }
        .cube-3d { width: 128px; height: 128px; position: relative; transform-style: preserve-3d; will-change: transform; }
        .cube-face {
          position: absolute; width: 128px; height: 128px;
          background: linear-gradient(135deg, rgba(0,40,56,0.92), rgba(1,12,20,0.95));
          border: 1.5px solid ${CYAN};
          box-shadow: 0 0 22px rgba(0,229,255,0.35) inset, 0 0 14px rgba(0,229,255,0.55);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          backface-visibility: hidden;
        }
        .face-front  { transform: translateZ(64px); }
        .face-back   { transform: rotateY(180deg) translateZ(64px); }
        .face-right  { transform: rotateY(90deg) translateZ(64px); }
        .face-left   { transform: rotateY(-90deg) translateZ(64px); }
        .face-top    { transform: rotateX(90deg) translateZ(64px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(64px); }
        .cube-shadow {
          width: 150px; height: 22px; margin-top: -6px; border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0,229,255,0.45), transparent 70%);
          filter: blur(4px);
        }

        /* Header tabs: full-width row on phones, compact on tablet / desktop */
        .hdr-nav { display: flex; align-items: stretch; width: 100%; }
        .hdr-tab { flex: 1 1 0%; min-height: 44px; }
        @media (min-width: 640px) {
          .hdr-nav { width: auto; }
          .hdr-tab { flex: none; min-height: 0; }
        }

        /* ---- Carousel ---- */
        .carousel-wrap { position: relative; height: 116px; }
        .carousel-track {
          position: absolute; left: 0; right: 0; bottom: 0; top: -48px; padding-top: 48px;
          align-items: flex-end; pointer-events: none;
        }
        .carousel-track > * { pointer-events: auto; }
        .carousel-card {
          --zoom: 1;
          transform: translateZ(0) scale(var(--zoom));
          transform-origin: 50% 100%;
          will-change: transform;
          backface-visibility: hidden;
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms ease, box-shadow 300ms ease;
        }
        .carousel-card.is-selected { --zoom: 1.22; z-index: 5; }
        .carousel-card:active { transform: translateZ(0) scale(calc(var(--zoom) * 0.97)); }
        .carousel-card-img { will-change: transform, opacity; backface-visibility: hidden; }
        .carousel-title, .carousel-bar-inner {
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1), height 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .carousel-title { width: calc(100% * var(--zoom)); transform: scale(calc(1 / var(--zoom))); transform-origin: 0 100%; }
        .carousel-bar { height: calc(30px / var(--zoom)); overflow: hidden; transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1); }
        .carousel-bar-inner { width: calc(100% * var(--zoom)); height: calc(100% * var(--zoom)); transform: scale(calc(1 / var(--zoom))); transform-origin: 0 0; }
        @media (min-width: 640px) {
          .carousel-wrap { height: 154px; }
          .carousel-track { top: -56px; padding-top: 56px; }
          .carousel-card.is-selected { --zoom: 1.24; }
          .carousel-bar { height: calc(28px / var(--zoom)); }
        }
        @media (prefers-reduced-motion: reduce) { .carousel-card, .carousel-title, .carousel-bar, .carousel-bar-inner { transition: none; } }

        .clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media (prefers-reduced-motion: reduce) { .grid-floor { animation: none; } }
      `}</style>

      {/* Background: soft glow, faint grid, grid floor, horizon */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,150,200,0.16),transparent_62%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      <div className="horizon" />
      <div className="grid-floor" />

      <Analytics />

      {/* ==================== 1. TOP BAR ==================== */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-0.5 px-4 sm:px-6 md:px-12 pt-2 sm:py-3 border-b border-cyan-400/25 bg-[#02050a]/85 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-3 w-3 rotate-45 bg-cyan-300 shadow-[0_0_14px_#00E5FF] shrink-0" />
          <span className="orb tracking-tight font-bold text-sm md:text-base text-white">
            Carlos Madrazo, <span className="text-cyan-300">M.Sc.</span>
          </span>
          <span className="hidden xl:inline-block text-sm text-slate-300 px-3 py-0.5 border border-cyan-400/25">
            Multi-Platform Developer
          </span>
        </div>

        <nav aria-label="Sections" className="hdr-nav" role="tablist">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={active}
                aria-controls="tabpanel-main"
                onClick={() => setActiveTab(tab.id)}
                className={`hdr-tab orb tracking-wider px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-[11px] md:text-xs uppercase transition-all border-b-2 ${
                  active
                    ? 'text-cyan-200 border-cyan-300 shadow-[0_8px_16px_-10px_#00E5FF]'
                    : 'text-slate-300 sm:text-slate-400 border-transparent hover:text-white hover:border-cyan-400/40'
                }`}
              >
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-4 text-sm">
          <a
            href="https://worldcampus.gamedu.tech/course/e7533e00-ce6f-11f1-923c-c93711ca83ed"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 text-orange-300 border border-orange-400/50 hover:bg-orange-400/10 transition"
          >
            GAMEDU.TECH ↗
          </a>
          <a href="https://linkedin.com/in/cmadrazo" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-cyan-300 transition">
            linkedin.com/in/cmadrazo
          </a>
          <a
            href="mailto:c.madrazo.pimienta@gmail.com"
            className="px-3.5 py-1.5 text-cyan-200 border border-cyan-300/60 hover:bg-cyan-300/10 transition"
          >
            c.madrazo.pimienta@gmail.com
          </a>
        </div>
      </header>

      {/* ==================== 2. CENTER: CUBE + CONSOLE ==================== */}
      <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center gap-10 xl:gap-16 px-3 sm:px-6 md:px-14 py-2 sm:py-3 max-w-7xl mx-auto w-full">
        {/* Cube (hidden on small screens to give the card the room) */}
        <div className="hidden lg:flex flex-col items-center shrink-0">
          <div
            className="cube-scene p-6"
            onPointerDown={onCubeDown}
            onPointerMove={onCubeMove}
            onPointerUp={onCubeUp}
            onPointerCancel={() => { physics.current.cubeDragging = false; }}
            aria-hidden="true"
          >
            <div ref={cubeRef} className="cube-3d">
              {CUBE_FACES.map((f) => (
                <div key={f.cls} className={`cube-face ${f.cls}`}>
                  <span className="orb tracking-wider text-[10px] text-orange-300/90">{f.label}</span>
                  <span className="orb text-xl font-extrabold tracking-tight text-white [text-shadow:0_0_12px_#00E5FF]">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cube-shadow" />
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 px-3 py-1 border border-cyan-400/25 rounded-full bg-[#02050a]/70">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Drag the cube · scroll to accelerate
          </div>
        </div>

        {/* Console card */}
        <div className="relative w-full max-w-2xl max-h-full flex">
          <div className="absolute -inset-1 bg-cyan-400/20 blur-2xl pointer-events-none" />
          <Panel className="w-full">
            <div id="tabpanel-main" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="p-5 pb-7 sm:p-6 md:p-7 select-text">
              {activeTab === 'overview' && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="orb tracking-wider text-xs uppercase text-cyan-300 font-bold">Multi-Platform Developer</span>
                    <a
                      href="https://worldcampus.gamedu.tech/course/e7533e00-ce6f-11f1-923c-c93711ca83ed"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-orange-300 border border-orange-400/50 hover:bg-orange-400/10 px-3 py-2 sm:px-2.5 sm:py-0.5 transition flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-400" />
                      GAMEDU Technical Instructor ↗
                    </a>
                  </div>

                  <h1 className="orb tracking-tight text-2xl md:text-4xl font-extrabold text-white leading-tight [text-shadow:0_0_22px_rgba(0,229,255,0.35)]">
                    Carlos Madrazo, <span className="text-cyan-300">M.Sc.</span>
                  </h1>
                  <h2 className="mt-1.5 text-lg md:text-xl font-bold text-slate-100">
                    Senior Software Engineer —{' '}
                    <span className="text-cyan-300">High-Performance Applications & Systems Architecture</span>
                  </h2>

                  <p className="light-copy mt-3 text-base md:text-[16.5px] text-slate-200 leading-relaxed">
                    14+ years architecting, modernizing, and profiling multi-million-line C++ codebases across Windows
                    (Steam, Epic, MS), PlayStation 5/4/Vita, XBOX Series X|S, Nintendo Switch 1 &amp; 2, and Mobile. Specialized
                    in CPU/GPU bottleneck mitigation, custom rendering pipelines, and zero-defect hardware compliance.
                  </p>

                  <div className="hidden sm:flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-cyan-400/20 text-sm">
                    <a
                      href="mailto:c.madrazo.pimienta@gmail.com"
                      className="px-4 py-1.5 bg-cyan-300 text-[#02050a] font-bold hover:bg-cyan-200 transition shadow-[0_0_20px_rgba(0,229,255,0.45)]"
                    >
                      ✉ c.madrazo.pimienta@gmail.com
                    </a>
                    <a
                      href="https://linkedin.com/in/cmadrazo"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 text-cyan-200 border border-cyan-300/50 hover:bg-cyan-300/10 transition"
                    >
                      in/cmadrazo ↗
                    </a>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-left">
                    {[
                      ['Core languages', 'C/C++ • HLSL • Python'],
                      ['Architecture', 'UE 4/5 • Custom • Qt'],
                      ['Global teams', 'ES / EN / JLPT N3']
                    ].map(([k, v]) => (
                      <div key={k} className="p-2.5 border-l-2 border-cyan-300/70 bg-cyan-300/[0.05]">
                        <dt className="orb tracking-wider text-[10px] uppercase text-cyan-300/80">{k}</dt>
                        <dd className="mt-0.5 text-sm md:text-base font-bold text-white">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div>
                  <div className="orb tracking-wider text-xs uppercase text-cyan-300 font-bold mb-2">
                    Systems architecture, teaching &amp; production
                  </div>
                  <h2 className="orb tracking-tight text-xl md:text-2xl font-bold text-white mb-4">
                    Bamtang Games • GAMEDU • Embassy of Mexico
                  </h2>
                  <ul className="light-copy space-y-3.5 text-base md:text-[16.5px] text-slate-200 leading-relaxed">
                    <li className="flex gap-4">
                      <span className="orb text-cyan-300 text-sm pt-1">01</span>
                      <span>
                        <strong className="text-white font-semibold">Lead C++ Software Engineer (Bamtang Games):</strong> Led
                        architecture, CPU/GPU profiling, and TRC/XR certification for 10+ global commercial releases
                        across PC and consoles, including dynamic slime rendering in <em>Nickelodeon Kart Racers 3</em>.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="orb text-orange-300 text-sm pt-1">02</span>
                      <span>
                        <strong className="text-white font-semibold">GAMEDU Technical Instructor (</strong>
                        <a href="https://worldcampus.gamedu.tech/course/e7533e00-ce6f-11f1-923c-c93711ca83ed" target="_blank" rel="noreferrer" className="text-orange-300 underline underline-offset-4 hover:text-orange-200">
                          gamedu.tech
                        </a>
                        <strong className="text-white font-semibold">):</strong> Mentoring engineers in the High-Performance C++
                        course on modern memory management, multithreading, profiling metrics, and low-level
                        optimization.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="orb text-cyan-300 text-sm pt-1">03</span>
                      <span>
                        <strong className="text-white font-semibold">Multi-Platform &amp; CI/CD Tooling:</strong> Architected the{' '}
                        <em>“Raíces en voz alta”</em> Android kiosk app for the Mexican Embassy in Washington D.C.,
                        Python automated Builder CI/CD pipelines, and Azure PlayFab telemetry.
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'academic' && (
                <div>
                  <div className="orb tracking-wider text-xs uppercase text-cyan-300 font-bold mb-2">
                    Research, education &amp; open source
                  </div>
                  <h2 className="orb tracking-tight text-xl md:text-2xl font-bold text-white mb-4">
                    Waseda University (Japan) &amp; Chromium ANGLE
                  </h2>
                  <div className="space-y-3.5 text-base md:text-[16.5px]">
                    <div className="p-3.5 border-l-2 border-cyan-300/70 bg-cyan-300/[0.05]">
                      <div className="font-bold text-white">
                        M.Sc. in Information, Production &amp; Systems Engineering — Waseda University
                      </div>
                      <div className="light-copy text-slate-200 mt-1 leading-relaxed">
                        Thesis on 3D Physically-Based Modeling, Level Set Method &amp; Fluid Simulation. Published in
                        ACM SIGGRAPH ASIA, Eurographics &amp; IEEE. B.Sc. in Computer Systems Engineering from
                        Tecnológico de Monterrey.
                      </div>
                    </div>
                    <div className="p-3.5 border-l-2 border-orange-400/80 bg-orange-400/[0.05]">
                      <div className="font-bold text-orange-300">Google ANGLE (Chromium Graphics Layer) &amp; OpenFL/HXCPP</div>
                      <div className="light-copy text-slate-200 mt-1 leading-relaxed">
                        Diagnosed x86 POPCNT hardware instruction crash on Intel Xeon processors (Issue #42263082) and
                        contributed C++ runtime optimizations to HXCPP, Haxe NME, OpenFL &amp; Cocos2d.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </main>

      {/* ==================== 3. DOCK: PROJECT CAROUSEL ==================== */}
      <section
        aria-label="Shipped projects"
        className="relative z-20 bg-[#030811]/95 border-t border-cyan-400/30 pt-2 pb-1.5 sm:py-2.5 shrink-0 shadow-[0_-12px_32px_-14px_rgba(0,229,255,0.35)]"
      >
        <div className="carousel-wrap">
          <div
            ref={carouselRef}
            onPointerDown={onCarouselDown}
            onPointerMove={onCarouselMove}
            onPointerUp={onCarouselUp}
            onPointerCancel={onCarouselUp}
            onPointerLeave={onCarouselUp}
            className="carousel-track flex overflow-hidden no-scrollbar gap-3 sm:gap-4 px-4 sm:px-6 touch-pan-y"
          >
            {INFINITE_PROJECTS.map((proj, index) => {
              const isCopy = index >= PROJECTS.length;
              const isSelected = selectedProject && selectedProject.id === proj.id;
              return (
                <div
                  key={`${proj.id}-${index}`}
                  role="button"
                  tabIndex={isCopy ? -1 : 0}
                  aria-hidden={isCopy ? 'true' : undefined}
                  aria-pressed={isSelected ? 'true' : 'false'}
                  onClick={() => centerProject(proj, index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      physics.current.dragTotal = 0;
                      centerProject(proj, index);
                    }
                  }}
                  className={`carousel-card ${isSelected ? 'is-selected' : ''} group relative flex flex-col w-[268px] sm:w-[350px] h-[116px] sm:h-[154px] overflow-hidden bg-[#050d18] border shrink-0 cursor-grab active:cursor-grabbing ${
                    isSelected
                      ? 'border-orange-400 shadow-[0_0_22px_rgba(255,154,31,0.4)]'
                      : 'border-cyan-400/30 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.35)]'
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))'
                  }}
                >
                  {/* Image and main info area */}
                  <div className="relative flex-1 w-full overflow-hidden">
                    <img
                      src={proj.img}
                      alt=""
                      draggable="false"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className={`carousel-card-img absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                        isSelected ? 'scale-100 !opacity-100' : 'scale-110 group-hover:scale-105 group-hover:!opacity-100'
                      }`}
                      style={{ opacity: 0.35 }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-[#02050a] via-[#02050a]/70 to-transparent pointer-events-none transition-opacity duration-300 ${isSelected ? 'opacity-30' : 'opacity-100'}`} />

                    <div className="absolute inset-0 px-3 pt-3 pb-1.5 sm:px-3.5 sm:pt-3 sm:pb-1.5 flex flex-col justify-end pointer-events-none">
                      <div className="carousel-title flex flex-col min-w-0 pr-3">
                        <h3 className={`text-sm sm:text-[15px] font-bold leading-tight clamp-2 [text-shadow:0_1px_6px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,0.8)] transition-colors ${
                          isSelected ? 'text-orange-200' : 'text-white group-hover:text-cyan-200'
                        }`}>
                          {proj.title}
                        </h3>
                        <p className="text-[9px] sm:text-xs text-slate-200 truncate mt-0.5 [text-shadow:0_1px_5px_rgba(0,0,0,0.95)]">{proj.tech}</p>
                      </div>
                    </div>
                  </div>

                  {/* Black bar at the bottom for platforms and year */}
                  <div className="carousel-bar bg-black w-full shrink-0 z-10 border-t border-cyan-400/10">
                    <div className="carousel-bar-inner flex items-center justify-between px-3 sm:px-3.5">
                      <div className="flex items-center gap-1">
                        <span className="sm:hidden flex flex-nowrap gap-1">
                          {proj.platforms_short.split(' • ').map((plat, idx) => (
                            <span key={idx} className={`px-1.5 py-[3px] text-[10px] font-mono border rounded-[2px] leading-none whitespace-nowrap ${
                              isSelected ? 'text-orange-200 border-orange-400/40 bg-orange-400/10' : 'text-cyan-200 border-cyan-400/30 bg-cyan-400/10'
                            }`}>
                              {plat}
                            </span>
                          ))}
                        </span>
                        <span className="hidden sm:flex flex-nowrap gap-1">
                          {proj.platforms.split(' • ').map((plat, idx) => (
                            <span key={idx} className={`px-1.5 py-[3px] text-[9.5px] font-mono border rounded-[2px] leading-none whitespace-nowrap ${
                              isSelected ? 'text-orange-200 border-orange-400/40 bg-orange-400/10' : 'text-cyan-200 border-cyan-400/30 bg-cyan-400/10'
                            }`}>
                              {plat}
                            </span>
                          ))}
                        </span>
                      </div>
                      <span className={`orb shrink-0 px-1.5 py-0.5 text-[10px] sm:text-[10.5px] font-bold border rounded-sm ${
                        isSelected ? 'text-orange-200 border-orange-400/70 bg-orange-400/15' : 'text-cyan-200 border-cyan-300/50 bg-cyan-300/10'
                      }`}>
                        {proj.year}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tablet / desktop header row */}
        <div className="hidden sm:flex px-6 md:px-12 mt-2 flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 shrink">
            <span className="inline-block w-2 h-2 bg-cyan-300 shadow-[0_0_10px_#00E5FF] shrink-0" />
            <h2 className="orb tracking-wider text-xs font-bold uppercase text-slate-100 whitespace-nowrap">Shipped &amp; in production</h2>
            {selectedProject && (
              <span className="inline-block text-sm text-orange-200 bg-orange-400/10 border border-orange-400/50 px-2.5 py-0.5 sm:max-w-[60ch] md:max-w-[85ch] lg:max-w-none truncate">
                {selectedProject.title} · {selectedProject.tech}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-xs text-slate-400 mr-2">Click a card to hold it · drag or scroll to spin</span>
            <button
              onClick={() => boostCarousel(-22)}
              className="orb tracking-wider px-3 py-1 text-[11px] text-slate-200 border border-cyan-400/40 hover:bg-cyan-300/10 hover:text-cyan-200 transition whitespace-nowrap"
              aria-label="Accelerate carousel backward"
            >
              ‹‹ REV
            </button>
            <button
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={`orb tracking-wider px-3 py-1 text-[11px] font-bold transition whitespace-nowrap border ${
                isAutoMode 
                  ? 'bg-orange-400/20 text-orange-200 border-orange-400/70 shadow-[0_0_10px_rgba(255,154,31,0.4)]' 
                  : 'text-slate-200 border-cyan-400/40 hover:bg-cyan-300/10 hover:text-cyan-200'
              }`}
              aria-label="Toggle Auto-Focus Mode"
            >
              AUTO
            </button>
            <button
              onClick={() => boostCarousel(22)}
              className="orb tracking-wider px-3 py-1 text-[11px] text-slate-200 border border-cyan-400/40 hover:bg-cyan-300/10 hover:text-cyan-200 transition whitespace-nowrap"
              aria-label="Accelerate carousel forward"
            >
              FWD ››
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 4. FOOTER / LEGAL ==================== */}
      <footer className="relative z-20 bg-[#030811] py-1 sm:py-1.5 text-center border-t border-cyan-400/10 shrink-0">
        <p className="text-[7px] sm:text-[9.5px] text-slate-400/75 max-w-6xl mx-auto px-2 sm:px-6 leading-none tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="sm:hidden">
            All game titles, trademarks &amp; artwork belong to their respective owners.
          </span>
          <span className="hidden sm:inline">
            All game titles, trade names, trademarks, artwork, and associated imagery are copyright material of their respective owners. All rights reserved.
          </span>
        </p>
      </footer>

    </div>
  );
}

export default App;