// script.js — simple and small interactions (respect reduced motion)
(function () {
  // copyright year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  // --- particles.js (soft background) ---
  if (window.particlesJS) {
    try {
      particlesJS('particles-js', {
        particles: {
          number: { value: 30, density: { enable: true, value_area: 900 } },
          color: { value: ['#60a5fa', '#8b5cf6', '#06b6d4'] },
          shape: { type: 'circle' },
          opacity: { value: 0.12, random: true },
          size: { value: 5, random: true },
          move: { enable: true, speed: 0.8, out_mode: 'out' }
        },
        interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false } } },
        retina_detect: true
      });
    } catch (e) { /* ignore */ }
  }

  // --- pointer-follow for blobs (simple smoothing) ---
  (function pointerFollow() {
    const blobs = Array.from(document.querySelectorAll('.bg-blob'));
    if (!blobs.length) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let sx = 0, sy = 0;
    const ease = 0.08;

    function onPointer(e) {
      const ev = e.touches ? e.touches[0] : e;
      mx = ev.clientX; my = ev.clientY;
    }
    document.addEventListener('pointermove', onPointer, { passive: true });

    function loop() {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const nx = (mx - cx) / cx, ny = (my - cy) / cy;
      sx += (nx - sx) * ease; sy += (ny - sy) * ease;
      blobs.forEach((b, i) => {
        const depth = 1 - (i / blobs.length);
        const tx = sx * 16 * depth; const ty = sy * 12 * depth;
        b.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1 + depth*0.02})`;
      });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();

  // --- tap/click burst (ephemeral simple particles) ---
  (function tapBurst() {
    const container = document.getElementById('bg-anim') || document.body;
    function spawn(x, y) {
      const count = 8 + Math.floor(Math.random()*6);
      for (let i=0;i<count;i++){
        const el = document.createElement('span');
        el.className = 'tap-particle';
        const size = 6 + Math.random()*12;
        el.style.width = el.style.height = size + 'px';
        el.style.left = x + 'px'; el.style.top = y + 'px';
        container.appendChild(el);
        const angle = Math.random()*Math.PI*2;
        const speed = 40 + Math.random()*120;
        const vx = Math.cos(angle)*speed, vy = Math.sin(angle)*speed;
        const life = 500 + Math.random()*700;
        const start = performance.now();
        function frame(now){
          const t = (now - start) / life;
          if (t >= 1){ if (el.parentNode) el.parentNode.removeChild(el); return; }
          // simple motion
          const dt = 16/1000;
          const curLeft = parseFloat(el.style.left) || 0;
          const curTop = parseFloat(el.style.top) || 0;
          el.style.left = (curLeft + vx*dt*(1-t)) + 'px';
          el.style.top = (curTop + vy*dt*(1-t) + (t*20)) + 'px';
          el.style.opacity = String(1 - t);
          el.style.transform = `translate(-50%,-50%) scale(${0.6 + 0.4*(1-t)})`;
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
    }
    function onPointerDown(e){
      const ev = e.touches ? e.touches[0] : e;
      spawn(ev.clientX, ev.clientY);
    }
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
  })();

  // --- button ripple ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    if (btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.2;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.transition = 'transform .55s cubic-bezier(.2,.9,.25,1), opacity .55s ease';
    btn.appendChild(ripple);
    requestAnimationFrame(()=> {
      ripple.style.transform = 'translate(-50%,-50%) scale(1)';
      ripple.style.opacity = '0';
    });
    setTimeout(()=> { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 650);
  }, { passive: true });

  // --- reveal on scroll ---
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting){ en.target.classList.add('visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // --- small hero parallax for profile card ---
  (function heroParallax(){
    const profile = document.getElementById('profileCard');
    const hero = document.querySelector('.hero');
    if (!profile || !hero) return;
    let tx=0, ty=0, ttx=0, tty=0;
    hero.addEventListener('pointermove', (e)=> {
      const ev = e.touches ? e.touches[0] : e;
      const rect = profile.getBoundingClientRect();
      const dx = (ev.clientX - (rect.left + rect.width/2)) / rect.width;
      const dy = (ev.clientY - (rect.top + rect.height/2)) / rect.height;
      tx = dx * 10; ty = dy * 10;
    }, { passive: true });
    function loop(){
      ttx += (tx - ttx) * 0.14;
      tty += (ty - tty) * 0.14;
      profile.style.transform = `translate3d(${ttx.toFixed(2)}px, ${tty.toFixed(2)}px, 0)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();

  // --- small tilt for project cards (pointer only) ---
  (function smallTilt(){
    document.querySelectorAll('.project').forEach(el=>{
      let raf=null, trX=0, trY=0, crX=0, crY=0;
      function step(){
        crX += (trX - crX) * 0.18;
        crY += (trY - crY) * 0.18;
        el.style.transform = `perspective(900px) rotateX(${crX.toFixed(2)}deg) rotateY(${crY.toFixed(2)}deg)`;
        if (Math.abs(trX-crX)<0.01 && Math.abs(trY-crY)<0.01){ cancelAnimationFrame(raf); raf=null; return; }
        raf = requestAnimationFrame(step);
      }
      el.addEventListener('pointermove', (e)=>{
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width;
        const py = (e.clientY - r.top)/r.height;
        trY = (px - 0.5) * 6; trX = (0.5 - py) * 6;
        if (!raf) raf = requestAnimationFrame(step);
      }, { passive: true });
      el.addEventListener('pointerleave', ()=>{ trX=trY=0; if (!raf) raf=requestAnimationFrame(step); });
    });
  })();

})(); // end
