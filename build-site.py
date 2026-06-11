#!/usr/bin/env python3
"""Theme H: photos live INSIDE copy panels, words overlaid; viz opposite on
pitch black; grainy near-black page; no standalone photo bands.
Hero: STS-52 atmosphere photo with copy overlaid (film grain kept).
s1: Goldstone dish / s2: cloud deck / s3: Typhoon Ragasa / s4: SPB balloon."""
import pathlib, re

SRC = pathlib.Path("/Users/adhikrish/code/cyclops-landing-pg/public/index.html")
html = pathlib.Path("/Users/adhikrish/code/cyclops-landing-pg/index.source.html").read_text()

# ---- hero -> photo hero; diagram -> aspect-true figure band ----
m = re.search(r'<svg viewBox="0 0 460 620"[^>]*>.*?</svg>', html, re.S)
assert m
svg = m.group(0).replace('viewBox="0 0 460 620"', 'viewBox="-68 0 528 620"', 1)
home_i = html.index('<div id="home"')
hero_i = html.index('<div class="hero">', home_i)
svg_end = html.index('</svg>', hero_i) + len('</svg>')
close_i = html.index('</div>\n  </div>', svg_end) + len('</div>\n  </div>')
new_hero = '''<div class="hero g-photo">
    <img class="g-bg" src="img/nasa-sunrise-limb.jpg" alt="Earth's atmosphere photographed from orbit" />
    <div class="g-scrim"></div>
    <div class="copy g-heroCopy">
      <h1 class="h1">The <em>always-on</em> optical link for orbital <br class="g-br" />data&nbsp;centres.</h1>
      <p class="p">Cyclops holds laser relays above the cloud line through a tether &mdash; <strong>99.99%</strong> uptime, in any weather.</p>
    </div>
    <span class="g-credit">Earth&rsquo;s atmosphere from orbit &middot; STS-52 &middot; NASA</span>
  </div>'''
html = html[:hero_i] + new_hero + html[close_i:]

# 02 arrangement: copy left, viz right (no flip)
html = html.replace('<section class="beat flip" id="s2">', '<section class="beat" id="s2">', 1)

# weather: original description restored
html = html.replace('<p class="p">Optical solves bandwidth and inherits weather. A single cloud layer between the telescope and the sky takes the link to zero, and no amount of engineering on the ground changes that. Availability becomes a property of the local climate.</p>',
    '<p class="p">Optical fixes the bandwidth, then trades it for a new problem: a laser dies in cloud. On the ground, the link is only as reliable as the weather.</p>', 1)

# 02/03 headlines: question form tying back to 00
html = html.replace('<h2 class="h1">Lasers die in cloud.</h2>',
    '<h2 class="h1">Why not lasers?</h2>', 1)
html = html.replace('<h2 class="h1">More ground stations don&rsquo;t fix it.</h2>',
    '<h2 class="h1">Why not site diversity?</h2>', 1)
html = html.replace('<p class="p">Weather is regional, so spare sites have to be far apart. When a front parks over one station, traffic reroutes 1,900&nbsp;km to a clear one and picks up over 50&nbsp;ms of backhaul. Inference traffic can&rsquo;t ride that.</p>',
    '<p class="p">The popular fix: scatter optical ground stations and route around the weather. But a front darkens a whole region at once, and rerouting adds 50+&nbsp;ms. Too slow for inference at scale.</p>', 1)

# radio: new tagline, original description restored
html = html.replace('''<h2 class="h1">Radio can&rsquo;t carry it.</h2>
      <p class="p">Spectrum is licensed in slivers and shared with everyone else in the sky. A radio downlink tops out near 2&nbsp;Gbps. An orbital data centre running inference needs a hundred times that.</p>''',
'''<h2 class="h1">Why not radio?</h2>
      <p class="p">Radio is spectrum-crowded &mdash; it can&rsquo;t scale as more satellites fight for the same bands, and it can&rsquo;t move the bandwidth that mass inference in orbit demands.</p>''', 1)

