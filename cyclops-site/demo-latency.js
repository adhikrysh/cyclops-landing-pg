/* ============================================================
   LATENCY DEMO — "stay near the user" (dual lane, both visible)
   Ground: user ▸ orbit ▸ distant clear-sky OGS ▸ 1,900 km backhaul home
   Cyclops: relay directly overhead ▸ local downlink
   ============================================================ */
(function () {
  const root = document.getElementById("lat-demo");
  if (!root) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = () => (typeof window.M === "function" ? window.M() : true);

  const ORANGE = "#ff7a4d", GREEN = "#36ff9e", STEEL = "rgba(150,165,185,.55)";

  root.querySelectorAll(".lat-canvas").forEach((cv) => new Lane(cv, cv.dataset.lane));

  // count-up the big ms numbers when scrolled into view
  let counted = false;
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (e.isIntersecting && !counted) {
        counted = true;
        root.querySelectorAll("[data-count]").forEach((el) => {
          const target = +el.dataset.count, t0 = performance.now(), dur = 1100;
          (function step(now){ const p=Math.min(1,(now-t0)/dur), e2=1-Math.pow(1-p,3);
            el.textContent = Math.round(target*e2); if(p<1) requestAnimationFrame(step); })(t0);
        });
      }
    });
  }, { threshold: 0.4 });
  io.observe(root);

  function Lane(canvas, kind) {
    const ctx = canvas.getContext("2d");
    let W=0,H=0,DPR=1,t=0,pkt=0;
    const ground = kind === "ground";

    function resize(){
      DPR=Math.min(window.devicePixelRatio||1,2);
      const r=canvas.getBoundingClientRect(); W=r.width; H=r.height;
      canvas.width=W*DPR; canvas.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
    }

    function G(){
      if (ground) return {
        horizon: H*0.82,
        user:  { x: W*0.10, y: H*0.66 },
        sat:   { x: W*0.50, y: H*0.16 },
        near:  { x: W*0.30, y: H*0.70 },
        far:   { x: W*0.90, y: H*0.66 },
      };
      return {
        horizon: H*0.86,
        user:  { x: W*0.16, y: H*0.80 },
        relay: { x: W*0.16, y: H*0.34 },
        sat:   { x: W*0.84, y: H*0.18 },
      };
    }

    function tick(){ if (M() && !reduce) { t++; pkt = (pkt + (ground ? 0.0045 : 0.011)) % 1; } render(); requestAnimationFrame(tick); }

    function render(){
      ctx.clearRect(0,0,W,H);
      const g = G();

      // terrain dots + horizon
      ctx.fillStyle="rgba(255,255,255,.05)";
      for(let y=g.horizon; y<H; y+=15) for(let x=0; x<W; x+=15){ ctx.beginPath(); ctx.arc(x,y,0.8,0,7); ctx.fill(); }
      ctx.strokeStyle="rgba(255,255,255,.10)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,g.horizon); ctx.lineTo(W,g.horizon); ctx.stroke();

      drawSat(g.sat, ground ? GREEN : GREEN);

      if (ground) {
        // failed local attempt
        drawCloud(g.near.x, g.near.y - H*0.20);
        beam(g.sat, g.near, "rgba(255,59,59,.22)", null, [4,6]);
        cross(g.near);
        node(g.near, 6, "rgba(150,165,185,.6)"); label(g.near, "LOCAL OGS · CLOUDED", "#ff7a4d", 22);

        // working long route: user -> sat -> far OGS -> long backhaul home
        beam(g.user, g.sat, ORANGE, "rgba(255,90,70,.55)");
        beam(g.sat, g.far, ORANGE, "rgba(255,90,70,.55)");
        node(g.far, 7, "#cdd6e6"); label(g.far, "CLEAR-SKY OGS", "#9fb0c6", 24);
        // backhaul (long terrestrial)
        beam(g.far, g.user, "rgba(120,135,160,.6)", null, [3,7]);
        midLabel(g.far, g.user, "1,900 km backhaul", "#7a8699", g.horizon + 26);

        const seq = [g.user, g.sat, g.far, g.user];
        drawPacket(seq, pkt, ORANGE);
      } else {
        // tether + local laser
        beam(g.user, g.relay, STEEL, null);            // short fibre up to relay
        beam(g.relay, g.sat, ORANGE, "rgba(255,90,70,.6)");
        drawBalloon(g.relay);
        label(g.relay, "CYCLOPS RELAY", "#ff8a78", -26);
        midLabel(g.user, g.relay, "local downlink", "#7a8699", (g.user.y+g.relay.y)/2, true);

        const seq = [g.user, g.relay, g.sat, g.relay, g.user];
        drawPacket(seq, pkt, GREEN);
      }

      // user node (always)
      node(g.user, 7, "#fff");
      ctx.strokeStyle="rgba(255,255,255,.35)"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(g.user.x, g.user.y, 13, 0, 7); ctx.stroke();
      if (M() && !reduce){ const pr=13+((t*0.7)%22); ctx.globalAlpha=Math.max(0,1-(pr-13)/22); ctx.beginPath(); ctx.arc(g.user.x,g.user.y,pr,0,7); ctx.stroke(); ctx.globalAlpha=1; }
      label(g.user, "YOUR DATA CENTRE", "#cdd6e6", 26);
    }

    function beam(a,b,col,glow,dash){
      ctx.save(); ctx.strokeStyle=col; ctx.lineWidth=dash?1.6:2.6; if(dash) ctx.setLineDash(dash);
      if(glow){ ctx.shadowColor=glow; ctx.shadowBlur=12; }
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.restore();
    }
    function node(p,r,fill){ ctx.save(); ctx.fillStyle=fill; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,7); ctx.fill(); ctx.restore(); }
    function cross(p){ ctx.save(); ctx.strokeStyle="#ff3b3b"; ctx.lineWidth=2; const s=6; ctx.beginPath(); ctx.moveTo(p.x-s,p.y-s); ctx.lineTo(p.x+s,p.y+s); ctx.moveTo(p.x+s,p.y-s); ctx.lineTo(p.x-s,p.y+s); ctx.stroke(); ctx.restore(); }
    function label(p,txt,col,dy){ ctx.save(); ctx.font="600 11px 'JetBrains Mono', monospace"; ctx.fillStyle=col; ctx.textAlign="center"; ctx.fillText(txt, p.x, p.y + (dy||-16)); ctx.restore(); }
    function midLabel(a,b,txt,col,y,center){ ctx.save(); ctx.font="500 10.5px 'JetBrains Mono', monospace"; ctx.fillStyle=col; ctx.textAlign="center"; const mx=center?(a.x):((a.x+b.x)/2); ctx.fillText(txt, mx, y); ctx.restore(); }

    function drawSat(p,accent){
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(-0.15);
      ctx.fillStyle="#1a2230"; ctx.strokeStyle="rgba(120,140,170,.5)"; ctx.lineWidth=1;
      ctx.fillRect(-34,-6,20,12); ctx.strokeRect(-34,-6,20,12);
      ctx.fillRect(14,-6,20,12); ctx.strokeRect(14,-6,20,12);
      ctx.fillStyle="#dfe5ee"; ctx.fillRect(-10,-8,20,16);
      ctx.fillStyle="#0c1017"; ctx.fillRect(-6,-5,12,10);
      ctx.shadowColor="rgba(255,90,70,.9)"; ctx.shadowBlur=10; ctx.fillStyle="#ff5a4d";
      ctx.beginPath(); ctx.arc(0,7,2.4,0,7); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.font="600 11px 'JetBrains Mono', monospace"; ctx.fillStyle="#9fb0c6"; ctx.textAlign="center"; ctx.fillText("LEO SATELLITE", p.x, p.y-18); ctx.restore();
    }
    function drawCloud(x,y){ ctx.save(); for(let i=0;i<4;i++){ const cx=x+i*24-32, cy=y+Math.sin(i)*6, r=36; const gg=ctx.createRadialGradient(cx,cy,0,cx,cy,r); gg.addColorStop(0,"rgba(78,90,112,.85)"); gg.addColorStop(1,"rgba(78,90,112,0)"); ctx.fillStyle=gg; ctx.beginPath(); ctx.ellipse(cx,cy,r,r*0.55,0,0,7); ctx.fill(); } ctx.restore(); }
    function drawBalloon(p){ const bob=(M()&&!reduce)?Math.sin(t*0.04)*3:0; ctx.save(); ctx.translate(p.x,p.y+bob);
      const halo=ctx.createRadialGradient(0,0,0,0,0,34); halo.addColorStop(0,"rgba(255,59,59,.2)"); halo.addColorStop(1,"rgba(255,59,59,0)"); ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(0,0,34,0,7); ctx.fill();
      const gb=ctx.createRadialGradient(-3,-5,1,0,0,16); gb.addColorStop(0,"#e9edf4"); gb.addColorStop(1,"#aeb7c6"); ctx.fillStyle=gb; ctx.beginPath(); ctx.ellipse(0,-2,12,15,0,0,7); ctx.fill();
      ctx.fillStyle="#11161f"; ctx.fillRect(-6,11,12,7); ctx.fillStyle="#ff3b3b"; ctx.beginPath(); ctx.arc(0,14.5,1.6,0,7); ctx.fill(); ctx.restore(); }

    function drawPacket(pts, p, col){
      let segs=[],tot=0;
      for(let i=0;i<pts.length-1;i++){ const d=Math.hypot(pts[i+1].x-pts[i].x,pts[i+1].y-pts[i].y); segs.push(d); tot+=d; }
      const draw1=(pp)=>{ let dist=pp*tot,i=0; while(i<segs.length-1 && dist>segs[i]){ dist-=segs[i]; i++; } const a=pts[i],b=pts[i+1],f=segs[i]?dist/segs[i]:0; const x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f; ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=14; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y,3.6,0,7); ctx.fill(); ctx.restore(); };
      draw1(p);
      // a couple trailing packets for the slow ground route to show "distance"
      if (ground){ draw1((p+0.5)%1); }
      else { draw1((p+0.33)%1); draw1((p+0.66)%1); }
    }

    window.addEventListener("resize", () => { resize(); render(); });
    resize(); render(); requestAnimationFrame(tick);
  }
})();
