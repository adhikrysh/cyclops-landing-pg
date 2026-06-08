/* ============================================================
   WEATHER DEMO — link survival under weather
   Ground station (laser dies in cloud) vs Cyclops relay (above cloud)
   ============================================================ */
(function () {
  const root = document.getElementById("wx-demo");
  if (!root) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // weather presets ------------------------------------------------------
  const WX = {
    clear: { label: "CLEAR SKY", cloud: 0.0, rain: 0,
      ground: { state: "DEGRADED", pct: 0.42, note: "vapour + dust scatter the beam" },
      relay:  { state: "ONLINE",   pct: 1.00, note: "clean line-of-sight above haze" } },
    cloud: { label: "CLOUD COVER", cloud: 1.0, rain: 0,
      ground: { state: "OFFLINE",  pct: 0.0,  note: "cloud attenuation ≈ 50 dB/km — link dies" },
      relay:  { state: "ONLINE",   pct: 1.00, note: "relay floats above the cloud deck" } },
    storm: { label: "STORM", cloud: 1.0, rain: 1,
      ground: { state: "OFFLINE",  pct: 0.0,  note: "no optical path through the weather" },
      relay:  { state: "ONLINE",   pct: 0.98, note: "weather sits below the relay" } },
  };
  const STATE = { color: { ONLINE: "#36ff9e", DEGRADED: "#ffb13b", OFFLINE: "#ff3b3b" } };
  const MAX_GBPS = 1000;

  let current = "cloud";

  // build two scenes -----------------------------------------------------
  const scenes = [...root.querySelectorAll(".wx-canvas")].map((cv) => new Scene(cv, cv.dataset.mode));

  function setWeather(key) {
    current = key;
    root.querySelectorAll("[data-wx]").forEach((b) =>
      b.classList.toggle("is-on", b.dataset.wx === key));
    scenes.forEach((s) => s.setWeather(key));
    updateBadges();
  }

  function updateBadges() {
    const wx = WX[current];
    root.querySelectorAll(".wx-panel").forEach((panel) => {
      const mode = panel.dataset.mode;            // ground | relay
      const d = wx[mode];
      const badge = panel.querySelector(".wx-state");
      const note  = panel.querySelector(".wx-note");
      const num   = panel.querySelector(".wx-gbps");
      const bar   = panel.querySelector(".wx-bar > i");
      badge.textContent = d.state;
      badge.style.color = STATE.color[d.state];
      badge.style.borderColor = d.state === "OFFLINE" ? "rgba(255,59,59,.4)" : "rgba(255,255,255,.16)";
      badge.previousElementSibling.style.background = STATE.color[d.state];
      badge.previousElementSibling.style.boxShadow = "0 0 10px " + STATE.color[d.state];
      note.textContent = d.note;
      const gbps = Math.round(d.pct * MAX_GBPS);
      num.dataset.target = gbps;
      bar.style.width = (d.pct * 100) + "%";
      bar.style.background = STATE.color[d.state];
      panel.classList.toggle("is-down", d.state === "OFFLINE");
    });
    animateNums();
  }

  function animateNums() {
    root.querySelectorAll(".wx-gbps").forEach((el) => {
      const target = +el.dataset.target;
      const from = +(el.dataset.cur || 0);
      const t0 = performance.now(), dur = 700;
      function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        const v = Math.round(from + (target - from) * e);
        el.textContent = v;
        el.dataset.cur = v;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  root.querySelectorAll("[data-wx]").forEach((b) =>
    b.addEventListener("click", () => setWeather(b.dataset.wx)));

  setWeather(current);

  // ---------------------------------------------------------------------
  function Scene(canvas, mode) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, DPR = 1, t = 0, wx = WX.cloud, cloudAmt = 1, rainAmt = 0;
    let drops = [], stars = [];

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      stars = Array.from({ length: Math.round(W * H / 7000) }, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.5, r: Math.random() * 1.1 + .2, tw: Math.random() * 7,
      }));
      drops = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 4 + Math.random() * 4, l: 8 + Math.random() * 10 }));
    }

    this.setWeather = (key) => { wx = WX[key]; };

    function tick() {
      t += (reduce || !M()) ? 0 : 1;
      cloudAmt += (wx.cloud - cloudAmt) * 0.06;
      rainAmt  += (wx.rain  - rainAmt)  * 0.06;
      render();
      requestAnimationFrame(tick);
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#070a12"); sky.addColorStop(1, "#06080e");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      // stars
      for (const s of stars) {
        ctx.globalAlpha = (0.4 + 0.5 * Math.sin(t * 0.03 + s.tw)) * (1 - cloudAmt * 0.5);
        ctx.fillStyle = "#cdd6e6"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;

      const satX = W * 0.5, satY = H * 0.1;
      const cloudY = H * 0.62;
      const grX = W * 0.5, grY = H * 0.97;
      const balY = cloudY - H * 0.14;

      const blocked = cloudAmt > 0.5;

      if (mode === "ground") {
        // beam from sat downward
        if (blocked) {
          drawBeam(satX, satY, grX, cloudY, "#ff5a4d", 0.5 + 0.5 * Math.sin(t*0.08), true);
          scatter(grX, cloudY);                          // beam smashes into cloud
          drawDeadLink(grX, cloudY + 8, grY);            // dashed dead segment
        } else {
          drawBeam(satX, satY, grX, grY - 22, "#ff5a4d", 0.6 + 0.4*Math.sin(t*0.07), false, 0.5);
        }
        drawGround(grX, grY);
      } else {
        // relay: beam to balloon (always above clouds), tether down
        drawBeam(satX, satY, grX, balY + 14, "#ff5a4d", 0.6 + 0.4 * Math.sin(t * 0.07), false);
        drawTether(grX, balY + 22, grX, grY - 6);
        drawGround(grX, grY);
        drawBalloon(grX, balY);
      }

      drawClouds(cloudY);
      if (rainAmt > 0.05) drawRain(cloudY);
      drawSat(satX, satY);
    }

    function drawBeam(x1,y1,x2,y2,col,pulse,dim,strength){
      ctx.save();
      const g = ctx.createLinearGradient(x1,y1,x2,y2);
      g.addColorStop(0,"rgba(255,120,90,0)");
      g.addColorStop(.2, dim?"rgba(255,90,70,.5)":"rgba(255,90,70,.9)");
      g.addColorStop(1, col);
      ctx.strokeStyle = g; ctx.lineWidth = dim?1.4:2.2;
      ctx.shadowColor = "rgba(255,59,59,.9)"; ctx.shadowBlur = (dim?6:14)*pulse;
      if (strength && strength < 0.7) ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      if (!reduce && M() && !dim) for (let k=0;k<3;k++){ const p=((t*0.014+k/3)%1); ctx.shadowBlur=10; ctx.fillStyle="#ffd9cf"; ctx.beginPath(); ctx.arc(x1+(x2-x1)*p,y1+(y2-y1)*p,2,0,7); ctx.fill(); }
      ctx.restore();
    }
    function scatter(x,y){
      ctx.save(); ctx.shadowColor="rgba(255,80,60,.8)"; ctx.shadowBlur=10;
      for(let i=0;i<10;i++){ const a=(t*0.05+i)* (i%2?1:-1); const rr=6+((t*0.6+i*9)%26); ctx.globalAlpha=Math.max(0,1-rr/30); ctx.fillStyle="#ff6a4d"; ctx.beginPath(); ctx.arc(x+Math.cos(a)*rr, y+Math.sin(a)*rr*0.5, 1.8,0,7); ctx.fill(); }
      ctx.restore();
    }
    function drawDeadLink(x,y1,y2){
      ctx.save(); ctx.strokeStyle="rgba(255,59,59,.28)"; ctx.lineWidth=1.4; ctx.setLineDash([3,6]);
      ctx.beginPath(); ctx.moveTo(x,y1); ctx.lineTo(x,y2); ctx.stroke(); ctx.restore();
    }
    function drawTether(x1,y1,x2,y2){
      ctx.save(); ctx.strokeStyle="rgba(150,165,185,.4)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      if(!reduce && M()) for(let k=0;k<4;k++){ const p=((t*0.012+k/4)%1); ctx.fillStyle="rgba(255,90,70,.85)"; ctx.beginPath(); ctx.arc(x1,y1+(y2-y1)*p,1.5,0,7); ctx.fill(); }
      ctx.restore();
    }
    function drawClouds(y){
      if (cloudAmt < 0.02) return;
      ctx.save(); ctx.globalAlpha = cloudAmt;
      const drift = reduce?0:t*0.12;
      const n = 6;
      for(let i=0;i<n;i++){ const cx=((i*150+drift)%(W+240))-120; const cy=y+Math.sin(i*1.6)*10; const r=70+(i%3)*26;
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r); g.addColorStop(0,"rgba(70,82,104,.92)"); g.addColorStop(1,"rgba(70,82,104,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(cx,cy,r,r*0.52,0,0,7); ctx.fill(); }
      ctx.restore();
    }
    function drawRain(y){
      ctx.save(); ctx.globalAlpha=rainAmt; ctx.strokeStyle="rgba(150,170,200,.45)"; ctx.lineWidth=1;
      for(const d of drops){ if(d.y<y) d.y=y; ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-2,d.y+d.l); ctx.stroke(); if(!reduce && M()){ d.y+=d.v; if(d.y>H){ d.y=y+Math.random()*20; d.x=Math.random()*W; } } }
      ctx.restore();
    }
    function drawBalloon(x,y){
      const bob=reduce?0:Math.sin(t*0.04)*4; y+=bob;
      ctx.save();
      const halo=ctx.createRadialGradient(x,y,0,x,y,40); halo.addColorStop(0,"rgba(255,59,59,.16)"); halo.addColorStop(1,"rgba(255,59,59,0)");
      ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(x,y,40,0,7); ctx.fill();
      const g=ctx.createRadialGradient(x-4,y-6,2,x,y,20); g.addColorStop(0,"#e9edf4"); g.addColorStop(1,"#aeb7c6");
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,y-3,15,18,0,0,7); ctx.fill();
      ctx.fillStyle="#11161f"; ctx.fillRect(x-6,y+13,12,7);
      ctx.fillStyle="#ff3b3b"; ctx.beginPath(); ctx.arc(x,y+16.5,1.5,0,7); ctx.fill();
      ctx.restore();
    }
    function drawSat(x,y){
      const dx=reduce?0:Math.sin(t*0.012)*5; x+=dx;
      ctx.save(); ctx.translate(x,y); ctx.rotate(-0.16);
      ctx.fillStyle="#1a2230"; ctx.strokeStyle="rgba(120,140,170,.5)"; ctx.lineWidth=1;
      ctx.fillRect(-38,-6,24,12); ctx.strokeRect(-38,-6,24,12);
      ctx.fillRect(14,-6,24,12); ctx.strokeRect(14,-6,24,12);
      ctx.fillStyle="#dfe5ee"; ctx.fillRect(-11,-9,22,18);
      ctx.fillStyle="#0c1017"; ctx.fillRect(-7,-5,14,11);
      ctx.shadowColor="rgba(255,59,59,.9)"; ctx.shadowBlur=10; ctx.fillStyle="#ff5a4d";
      ctx.beginPath(); ctx.arc(0,7,2.4,0,7); ctx.fill();
      ctx.restore();
    }
    function drawGround(x,y){
      ctx.save(); ctx.translate(x,y);
      ctx.fillStyle="rgba(150,165,185,.55)";
      ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(12,0); ctx.lineTo(7,-13); ctx.lineTo(-7,-13); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#0c1017"; ctx.fillRect(-4,-19,8,7);
      ctx.restore();
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(tick);
  }
})();