# ---- photo backdrops inside each copy panel (words overlaid) ----
def panel(section_marker, img, pos, credit_after, credit_text):
    global html
    old = section_marker + '\n    <div class="copy">'
    new = section_marker + '\n    <div class="copy g-cphoto">\n      ' + \
        f'<img class="g-cbg" src="img/{img}" alt="" style="object-position:{pos};" />\n      <div class="g-cscrim"></div>'
    assert old in html, f"marker not found: {section_marker}"
    html = html.replace(old, new, 1)
    assert credit_after in html, f"credit anchor not found: {credit_after[:40]}"
    html = html.replace(credit_after,
        credit_after + f'\n      <span class="g-ccredit">{credit_text}</span>', 1)

panel('<section class="beat" id="s1">', 'goldstone-tall.jpg', '50% 100%;filter:saturate(.8) contrast(.86) sepia(.12) brightness(.82)',
      'mass inference in orbit demands.</p>',
      'Sunset at Goldstone &middot; NASA/JPL')
panel('<section class="beat" id="s2">', 'storm-front.jpg', '50% 42%;filter:saturate(.78) contrast(.86) sepia(.12) brightness(.68)',
      'as reliable as the weather.</p>',
      'A storm front along the Persian Gulf &middot; NASA')
panel('<section class="beat" id="s3">', 'farm-coast.jpg', '46% 38%;filter:saturate(.78) contrast(.86) sepia(.12) brightness(.72)',
      'Too slow for inference at scale.</p>',
      'Farmland meeting the coast, from the ISS &middot; NASA')
panel('<section class="sys" id="s4">', 'shuttle-clouds.jpg', '38% 42%',
      'The forecast stops mattering.</p>',
      'Endeavour through the cloud deck &middot; STS-134 &middot; NASA')

# s4 becomes copy|viz pair: wrap grid, mount the relay diagram as its scene
html = html.replace('<section class="sys" id="s4">\n    <div class="copy g-cphoto">',
    '<section class="sys" id="s4">\n    <div class="sys-grid">\n    <div class="copy g-cphoto">', 1)
html = html.replace('    <div class="specs">',
    '    <div class="g-right">\n    <div class="scene g-figscene">\n      <span class="figtag">Fig. 01 &middot; Tethered relay, 0&ndash;20 km</span>\n      ' + svg + '\n    </div>\n    <div class="specs">', 1)

# remove the sticky problem banner
html = html.replace('<div class="prob-sticky"><h2 class="prob-line">Orbital compute has a downlink problem. Nothing flying today solves it.</h2></div>', '', 1)

# move the relay section to the top as 00, right after the hero
s4_i = html.index('<section class="sys" id="s4">')
s4_end = html.index('</section>', s4_i) + len('</section>')
s4_block = html[s4_i:s4_end].replace('04 / THE CYCLOPS RELAY', '00 / THE RELAY', 1)
s4_block = s4_block.replace('    </div>\n  </section>', '    </div>\n    </div>\n    </div>\n  </section>', 1)
html = html[:s4_i] + html[s4_end:]
prob_i = html.index('<div class="problems">')
html = html[:prob_i] + s4_block + '\n\n  ' + html[prob_i:]

# contact page: minimal — one statement, no panels
html = html.replace('<h1 class="h1">Talk to the founders.</h1>', '<h1 class="h1">Connect with our team.</h1>', 1)
html = re.sub(r'<figure class="plate"[^>]*>.*?</figure>', '', html, count=1, flags=re.S)

# spec numbers count up on arrival; remove the sub-line under +7 ms
html = html.replace('<span class="spec-num">20 <span class="u">km</span></span>',
    '<span class="spec-num"><b data-count="20" data-dec="0">0</b> <span class="u">km</span></span>', 1)
html = html.replace('<span class="spec-num">200 <span class="u">Gbps</span></span>',
    '<span class="spec-num"><b data-count="200" data-dec="0">0</b> <span class="u">Gbps</span></span>', 1)
html = html.replace('<span class="spec-num">99.999<span class="u">%</span></span>',
    '<span class="spec-num"><b data-count="99.999" data-dec="2">0</b><span class="u">%</span></span>', 1)
