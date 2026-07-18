import React, { useEffect, useRef } from "react";

// AnimatedPortfolio.jsx
// Single-file React component that includes styles and JS interactions
// - Drop this file into your React app (Create React App / Vite / Next.js)
// - It injects the CSS it needs, then mounts the interaction logic
// - Respects prefers-reduced-motion

export default function AnimatedPortfolio() {
  const rootRef = useRef(null);
  const profileCardRef = useRef(null);
  const latestRef = useRef(null);

  // Inject lightweight CSS once
  useEffect(() => {
    const css = `
:root{--bg-1:#071129;--bg-2:#041021;--text:#e9f0fb;--muted:#9fb0c6;--muted-2:#b8c6d8;--accent-1:#53c7ff;--accent-2:#7b84ff}
*{box-sizing:border-box}
body{margin:0;font-family:Poppins,system-ui,Arial;background:linear-gradient(180deg,var(--bg-1),var(--bg-2));color:var(--text)}
.wrap{max-width:1100px;margin:0 auto;padding:24px}
.topbar{position:sticky;top:0;backdrop-filter:blur(6px);z-index:40}
.brand{font-weight:700;font-size:20px}
.main-nav{display:flex;gap:16px}
.btn.primary{background:linear-gradient(90deg,var(--accent-1),var(--accent-2));color:#042032;padding:10px 14px;border-radius:10px;font-weight:700}
.hero{padding:22px 0}
.hero-grid{display:grid;grid-template-columns:1fr 360px;gap:28px;align-items:center}
.hero-card{background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));padding:18px;border-radius:14px;display:flex;gap:14px;align-items:center;box-shadow:0 12px 40px rgba(2,6,23,0.6);border:1px solid rgba(255,255,255,0.03)}
.profile-photo{width:96px;height:96px;border-radius:10px;object-fit:cover;border:2px solid rgba(255,255,255,0.04)}
.project{background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.03);transition:box-shadow .22s,transform .22s;will-change:transform}
.project:hover{box-shadow:0 18px 50px rgba(2,6,23,0.6)}
.latest-attract{display:inline-block;position:relative}
.latest-orbit{position:absolute;width:9px;height:9px;border-radius:50%;background:linear-gradient(90deg,#60a5fa 0%,#a78bfa 100%);pointer-events:none;transform:translate(-50%,-50%) scale(.9);will-change:transform,opacity;opacity:0;transition:opacity .18s ease, transform .18s ease;filter:drop-shadow(0 6px 12px rgba(99,102,241,0.09));z-index:9999}
@media (max-width:920px){.hero-grid{grid-template-columns:1fr;text-align:center}.hero-card{margin:0 auto}.main-nav{display:none}}
.sr-only{position:absolute;left:-9999px}
`;
    const style = document.createElement("style");
    style.setAttribute("data-animated-portfolio","true");
    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  // Interaction logic: tilt, profile parallax, latest attract
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const root = rootRef.current;
    if (!root) return;

    // --- TILT for .project elements (RAF-smoothed) ---
    const projects = Array.from(root.querySelectorAll(".project"));
    const tiltState = new Map();

    projects.forEach((el) => {
      let raf = null;
      let targetRX = 0, targetRY = 0;
      let currentRX = 0, currentRY = 0;

      function step() {
        currentRX += (targetRX - currentRX) * 0.18;
        currentRY += (targetRY - currentRY) * 0.18;
        el.style.transform = `perspective(900px) rotateX(${currentRX.toFixed(2)}deg) rotateY(${currentRY.toFixed(2)}deg) translateZ(0)`;
        if (Math.abs(targetRX - currentRX) < 0.01 && Math.abs(targetRY - currentRY) < 0.01) {
          cancelAnimationFrame(raf);
          raf = null;
          return;
        }
        raf = requestAnimationFrame(step);
      }

      const onMove = (ev) => {
        const e = ev.touches ? ev.touches[0] : ev;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        targetRY = (px - 0.5) * 8;
        targetRX = (0.5 - py) * 6;
        if (!raf) raf = requestAnimationFrame(step);
      };

      const onLeave = () => {
        targetRX = targetRY = 0;
        if (!raf) raf = requestAnimationFrame(step);
      };

      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("touchmove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("touchend", onLeave);

      tiltState.set(el, { onMove, onLeave });
    });

    // --- profile card parallax ---
    const profile = profileCardRef.current;
    let raf2 = null;
    let tx = 0, ty = 0, targetX = 0, targetY = 0;

    function step2() {
      tx += (targetX - tx) * 0.14;
      ty += (targetY - ty) * 0.14;
      if (profile) {
        profile.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        profile.classList.toggle("glow", Math.hypot(tx, ty) > 1.2);
      }
      if (Math.abs(targetX - tx) < 0.05 && Math.abs(targetY - ty) < 0.05) {
        cancelAnimationFrame(raf2);
        raf2 = null;
        return;
      }
      raf2 = requestAnimationFrame(step2);
    }

    function onHeroMove(e) {
      const ev = e.touches ? e.touches[0] : e;
      if (!profile) return;
      const rect = profile.getBoundingClientRect();
      const dx = (ev.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (ev.clientY - (rect.top + rect.height / 2)) / rect.height;
      targetX = dx * 9;
      targetY = dy * 9;
      if (!raf2) raf2 = requestAnimationFrame(step2);
    }

    // Attach to hero region (root) — it's fine because events bubble
    root.addEventListener("pointermove", onHeroMove, { passive: true });
    root.addEventListener("mousemove", onHeroMove, { passive: true });
    root.addEventListener("touchmove", onHeroMove, { passive: true });

    function onHeroLeave() {
      targetX = targetY = 0;
      if (!raf2) raf2 = requestAnimationFrame(step2);
    }
    root.addEventListener("mouseleave", onHeroLeave);
    root.addEventListener("touchend", onHeroLeave);

    // --- latest attract ---
    const latest = latestRef.current || root.querySelector('.latest-badge') || root.querySelector('.hero-intro h1');
    let orbit = null;
    let visible = true;
    let mx = -9999, my = -9999;
    let rectCache = latest ? latest.getBoundingClientRect() : null;

    if (latest) {
      // create orbit element
      orbit = document.createElement('div');
      orbit.className = 'latest-orbit';
      document.body.appendChild(orbit);
      latest.classList.add('latest-attract');

      const onMove = (e) => { const ev = e.touches ? e.touches[0] : e; mx = ev.clientX; my = ev.clientY; };
      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('mousemove', onMove, { passive: true });

      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          visible = en.isIntersecting;
          rectCache = en.target.getBoundingClientRect();
          latest.classList.toggle('pulse', visible);
          if (!visible) orbit.style.opacity = '0';
        });
      }, { threshold: 0.18 });

      io.observe(latest);

      let txl = 0, tyl = 0;
      const MAX_DIST = 160;
      const PULL = 0.22;
      const MAX_TRANSLATE = 12;

      function loop() {
        if (!rectCache || !document.body.contains(latest)) rectCache = latest.getBoundingClientRect();
        const cx = rectCache.left + rectCache.width / 2;
        const cy = rectCache.top + rectCache.height / 2;
        const dx = mx - cx; const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        const within = visible && dist < MAX_DIST;
        if (within) {
          const force = 1 - (dist / MAX_DIST);
          const pullX = dx * PULL * force;
          const pullY = dy * PULL * force;
          txl += (pullX - txl) * 0.18;
          tyl += (pullY - tyl) * 0.18;

          orbit.style.left = (cx + dx * 0.42) + 'px';
          orbit.style.top  = (cy + dy * 0.42) + 'px';
          orbit.style.opacity = `${0.98 * force}`;
          orbit.style.transform = `translate(-50%,-50%) scale(${0.8 + force*0.6})`;
        } else {
          txl += (0 - txl) * 0.12;
          tyl += (0 - tyl) * 0.12;
          orbit.style.opacity = '0';
        }

        const nx = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, txl));
        const ny = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, tyl));
        const scale = 1 + Math.min(0.036, Math.hypot(nx,ny) / (MAX_TRANSLATE*30));
        latest.style.transform = `translate3d(${nx}px, ${ny}px, 0) scale(${scale})`;

        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

      // cleanup for latest
      const cleanupLatest = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('mousemove', onMove);
        io.disconnect();
        if (orbit && orbit.parentNode) orbit.parentNode.removeChild(orbit);
      };

      // store on root so cleanup below can access
      root._cleanupLatest = cleanupLatest;
    }

    // cleanup function
    return () => {
      // remove tilt listeners
      projects.forEach((el) => {
        const s = tiltState.get(el);
        if (s) {
          el.removeEventListener('pointermove', s.onMove);
          el.removeEventListener('mousemove', s.onMove);
          el.removeEventListener('touchmove', s.onMove);
          el.removeEventListener('mouseleave', s.onLeave);
          el.removeEventListener('touchend', s.onLeave);
        }
      });

      // profile listeners
      root.removeEventListener("pointermove", onHeroMove);
      root.removeEventListener("mousemove", onHeroMove);
      root.removeEventListener("touchmove", onHeroMove);
      root.removeEventListener("mouseleave", onHeroLeave);
      root.removeEventListener("touchend", onHeroLeave);

      // latest cleanup
      if (root._cleanupLatest) {
        try { root._cleanupLatest(); } catch (e) { /* ignore */ }
        delete root._cleanupLatest;
      }
    };
  }, []);

  // Minimal UI — you can replace content with your actual markup. Classes match the injected CSS.
  return (
    <div ref={rootRef} className="wrap" aria-label="animated-portfolio-root">
      <header className="topbar">
        <div className="wrap" style={{display:'flex',alignItems:'center',gap:16}}>
          <div className="brand">My<span className="accent" style={{color:'var(--accent-1)',marginLeft:6}}>Portfolio</span></div>
          <nav className="main-nav" aria-label="main navigation">
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div style={{marginLeft:'auto'}}>
            <button className="btn primary">Get in touch</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-grid">
            <div>
              <p className="overline">Welcome</p>
              <h1 className="hero-intro" id="latestText" ref={latestRef}>Hi — I’m Manish</h1>
              <p className="sub">This demo shows tilt, parallax and a "latest" attract micro-interaction wired to React.</p>
              <div className="cta-row">
                <a className="btn primary" href="#projects">View projects</a>
              </div>
            </div>

            <aside>
              <div ref={profileCardRef} id="profileCard" className="hero-card" aria-hidden>
                <img src={`https://picsum.photos/seed/pf/200`} alt="profile" className="profile-photo" />
                <div className="card-body">
                  <p className="name" style={{margin:0,fontSize:18}}>Manish Gupta</p>
                  <p className="role" style={{marginTop:6,color:'var(--muted)'}}>2nd-year AIML student</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="projects" className="section">
          <h2>Projects</h2>
          <div className="projects-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginTop:14}}>
            <article className="project" tabIndex={0} aria-label="project 1">
              <div className="p-preview">📘</div>
              <h3>College Portal</h3>
              <p className="muted">A unified portal for library, notes & exams.</p>
            </article>

            <article className="project" tabIndex={0} aria-label="project 2">
              <div className="p-preview">🔬</div>
              <h3>Federated Learning Demo</h3>
              <p className="muted">Hands-on federated learning experiments.</p>
            </article>

            <article className="project" tabIndex={0} aria-label="project 3">
              <div className="p-preview">🧠</div>
              <h3>ML Tools</h3>
              <p className="muted">Utilities and helpers for ML pipelines.</p>
            </article>

          </div>
        </section>
      </main>

      <footer className="site-footer" style={{paddingTop:18}}>
        <div className="footer-grid" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>© {new Date().getFullYear()} Manish</div>
          <div className="muted">Built with React</div>
        </div>
      </footer>
    </div>
  );
}
