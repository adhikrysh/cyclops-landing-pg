/* ============================================================
   HERO SCENE — cinematic canvas
   satellite ▸ red laser ▸ balloon above clouds ▸ tether ▸ ground
   ============================================================ */
(function () {
  const canvas = document.getElementById("hero-scene");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1, t = 0;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];
  function seed() {
    stars = [];
    const n = Math.round((W * H) / 9000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.92,
        r: Math.random() * 1.3 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random() * 1.5,
      });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function draw() {
    t += (reduce || !M()) ? 0 : 1;
    ctx.clearRect(0, 0, W, H);

    // --- deep gradient sky ---
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#070a12");
    sky.addColorStop(0.55, "#05060b");
    sky.addColorStop(1, "#04050a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // --- stars ---
    for (const s of stars) {
      const a = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.02 * s.sp + s.tw));
      ctx.globalAlpha = a;
      ctx.fillStyle = "#cdd6e6";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // geometry anchors (relative) — link column lives on the RIGHT, clear of headline
    const satX = W * 0.82, satY = H * 0.17;
    const balX = W * 0.70, balY = H * 0.55;
    const grX  = W * 0.70, grY  = H * 0.995;
    const cloudY = H * 0.74;

    // --- earth horizon glow (bottom) ---
    const horizon = ctx.createRadialGradient(W*0.5, H*1.25, H*0.3, W*0.5, H*1.25, H*0.95);
    horizon.addColorStop(0, "rgba(40,60,90,.5)");
    horizon.addColorStop(.5, "rgba(20,30,50,.18)");
    horizon.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horizon;
    ctx.fillRect(0, H*0.6, W, H*0.4);

    // --- cloud layer (drifting blobs) ---
    drawClouds(cloudY);

    // --- laser beam satellite -> balloon ---
    const pulse = 0.6 + 0.4 * Math.sin(t * 0.06);
    drawBeam(satX, satY, balX, balY - 14, pulse);

    // --- tether balloon -> ground (fiber + CNT) ---
    drawTether(balX, balY + 16, grX, grY);

    // --- ground node ---
    drawGround(grX, grY);

    // --- balloon ---
    drawBalloon(balX, balY);

    // --- satellite ---
    drawSat(satX, satY);

    requestAnimationFrame(draw);
  }

  function drawClouds(y) {
    ctx.save();
    const drift = reduce ? 0 : (t * 0.15);
    for (let i = 0; i < 7; i++) {
      const cx = ((i * 260 + drift) % (W + 400)) - 200;
      const cy = y + Math.sin(i * 1.7) * 18;
      const r = 90 + (i % 3) * 40;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(60,72,92,.5)");
      g.addColorStop(1, "rgba(60,72,92,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, 7); ctx.fill();
    }
    // soft band
    const band = ctx.createLinearGradient(0, y - 60, 0, y + 80);
    band.addColorStop(0, "rgba(40,50,68,0)");
    band.addColorStop(.5, "rgba(40,50,68,.28)");
    band.addColorStop(1, "rgba(40,50,68,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, y - 60, W, 140);
    ctx.restore();
  }

  function drawBeam(x1, y1, x2, y2, pulse) {
    ctx.save();
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, "rgba(255,120,90,.0)");
    g.addColorStop(.15, "rgba(255,90,70,.9)");
    g.addColorStop(1, "rgba(255,59,59,.95)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "rgba(255,59,59,.9)";
    ctx.shadowBlur = 16 * pulse;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    // travelling packets
    if (!reduce && M()) {
      for (let k = 0; k < 3; k++) {
        const p = ((t * 0.012 + k / 3) % 1);
        const px = x1 + (x2 - x1) * p;
        const py = y1 + (y2 - y1) * p;
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#ffd9cf";
        ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 7); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawTether(x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = "rgba(150,165,185,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    // data shimmer down the fiber
    if (!reduce && M()) {
      for (let k = 0; k < 4; k++) {
        const p = ((t * 0.01 + k / 4) % 1);
        const px = x1 + (x2 - x1) * p;
        const py = y1 + (y2 - y1) * p;
        ctx.fillStyle = "rgba(255,90,70,.8)";
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, 7); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawBalloon(x, y) {
    const bob = reduce ? 0 : Math.sin(t * 0.03) * 6;
    y += bob;
    ctx.save();
    // glow halo
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 48);
    halo.addColorStop(0, "rgba(255,59,59,.18)");
    halo.addColorStop(1, "rgba(255,59,59,0)");
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, 48, 0, 7); ctx.fill();
    // envelope
    const g = ctx.createRadialGradient(x - 6, y - 8, 2, x, y, 26);
    g.addColorStop(0, "#e9edf4");
    g.addColorStop(1, "#aeb7c6");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y - 4, 20, 24, 0, 0, 7); ctx.fill();
    // payload (transceiver)
    ctx.fillStyle = "#11161f";
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 1;
    ctx.fillRect(x - 7, y + 16, 14, 9); ctx.strokeRect(x - 7, y + 16, 14, 9);
    ctx.fillStyle = "var(--laser)";
    ctx.fillStyle = "#ff3b3b";
    ctx.beginPath(); ctx.arc(x, y + 20.5, 1.7, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawSat(x, y) {
    const dx = reduce ? 0 : Math.sin(t * 0.01) * 8;
    x += dx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.18);
    // panels
    ctx.fillStyle = "#1a2230";
    ctx.strokeStyle = "rgba(120,140,170,.5)"; ctx.lineWidth = 1;
    ctx.fillRect(-46, -8, 30, 16); ctx.strokeRect(-46, -8, 30, 16);
    ctx.fillRect(16, -8, 30, 16); ctx.strokeRect(16, -8, 30, 16);
    for (let i=1;i<3;i++){ ctx.beginPath(); ctx.moveTo(-46+i*10,-8); ctx.lineTo(-46+i*10,8); ctx.moveTo(16+i*10,-8); ctx.lineTo(16+i*10,8); ctx.stroke(); }
    // body
    ctx.fillStyle = "#dfe5ee";
    ctx.fillRect(-13, -11, 26, 22);
    ctx.fillStyle = "#0c1017";
    ctx.fillRect(-9, -7, 18, 14);
    // optical aperture (glowing)
    ctx.shadowColor = "rgba(255,59,59,.9)"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#ff5a4d";
    ctx.beginPath(); ctx.arc(0, 8, 3, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawGround(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(150,165,185,.5)";
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(8, -16); ctx.lineTo(-8, -16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0c1017"; ctx.fillRect(-5, -22, 10, 8);
    ctx.restore();
  }

  window.addEventListener("resize", resize);
  resize();
  if (reduce) { draw(); } else { requestAnimationFrame(draw); }
})();