html = html.replace('<span class="spec-num">+7 <span class="u">ms</span></span>',
    '<span class="spec-num">+<b data-count="7" data-dec="0">0</b> <span class="u">ms</span></span>', 1)
html = html.replace('<span class="spec-sub">vs +52 ms rerouting around weather</span>', '', 1)

# weather viz: one continuous canvas across both columns (no center seam)
html = html.replace("""      <div id="wx-demo" class="wx-cmp">
        <div class="wx-col" data-mode="ground">
          <div class="wx-lab">Terrestrial optical ground station</div>
          <canvas class="wx-canvas" data-mode="ground"></canvas>
          <div class="wx-readout"><span class="wx-state">OFFLINE</span><div class="wx-num"><span class="wx-gbps">0</span> <span class="wx-u">Gbps</span></div><div class="wx-bar"><i></i></div></div>
        </div>
        <div class="wx-col" data-mode="relay">
          <div class="wx-lab">Cyclops relay</div>
          <canvas class="wx-canvas" data-mode="relay"></canvas>
          <div class="wx-readout"><span class="wx-state">ONLINE</span><div class="wx-num"><span class="wx-gbps">0</span> <span class="wx-u">Gbps</span></div><div class="wx-bar"><i></i></div></div>
        </div>
      </div>""",
"""      <div id="wx-demo" class="wx-cmp">
        <canvas class="wx-canvas wx-one"></canvas>
        <div class="wx-col" data-mode="ground">
          <div class="wx-lab">Terrestrial optical ground station</div>
          <div class="wx-readout"><span class="wx-state">OFFLINE</span><div class="wx-num"><span class="wx-gbps">0</span> <span class="wx-u">Gbps</span></div><div class="wx-bar"><i></i></div></div>
        </div>
        <div class="wx-col" data-mode="relay">
          <div class="wx-lab">Cyclops relay</div>
          <div class="wx-readout"><span class="wx-state">ONLINE</span><div class="wx-num"><span class="wx-gbps">0</span> <span class="wx-u">Gbps</span></div><div class="wx-bar"><i></i></div></div>
        </div>
      </div>""", 1)
html = html.replace('var scenes=[].map.call(root.querySelectorAll(".wx-canvas"),function(cv){return new Scene(cv,cv.dataset.mode);});',
                    'var scenes=[new Scene(root.querySelector(".wx-canvas"),"both")];', 1)
html = html.replace("""      var cx=W*0.5,satY=H*0.13,cloudY=H*0.57,grY=H*0.93,balY=cloudY-H*0.17,blocked=cloudAmt>0.5;
      if(mode==="ground"){
        if(blocked){beam(cx,grY-20,cx,cloudY+6,0.5+0.5*Math.sin(t*0.08),true);scatter(cx,cloudY+6);dead(cx,cloudY-6,satY+8);}
        else{beam(cx,grY-20,cx,satY+8,0.6+0.4*Math.sin(t*0.07),false);}
        ground(cx,grY);
      } else {
        tether(cx,grY-6,cx,balY+16);
        beam(cx,balY-6,cx,satY+8,0.6+0.4*Math.sin(t*0.07),false);
        ground(cx,grY); balloon(cx,balY);
      }
      clouds(cloudY); if(rainAmt>0.05) rain(cloudY); sat(cx,satY);}""",
"""      var cx1=W*0.27,cx2=W*0.73,satY=H*0.13,cloudY=H*0.57,grY=H*0.93,balY=cloudY-H*0.17,blocked=cloudAmt>0.5;
      if(blocked){beam(cx1,grY-20,cx1,cloudY+6,0.5+0.5*Math.sin(t*0.08),true);scatter(cx1,cloudY+6);dead(cx1,cloudY-6,satY+8);}
      else{beam(cx1,grY-20,cx1,satY+8,0.6+0.4*Math.sin(t*0.07),false);}
      ground(cx1,grY);
      tether(cx2,grY-6,cx2,balY+16);
      beam(cx2,balY-6,cx2,satY+8,0.6+0.4*Math.sin(t*0.07),false);
      ground(cx2,grY); balloon(cx2,balY);
      clouds(cloudY); if(rainAmt>0.05) rain(cloudY); sat(cx1,satY); sat(cx2,satY);}""", 1)

