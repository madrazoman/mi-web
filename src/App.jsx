import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

const PROJECTS = [
  {
    id: 'warriorcats',
    title: "Warrior Cats: Clans of the Forest",
    year: "2026",
    platforms: "PlayStation 5 • Switch 2 • XBOX Series X|S • PC",
    platforms_short: "PS5 • Switch 2 • XBOX • PC",
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

const CUBE_FACES = [
  { cls: 'face-front', label: 'CORE', value: 'C++23' },
  { cls: 'face-back', label: 'ENGINE', value: 'UE 4/5' },
  { cls: 'face-right', label: 'SHADERS', value: 'HLSL' },
  { cls: 'face-left', label: 'GRAPHICS', value: 'DirectX' },
  { cls: 'face-top', label: 'CHROMIUM', value: 'ANGLE' },
  { cls: 'face-bottom', label: 'CONSOLE', value: 'GNMX' }
];

const TABS = [
  { id: 'overview', label: 'Profile' },
  { id: 'architecture', label: 'Architecture & R&D' },
  { id: 'academic', label: 'Waseda & Open Source' }
];

// Neon palette: Tron cyan as the main light, Legacy orange as the single counter-accent.
const CYAN = '#00E5FF';
const ORANGE = '#FF9A1F';

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

  const cubeRef = useRef(null);
  const carouselRef = useRef(null);

  const physics = useRef({
    rotX: -22,
    rotY: 35,
    velRotX: 0,
    velRotY: 0,
    scrollPos: 0,
    baseCarouselSpeed: 0.65,
    carouselBoost: 0,
    isDragging: false,
    startX: 0,
    isPaused: false,
    cubeDragging: false,
    cubeMoved: 0,
    cubeLastX: 0,
    cubeLastY: 0,
    reduceMotion: false,
    dragVelocity: 0
  });

  useEffect(() => {
    let timeoutId = null;

    const updateScale = () => {
      // window.innerWidth lee el tamaño actual de la ventana del navegador, NO la resolución del monitor
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 768 && h > w) {
        // Reducimos la escala en móviles para que se vea más contenido (aprox 75% - 95%)
        setAppScale(Math.min(Math.max(w / 450, 0.75), 0.95)); 
      } else if (w < 400) {
        setAppScale(Math.min(Math.max(w / 1200, 0.3), 1.5));
      } else if (w < 1000) {
        setAppScale(Math.min(Math.max(w / 1400, 0.4), 1.5));
      } else if (w < 1620) {
        setAppScale(Math.min(Math.max(w / 1600, 0.55), 1.5));
      } else {
        setAppScale(Math.min(Math.max(w / 1800, 0.8), 1.5));
      }
    };
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScale, 100); // Optimizamos para que el cálculo ocurra solo al terminar de arrastrar la ventana
    };

    updateScale(); // Se ejecuta solo al inicio
    window.addEventListener('resize', handleResize); // Se ejecuta al redimensionar la ventana
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
      // 3D cube: idle spin + momentum from wheel / drag
      if (!p.cubeDragging) {
        p.rotY += (p.reduceMotion ? 0 : 0.22) + p.velRotY;
        p.rotX += (p.reduceMotion ? 0 : 0.06) + p.velRotX;
        p.velRotY *= 0.94;
        p.velRotX *= 0.94;
      }
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateX(${p.rotX}deg) rotateY(${p.rotY}deg)`;
      }

      // Infinite carousel: loop length is the exact distance between copy 1 and copy 2
      const el = carouselRef.current;
      if (el && !p.isDragging && el.children.length > PROJECTS.length) {
        // const speed = p.reduceMotion ? 0 : (p.isPaused ? 0.15 : p.baseCarouselSpeed);
        // Force motion even on Save Energy Mode
        const speed = p.isPaused ? 0.0 : p.baseCarouselSpeed;
        p.scrollPos += speed + p.carouselBoost;
        p.carouselBoost *= 0.95;

        const loop = el.children[PROJECTS.length].offsetLeft - el.children[0].offsetLeft;
        if (loop > 0) {
          if (p.scrollPos >= loop) p.scrollPos -= loop;
          if (p.scrollPos < 0) p.scrollPos += loop;
          el.scrollLeft = p.scrollPos;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ---------- input handlers ---------- */
  const handleWheel = (e) => {
    const p = physics.current;
    p.velRotY += e.deltaY * 0.018;
    p.velRotX += e.deltaY * 0.008;
    p.carouselBoost += e.deltaY * 0.06;
  };

  const boostCarousel = (amount) => {
    physics.current.carouselBoost += amount;
    physics.current.velRotY += amount * 0.10;
  };

  // Carousel: mouse drag
  const handleMouseDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    physics.current.isDragging = true;
    physics.current.startX = e.pageX - el.offsetLeft;
  };
  const handleMouseMove = (e) => {
    const p = physics.current;
    const el = carouselRef.current;
    if (!p.isDragging || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const dx = x - p.startX;
    p.dragVelocity = dx; // Capturamos la velocidad/dirección del arrastre
    p.scrollPos -= dx * 1.8;
    p.startX = x;
    el.scrollLeft = p.scrollPos;
  };
  const handleMouseUpOrLeave = () => {
    const p = physics.current;
    if (p.isDragging) {
      // Al soltar el click, inyectamos la inercia (momentum) al carrusel
      // Si dx es negativo (arrastre a la izquierda), queremos avanzar (boost positivo)
      // Limitamos el boost máximo para que no salga volando si se arrastra muy rápido
      const momentum = Math.min(Math.max(-p.dragVelocity * 1.5, -40), 40);
      if (Math.abs(momentum) > 2) {
        p.carouselBoost += momentum;
      }
    }
    p.isDragging = false;
    p.isPaused = false;
    p.dragVelocity = 0;
  };

  // Carousel: native touch scrolling, then resume auto-scroll from where the finger left it
    const handleTouchStart = (e) => { 
    const el = carouselRef.current;
    if (!el) return;
    physics.current.isDragging = true; 
    physics.current.dragTotal = 0;
    physics.current.startX = e.touches[0].pageX - el.offsetLeft;
  };

  const handleTouchMove = (e) => {
    const p = physics.current;
    const el = carouselRef.current;
    if (!p.isDragging || !el) return;
    
    const x = e.touches[0].pageX - el.offsetLeft;
    const dx = x - p.startX;
    p.dragTotal += Math.abs(dx);
    p.dragVelocity = dx; 
    
    // Reverse logic: Si dx es negativo (arrastre a la izquierda), scrollPos aumenta.
    // Usamos el mismo multiplicador que en el mouse para que sea consistente
    p.scrollPos -= dx * 1.8; 
    p.startX = x;
    el.scrollLeft = p.scrollPos;
  };

  const handleTouchEnd = () => {
    const p = physics.current;
    if (p.isDragging) {
      // Si arrastró hacia la izquierda (dx negativo), queremos un boost positivo (hacia la derecha/adelante)
      // Limitamos el impulso entre -40 y 40 para que no sea incontrolable
      const momentum = Math.min(Math.max(-p.dragVelocity * 1.5, -40), 40);
      if (Math.abs(momentum) > 2) {
        boostCarousel(momentum);
      }
    }
    p.isDragging = false;
    p.isPaused = false;
    p.dragVelocity = 0;
  };
  // Cube: drag to spin, click (without dragging) to accelerate
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
    if (p.cubeMoved < 4) boostCarousel(6);
  };

  const selectProject = (proj) => {
    physics.current.isPaused = true; // <-- Pausa el carrusel al hacer clic
    setSelectedProject((cur) => (cur && cur.id === proj.id ? null : proj));
  };

  const centerProject = (proj, index) => {
    const el = carouselRef.current;
    if (!el) return;
    
    // Obtener el elemento DOM correspondiente al índice exacto
    const cardNode = el.children[index];
    if (!cardNode) return;

    // Calcular la distancia necesaria para llevar el elemento al centro del contenedor
    const containerWidth = el.clientWidth;
    const cardLeft = cardNode.offsetLeft;
    const cardWidth = cardNode.offsetWidth;
    
    const targetScrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);

    // Actualizar la posición de física y hacer el scroll suave
    physics.current.scrollPos = targetScrollLeft;
    physics.current.carouselBoost = 0; // Detener cualquier impulso previo
    physics.current.isPaused = true;  // Pausar el movimiento automático

    el.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });

    setSelectedProject((cur) => (cur && cur.id === proj.id ? null : proj));
  };

  useEffect(() => {
    // Al cambiar de pestaña, hacer scroll al inicio del panel de texto
    const panel = document.querySelector('.tron-panel-inner');
    if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const infiniteProjects = [...PROJECTS, ...PROJECTS];

  return (
    <div
      onWheel={handleWheel}
      className="tron overflow-hidden bg-[#02050a] text-slate-100 flex flex-col select-none"
      style={{ 
        transform: `scale(${appScale})`,
        transformOrigin: 'top left',
        width: `${100 / appScale}%`,
        height: `${100 / appScale}%`,
        position: 'absolute',
        top: 0,
        left: 0
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@300;400&display=swap');

        .tron { font-family: 'Inter', 'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; }
        .orb  { font-family: 'Inter', 'Roboto', system-ui, sans-serif; font-weight: 700; }
        .light-copy { font-family: 'Roboto', 'Inter', system-ui, sans-serif; font-weight: 300; }

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
          clip-path: polygon(0 0, calc(100% - var(--c)) 0, 100% var(--c), 100% 100%, var(--c) 100%, 0 calc(100% - var(--c)));
        }
        .tron-panel-inner::-webkit-scrollbar { width: 6px; }
        .tron-panel-inner::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.4); }

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
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 md:px-12 py-3 border-b border-cyan-400/25 bg-[#02050a]/85 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rotate-45 bg-cyan-300 shadow-[0_0_14px_#00E5FF]" />
          <span className="orb tracking-tight font-bold text-sm md:text-base text-white">
            Carlos Madrazo, <span className="text-cyan-300">M.Sc.</span>
          </span>
          <span className="hidden xl:inline-block text-sm text-slate-300 px-3 py-0.5 border border-cyan-400/25">
            Multi-Platform Developer
          </span>
        </div>

        <nav aria-label="Sections" className="flex items-center" role="tablist">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`orb tracking-wider px-3 md:px-4 py-2 text-[11px] md:text-xs uppercase transition-all border-b-2 ${
                  active
                    ? 'text-cyan-200 border-cyan-300 shadow-[0_8px_16px_-10px_#00E5FF]'
                    : 'text-slate-400 border-transparent hover:text-white hover:border-cyan-400/40'
                }`}
              >
                {tab.label}
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
      <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center gap-10 xl:gap-16 px-6 md:px-14 py-4 max-w-7xl mx-auto w-full">
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
            <div className="p-6 md:p-8" role="tabpanel">
              {activeTab === 'overview' && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="orb tracking-wider text-xs uppercase text-cyan-300 font-bold">Multi-Platform Developer</span>
                    <a
                      href="https://worldcampus.gamedu.tech/course/e7533e00-ce6f-11f1-923c-c93711ca83ed"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-orange-300 border border-orange-400/50 hover:bg-orange-400/10 px-2.5 py-0.5 transition flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-400" />
                      GAMEDU Technical Instructor ↗
                    </a>
                  </div>

                  <h1 className="orb tracking-tight text-2xl md:text-4xl font-extrabold text-white leading-tight [text-shadow:0_0_22px_rgba(0,229,255,0.35)]">
                    Carlos Madrazo, <span className="text-cyan-300">M.Sc.</span>
                  </h1>
                  <h2 className="mt-2 text-lg md:text-xl font-bold text-slate-100">
                    Senior Software Engineer —{' '}
                    <span className="text-cyan-300">High-Performance Applications & Systems Architecture</span>
                  </h2>

                  <p className="light-copy mt-4 text-base md:text-[17px] text-slate-200 leading-relaxed">
                    14+ years architecting, modernizing, and profiling multi-million-line C++ codebases across Windows
                   (Steam, Epic, MS), PlayStation 5/4/Vita, XBOX Series X|S, Nintendo Switch 1 &amp; 2, and Mobile. Specialized
                    in CPU/GPU bottleneck mitigation, custom rendering pipelines, and zero-defect hardware compliance.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-cyan-400/20 text-sm">
                    <a
                      href="mailto:c.madrazo.pimienta@gmail.com"
                      className="px-4 py-2 bg-cyan-300 text-[#02050a] font-bold hover:bg-cyan-200 transition shadow-[0_0_20px_rgba(0,229,255,0.45)]"
                    >
                      ✉ c.madrazo.pimienta@gmail.com
                    </a>
                    <a
                      href="https://linkedin.com/in/cmadrazo"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 text-cyan-200 border border-cyan-300/50 hover:bg-cyan-300/10 transition"
                    >
                      in/cmadrazo ↗
                    </a>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-left">
                    {[
                      ['Core languages', 'C/C++ • HLSL • Python'],
                      ['Architecture', 'UE 4/5 • Custom • Qt'],
                      ['Global teams', 'ES / EN / JLPT N3']
                    ].map(([k, v]) => (
                      <div key={k} className="p-3 border-l-2 border-cyan-300/70 bg-cyan-300/[0.05]">
                        <dt className="orb tracking-wider text-[10px] uppercase text-cyan-300/80">{k}</dt>
                        <dd className="mt-1 text-base font-bold text-white">{v}</dd>
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
                  <h2 className="orb tracking-tight text-xl md:text-2xl font-bold text-white mb-5">
                    Bamtang Games • GAMEDU • Embassy of Mexico
                  </h2>
                  <ul className="light-copy space-y-4 text-base md:text-[17px] text-slate-200 leading-relaxed">
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
                  <h2 className="orb tracking-tight text-xl md:text-2xl font-bold text-white mb-5">
                    Waseda University (Japan) &amp; Chromium ANGLE
                  </h2>
                  <div className="space-y-4 text-base md:text-[17px]">
                    <div className="p-4 border-l-2 border-cyan-300/70 bg-cyan-300/[0.05]">
                      <div className="font-bold text-white">
                        M.Sc. in Information, Production &amp; Systems Engineering — Waseda University
                      </div>
                      <div className="light-copy text-slate-200 mt-1 leading-relaxed">
                        Thesis on 3D Physically-Based Modeling, Level Set Method &amp; Fluid Simulation. Published in
                        ACM SIGGRAPH ASIA, Eurographics &amp; IEEE. B.Sc. in Computer Systems Engineering from
                        Tecnológico de Monterrey.
                      </div>
                    </div>
                    <div className="p-4 border-l-2 border-orange-400/80 bg-orange-400/[0.05]">
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
      <section className="relative z-20 bg-[#030811]/95 border-t border-cyan-400/30 py-4 shrink-0 shadow-[0_-12px_32px_-14px_rgba(0,229,255,0.35)]">
        <div className="px-6 md:px-12 mb-3 flex flex-nowrap sm:flex-wrap items-center justify-between gap-2">
          <div className="flex flex-nowrap items-center gap-2 sm:gap-3 min-w-0 shrink-0 sm:shrink">
            <span className="hidden sm:inline-block w-2 h-2 bg-cyan-300 shadow-[0_0_10px_#00E5FF] shrink-0" />
            <h2 className="orb tracking-wider text-[9px] sm:text-xs font-bold uppercase text-slate-100 whitespace-nowrap">Shipped &amp; in production</h2>
            {selectedProject && (
              <span className="hidden sm:inline-block text-sm text-orange-200 bg-orange-400/10 border border-orange-400/50 px-2.5 py-0.5 sm:max-w-[60ch] md:max-w-[85ch] lg:max-w-none">
                {selectedProject.title} · {selectedProject.tech}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="hidden md:inline text-xs text-slate-400 mr-2">Wheel / drag / click to accelerate</span>
            <button
              onClick={() => boostCarousel(-25)}
              className="orb tracking-wider px-2 sm:px-3 py-1 text-[9px] sm:text-[11px] text-slate-200 border border-cyan-400/40 hover:bg-cyan-300/10 hover:text-cyan-200 transition whitespace-nowrap"
              aria-label="Accelerate carousel backward"
            >
              <span className="sm:hidden">REV</span>
              <span className="hidden sm:inline">‹‹ REV</span>
            </button>
            <button
              onClick={() => boostCarousel(25)}
              className="orb tracking-wider px-2 sm:px-3 py-1 text-[9px] sm:text-[11px] text-slate-200 border border-cyan-400/40 hover:bg-cyan-300/10 hover:text-cyan-200 transition whitespace-nowrap"
              aria-label="Accelerate carousel forward"
            >
              <span className="sm:hidden">FWD</span>
              <span className="hidden sm:inline">FWD ››</span>
            </button>
          </div>
        </div>
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          // Usar onPointerEnter para detectar si es realmente un mouse
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') physics.current.isPaused = true; }}
          onPointerLeave={() => { physics.current.isPaused = false; }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative flex overflow-hidden no-scrollbar gap-4 px-6 cursor-grab active:cursor-grabbing"
        >
          {infiniteProjects.map((proj, index) => {
            const isCopy = index >= PROJECTS.length;
            const isSelected = selectedProject && selectedProject.id === proj.id;
            return (
              <div
                key={`${proj.id}-${index}`}
                role="button"
                tabIndex={isCopy ? -1 : 0}
                aria-hidden={isCopy ? 'true' : undefined}
                aria-pressed={isSelected ? 'true' : 'false'}
                onClick={() => centerProject(proj, index)} // <-- AQUÍ USAMOS LA NUEVA FUNCIÓN
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); centerProject(proj, index); }
                }}
                onFocus={() => { physics.current.isPaused = true; }}
                onBlur={() => { physics.current.isPaused = false; }}
                className={`group relative flex flex-col w-[240px] sm:w-[380px] h-[110px] sm:h-[180px] overflow-hidden bg-[#050d18] border transition-all duration-300 shrink-0 ${
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
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02050a] via-[#02050a]/65 to-transparent" />

                  <div className="absolute inset-0 px-2.5 pt-2.5 pb-1 sm:px-3.5 sm:pt-3.5 sm:pb-2 flex flex-col justify-between pointer-events-none">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`orb px-2 py-0.5 text-[8px] sm:text-[11px] font-bold border ${
                        isSelected ? 'text-orange-200 border-orange-400/70 bg-orange-400/15' : 'text-cyan-200 border-cyan-300/50 bg-cyan-300/10'
                      }`}>
                        {proj.year}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 sm:gap-1.5">
                      <div>
                        <h3 className={`text-[11px] sm:text-base font-bold leading-tight transition-colors ${
                          isSelected ? 'text-orange-200' : 'text-white group-hover:text-cyan-200'
                        }`}>
                          {proj.title}
                        </h3>
                        <p className="text-[9px] sm:text-xs text-slate-300 truncate mt-0.5">{proj.tech}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Black space at the bottom for platforms */}
                <div className="h-[22px] sm:h-[26px] bg-black w-full flex items-center justify-start px-3 sm:px-3.5 shrink-0 z-10 border-t border-cyan-400/10">
                  <span className="sm:hidden flex flex-nowrap gap-1">
                    {proj.platforms_short.split(" • ").map((plat, idx) => (
                      <span key={idx} className={`px-1 py-[3px] text-[6px] font-mono border rounded-[2px] leading-none whitespace-nowrap ${
                        isSelected ? 'text-orange-200 border-orange-400/40 bg-orange-400/10' : 'text-cyan-200 border-cyan-400/30 bg-cyan-400/10'
                      }`}>
                        {plat}
                      </span>
                    ))}
                  </span>
                  <span className="hidden sm:flex flex-nowrap gap-1">
                    {proj.platforms.split(" • ").map((plat, idx) => (
                      <span key={idx} className={`px-1.5 py-[3px] text-[7px] sm:text-[8px] font-mono border rounded-[2px] leading-none whitespace-nowrap ${
                        isSelected ? 'text-orange-200 border-orange-400/40 bg-orange-400/10' : 'text-cyan-200 border-cyan-400/30 bg-cyan-400/10'
                      }`}>
                        {plat}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 4. FOOTER / LEGAL ==================== */}
      <footer className="relative z-20 bg-[#030811] py-3 text-center border-t border-cyan-400/10 shrink-0">
        <p className="text-[9px] sm:text-[10px] text-slate-500/60 max-w-5xl mx-auto px-6 leading-relaxed tracking-wide">
          All contents, game titles, trade names and/or trade dress, trademarks, artwork, and associated imagery are trademarks and/or copyright material of their respective owners. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default App;