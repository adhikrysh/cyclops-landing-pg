/* ============================================================
   THROUGHPUT DEMO — radio trickle vs optical torrent
   ============================================================ */
(function () {
  const root = document.getElementById("tp-demo");
  if (!root) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let started = false;

  const rows = [...root.querySelectorAll(".tp-stream")].map((cv) => {
    const dense = cv.dataset.kind === "optical";
    return new Stream(cv, dense);
  });

  // count-up the headline numbers when in view
  function countUp() {
    root.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.dec ? +el.dataset.dec : 0);
      const t0 = performance.now(), dur = 1600;
      function step(now){
        const p = Math.min(1,(now-t0)/dur); const e=1-Math.pow(1-p,3);
        el.textContent = (target*e).toFixed(dec);
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting && !started) { started = true; countUp(); } });
  }, { threshold: 0.4 });
  io.observe(root);

  function Stream(canvas, dense) {
    const ctx = canvas.getContext("2d");
    let W=0,H=0,DPR=1,t=0,packets=[];
    const col = dense ? "#ff5a4d" : "#5d6b7e";
    const glow = dense ? "rgba(255,59,59,.7)" : "rgba(93,107,126,0)";
    function resize(){
      DPR=Math.min(window.devicePixelRatio||1,2);
      const r=canvas.getBoundingClientRect(); W=r.width; H=r.height;
      canvas.width=W*DPR; canvas.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
      packets=[];
      const n = dense ? 46 : 5;
      for(let i=0;i<n;i++) packets.push(spawn(true));
    }
    function spawn(initial){
      return { x: initial?Math.random()*W:-10, y: H*0.5 + (Math.random()-0.5)*(dense?H*0.55:H*0.22),
        v: (dense? 3.2+Math.random()*2.4 : 0.9+Math.random()*0.5), r: dense?(1.2+Math.random()*1.8):(1.4+Math.random()*1) };
    }
    function tick(){
      t++; ctx.clearRect(0,0,W,H);
      // baseline track
      ctx.strokeStyle="rgba(255,255,255,.06)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,H*0.5); ctx.lineTo(W,H*0.5); ctx.stroke();
      ctx.save();
      ctx.shadowColor=glow; ctx.shadowBlur=dense?8:0;
      for(const p of packets){
        if(!reduce && M()) p.x+=p.v;
        ctx.globalAlpha = dense?0.9:0.8;
        ctx.fillStyle=col;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
        if(p.x>W+10){ Object.assign(p,spawn(false)); }
      }
      ctx.restore();
      requestAnimationFrame(tick);
    }
    window.addEventListener("resize",resize); resize(); requestAnimationFrame(tick);
  }
})();