# single sans everywhere incl. canvas-drawn labels
html = html.replace("'Chakra Petch'", "'Barlow'")

# canvas cleanups: no stars in the weather scene; no dot-grid/horizon in latency lanes
html = html.replace('function clouds(y){if(cloudAmt<0.02)return;ctx.save();ctx.globalAlpha=cloudAmt;var drift=reduce?0:t*0.12;for(var i=0;i<6;i++){var X=((i*130+drift)%(W+220))-110,Y=y+Math.sin(i*1.6)*9,r=58+(i%3)*22,g=ctx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,"rgba(128,136,148,.6)");g.addColorStop(1,"rgba(128,136,148,0)");ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(X,Y,r,r*0.52,0,0,7);ctx.fill();}ctx.restore();}', 'function clouds(y){if(cloudAmt<0.02)return;ctx.save();ctx.globalAlpha=cloudAmt;var band=ctx.createLinearGradient(0,y-36,0,y+36);band.addColorStop(0,"rgba(128,136,148,0)");band.addColorStop(.5,"rgba(128,136,148,.32)");band.addColorStop(1,"rgba(128,136,148,0)");ctx.fillStyle=band;ctx.fillRect(0,y-36,W,72);var drift=reduce?0:t*0.12;ctx.translate(0,y);ctx.scale(1,0.5);for(var i=0;i<7;i++){var r=72+(i%3)*26,X=((i*150+drift)%(W+2*r))-r,Y=Math.sin(i*1.7)*18,g=ctx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,"rgba(128,136,148,.26)");g.addColorStop(1,"rgba(128,136,148,0)");ctx.fillStyle=g;ctx.fillRect(X-r,Y-r,r*2,r*2);}ctx.restore();}', 1)
html = html.replace('function cloud(x,y){ctx.save();for(var i=0;i<5;i++){var cx=x+i*26-52,cy=y+Math.sin(i)*6,r=38,gg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);gg.addColorStop(0,"rgba(128,136,148,.7)");gg.addColorStop(1,"rgba(128,136,148,0)");ctx.fillStyle=gg;ctx.beginPath();ctx.ellipse(cx,cy,r,r*0.55,0,0,7);ctx.fill();}ctx.restore();}', 'function cloud(x,y){ctx.save();ctx.translate(x,y);ctx.scale(1,0.55);for(var i=0;i<5;i++){var cx=i*26-52,cy=Math.sin(i)*11,r=40,gg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);gg.addColorStop(0,"rgba(128,136,148,.3)");gg.addColorStop(1,"rgba(128,136,148,0)");ctx.fillStyle=gg;ctx.fillRect(cx-r,cy-r,r*2,r*2);}ctx.restore();}', 1)
html = html.replace('stars=[];var ns=Math.round(W*H/8000);', 'stars=[];var ns=0;', 1)
html = html.replace('ctx.fillStyle="rgba(255,255,255,.05)";for(var y=g.horizon;y<H;y+=15)for(var x=0;x<W;x+=15){ctx.beginPath();ctx.arc(x,y,0.8,0,7);ctx.fill();}', '', 1)
html = html.replace('ctx.strokeStyle="rgba(255,255,255,.1)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,g.horizon);ctx.lineTo(W,g.horizon);ctx.stroke();', '', 1)
html = html.replace('sat:{x:W*0.5,y:H*0.18}', 'sat:{x:W*0.5,y:H*0.24}', 1)
html = html.replace('sat:{x:W*0.84,y:H*0.2}', 'sat:{x:W*0.84,y:H*0.26}', 1)

# replay the zoom-out when 00 enters the viewport
html = html.replace('</body>', '<script>(function(){if(matchMedia("(max-width:880px)").matches||matchMedia("(pointer:coarse)").matches)return;var SEC=["#top","#s4","#s1","#s2","#s3",".pfoot"].map(function(q){return document.querySelector(q);}).filter(Boolean);function contactOpen(){var c=document.getElementById("contact");return c&&!c.hidden;}function tops(){var max=document.documentElement.scrollHeight-window.innerHeight;return SEC.map(function(el){return Math.min(el.getBoundingClientRect().top+window.scrollY,max);});}var target=-1,animId=0,animating=false,lastT=0,accum=0,consumed=false;function curIndex(){var y=window.scrollY,ts=tops(),b=0;for(var i=0;i<ts.length;i++)if(ts[i]<=y+12)b=i;return b;}function fire(dir){var ts=tops();var base=animating?target:curIndex();var next=Math.max(0,Math.min(ts.length-1,base+dir));if(next===base&&!animating)return;target=next;var from=window.scrollY,to=ts[target];if(Math.abs(to-from)<1){animating=false;return;}animating=true;var id=++animId,t0=performance.now(),dur=620;(function step(n){if(id!==animId)return;var p=Math.min(1,(n-t0)/dur),e=1-Math.pow(1-p,3);window.scrollTo(0,from+(to-from)*e);if(p<1)requestAnimationFrame(step);else animating=false;})(t0);}window.addEventListener("wheel",function(e){if(contactOpen())return;e.preventDefault();var n=performance.now();if(n-lastT>90){accum=0;consumed=false;}lastT=n;accum+=e.deltaY;if(!consumed&&Math.abs(accum)>50){consumed=true;fire(accum>0?1:-1);}},{passive:false});window.addEventListener("keydown",function(e){if(contactOpen())return;if(e.key==="ArrowDown"||e.key==="PageDown"||(e.key===" "&&!e.shiftKey)){e.preventDefault();fire(1);}else if(e.key==="ArrowUp"||e.key==="PageUp"||(e.key===" "&&e.shiftKey)){e.preventDefault();fire(-1);}},{passive:false});})();</script><script>(function(){var s4=document.getElementById("s4");if(!s4)return;function cnt(){s4.querySelectorAll(".spec-num [data-count]").forEach(function(el){var t=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),t0=performance.now(),dur=1400;(function step(n){var p=Math.min(1,(n-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=(t*e).toFixed(dec);if(p<1)requestAnimationFrame(step);})(performance.now());});}new IntersectionObserver(function(es,io){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=0.35){s4.classList.add("in-view");io.disconnect();}});},{threshold:[0.35]}).observe(s4);var sp=s4.querySelector(".specs");if(sp){new IntersectionObserver(function(es,io){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=0.4){cnt();io.disconnect();}});},{threshold:[0.4]}).observe(sp);}})();</script>\n</body>', 1)

# 5. availability claim: 99.99
html = html.replace('99.999', '99.99')

# contact: orbital-debris field as full-screen backdrop
html = html.replace('''  <div class="hero">
    <div class="copy contact-copy">''',
'''  <div class="hero">
    <img class="g-cbg2" src="img/sunset-limb.jpg" alt="" />
    <div class="g-scrim2"></div>
    <span class="g-credit">Sunset over the Pacific Ocean &middot; STS-52 &middot; NASA</span>
    <div class="copy contact-copy">''', 1)

# ---- head injection ----
FONTS = "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,500&display=swap"
CSS = """
:root{
  --bg:#0c0b09; --bg2:#0c0b09;
  --ink:#f0f0ee; --ink2:#aaaca8; --muted:#75776f; --faint:#41433e;
  --grid:transparent; --line:transparent;
  --grot:"Barlow","Helvetica Neue",Arial,sans-serif;
  --display:"Barlow","Helvetica Neue",Arial,sans-serif;
  --mono:"Barlow","Helvetica Neue",Arial,sans-serif;
}
html{scroll-snap-type:none;scroll-behavior:auto;scroll-padding-top:0;}
body{background:var(--bg);color:var(--ink2);}
body::after{opacity:.68;background-size:256px 256px;}
.scene{background:transparent;}
.plate{background:#000;}
.brand .wm{color:var(--ink);}
.h1{font-family:"Source Serif 4",Georgia,serif;font-weight:500;letter-spacing:-.005em;}
.p{font-size:15.5px;line-height:1.62;}
.ix,.figtag,.spec-cap,.g-credit,.g-ccredit{font-family:var(--mono);letter-spacing:.16em;font-weight:600;text-transform:uppercase;}

/* photo hero */
#top{position:relative;}
#home header{position:absolute;top:0;left:0;right:0;z-index:20;background:transparent;border-bottom:0;}
#home header .wm,#home nav.cells a{}
#home nav.cells a{border-left:0;}
nav.cells a:hover{background:transparent;}
nav.cells a.get{color:#f0f0ee;text-decoration-color:rgba(255,255,255,.45);}
nav.cells a.get:hover{color:#fff;text-decoration-color:#fff;background:transparent;}
.ix{display:inline-block;width:fit-content;align-self:flex-start;background:#b21f18;color:#fff;padding:5px 10px 4px;line-height:1;}
.sys .copy .ix{margin-top:4vh;}
.g-photo{position:relative;display:block;min-height:100vh;min-height:100svh;overflow:hidden;}
.g-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%;}
.g-scrim{position:absolute;inset:0;background:linear-gradient(0deg,#0a0a0b 0%,rgba(10,10,11,.45) 22%,rgba(10,10,11,0) 52%,rgba(10,10,11,.18) 100%);}
.g-heroCopy{position:absolute;left:0;right:auto;bottom:0;border-right:0;max-width:1200px;padding:clamp(28px,5vw,72px);justify-content:flex-end;}
#home .hero.g-photo .h1{font-size:clamp(30px,4vw,56px);line-height:1.06;}
.g-heroCopy .p{max-width:none;color:#cbcdc8;}
.g-credit{position:absolute;right:16px;bottom:12px;z-index:3;font-size:9.5px;color:rgba(255,255,255,.45);}

/* s4: copy|diagram pair + specs */
.beat{min-height:100svh;}
.sys{min-height:100svh;}
.sys-grid{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1.12fr;}
.sys-grid .copy{flex:none;height:100%;}
.g-right{display:flex;flex-direction:column;min-height:0;}
.g-right .g-figscene{flex:1;min-height:0;}
.g-right .spec{padding:clamp(16px,2.6vh,30px) clamp(14px,1.5vw,26px);}
.spec{text-align:center;}
.g-right .spec-num{font-size:clamp(22px,2.1vw,34px);}
.g-figscene{position:relative;display:flex;align-items:center;justify-content:center;padding:clamp(18px,3.5vh,36px) 0;}
.g-figscene svg{height:100%;width:auto;display:block;transform:translateX(7%);}
.g-figscene svg #stage,.g-figscene svg .fade-wide{animation-play-state:paused;}
.sys.in-view .g-figscene svg #stage,.sys.in-view .g-figscene svg .fade-wide{animation-play-state:running;}
.g-figscene .figtag{position:absolute;top:14px;right:16px;z-index:3;color:var(--faint);}
/* fades instead of lines */
.g-cbg{-webkit-mask-image:radial-gradient(135% 120% at 32% 50%,#000 45%,rgba(0,0,0,.55) 68%,transparent 97%);mask-image:radial-gradient(135% 120% at 32% 50%,#000 45%,rgba(0,0,0,.55) 68%,transparent 97%);}
.beat.flip .g-cbg{-webkit-mask-image:radial-gradient(135% 120% at 68% 50%,#000 45%,rgba(0,0,0,.55) 68%,transparent 97%);mask-image:radial-gradient(135% 120% at 68% 50%,#000 45%,rgba(0,0,0,.55) 68%,transparent 97%);}
.g-bg{-webkit-mask-image:linear-gradient(180deg,#000 78%,rgba(0,0,0,.4) 93%,transparent 100%);mask-image:linear-gradient(180deg,#000 78%,rgba(0,0,0,.4) 93%,transparent 100%);}
.fface,.fli{border-color:rgba(255,255,255,.25);}
.pfoot{min-height:0;padding:clamp(28px,5vh,52px) clamp(24px,4.4vw,64px);}
#contact .hero{position:relative;}
.wx-cmp{position:relative;}
.wx-canvas.wx-one{position:absolute;inset:0;width:100%;height:100%;}
.wx-col{justify-content:space-between;position:relative;pointer-events:none;}
.g-cbg2{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 45%;}
.g-scrim2{position:absolute;inset:0;background:linear-gradient(0deg,#0a0a0b 0%,rgba(10,10,11,.5) 24%,rgba(10,10,11,0) 54%,rgba(10,10,11,.3) 100%);}
.g-cbg2{-webkit-mask-image:linear-gradient(180deg,#000 80%,rgba(0,0,0,.4) 94%,transparent 100%);mask-image:linear-gradient(180deg,#000 80%,rgba(0,0,0,.4) 94%,transparent 100%);}
#contact .hero{grid-template-columns:1fr;}
#contact .copy{align-items:flex-start;text-align:left;justify-content:flex-end;max-width:900px;padding:clamp(28px,5vw,72px);}
#contact .h1{font-size:clamp(30px,4vw,56px);line-height:1.06;}
#contact .founders{justify-content:flex-start;}
#contact .contact-list .email{color:var(--ink);border-color:rgba(255,255,255,.35);font-weight:400;font-size:clamp(15px,1.3vw,18px);letter-spacing:.01em;}
#contact .contact-list .email:hover{color:#fff;border-color:#fff;}
.spec-num b{font-weight:inherit;}
/* right panels echo the left: display-scale numbers in the headline serif, labels stay Barlow */
.tp-val,.tp-x b,.wx-gbps,.lat-big,.spec-num{font-family:"Source Serif 4",Georgia,serif;font-weight:500;}
.tp-name,.wx-lab,.lat-tag{font-family:var(--grot);font-weight:600;text-transform:uppercase;letter-spacing:.07em;}
.tp-name{font-size:12px;}
.p strong{font-weight:600;color:#fff;}

/* copy panels carrying photos, words overlaid */
.g-cphoto{position:relative;overflow:hidden;}
.g-cbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;filter:brightness(.68) saturate(.85);}
.g-cscrim{position:absolute;inset:0;z-index:1;background:linear-gradient(0deg,rgba(13,15,19,.6) 0%,rgba(13,15,19,.28) 50%,rgba(13,15,19,.42) 100%);}
.g-cphoto>*:not(.g-cbg):not(.g-cscrim){position:relative;z-index:2;}
.g-cphoto .h1{}
.g-cphoto .p{color:#c6c8c3;}
.g-ccredit{display:block;margin-top:20px;font-size:9px;color:rgba(255,255,255,.38);}
.g-cphoto::after,#contact .hero::after,.g-photo::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;mix-blend-mode:overlay;opacity:.65;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='gn'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23gn)' opacity='0.5'/%3E%3C/svg%3E");background-size:180px 180px;}
.g-cbg2{filter:saturate(.85) contrast(.9);}
.sys .copy.g-cphoto{padding-top:clamp(60px,12vh,130px);padding-bottom:clamp(60px,12vh,130px);}
.sys .g-cbg{filter:saturate(.8) contrast(.86) sepia(.1) brightness(.68);}
.sys .g-cscrim{background:linear-gradient(0deg,rgba(5,5,6,.72) 0%,rgba(5,5,6,.45) 50%,rgba(5,5,6,.52) 100%);}

@media(max-width:880px){
  .g-br{display:none;}
  .g-photo{min-height:100svh;}
  .g-heroCopy{position:absolute;padding:22px 20px 30px;}
  #home .hero.g-photo .h1{font-size:clamp(26px,7vw,34px);}
  .sys-grid{grid-template-columns:1fr;}
  .g-figscene{height:auto;padding:18px 0;}
  .g-figscene svg{height:auto;width:100%;max-height:70vh;}
  .g-cbg,.beat.flip .g-cbg{-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 10%,#000 80%,transparent 100%)!important;mask-image:linear-gradient(180deg,transparent 0%,#000 10%,#000 80%,transparent 100%)!important;}
  .g-cphoto{min-height:62vh;display:flex;flex-direction:column;justify-content:flex-end;}
}
"""
inject = f'<link href="{FONTS}" rel="stylesheet" />\n<style id="theme-h">{CSS}</style>\n</head>'
html = html.replace("</head>", inject, 1)

dest = SRC
dest.write_text(html)
print(f"built {dest.name} ({len(html)//1024} KB)")
