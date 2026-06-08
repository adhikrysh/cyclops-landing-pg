/* Tweaks app for the Cyclops landing page.
   Manipulates the existing (vanilla) DOM via side-effects. */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headline": "The NVLink|for space.",
  "ctaLabel": "See the demonstration",
  "kicker": "Cyclops Space",
  "animate": true,
  "showGrid": true,
  "showScrollCue": true
}/*EDITMODE-END*/;

function escapeHTML(s){ return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function applyTweaks(t){
  const h1 = document.querySelector('.hero h1');
  if (h1) h1.innerHTML = t.headline.split('|').map(escapeHTML).join('<br />');

  const kicker = document.querySelector('.hero .eyebrow');
  if (kicker) kicker.textContent = t.kicker;

  const cta = document.querySelector('.hero-cta .btn--primary');
  if (cta) cta.innerHTML = escapeHTML(t.ctaLabel) + ' <span class="arr">→</span>';

  const grid = document.querySelector('#problem .grid-bg');
  if (grid) grid.style.display = t.showGrid ? '' : 'none';

  const cue = document.querySelector('.scrollcue');
  if (cue) cue.style.display = t.showScrollCue ? '' : 'none';

  window.CYCLOPS = window.CYCLOPS || {};
  window.CYCLOPS.motion = !!t.animate;
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="Hero copy" />
      <TweakText label="Kicker" value={t.kicker}
        onChange={(v)=>setTweak('kicker', v)} />
      <TweakText label="Headline" value={t.headline}
        placeholder="Use | for a line break"
        onChange={(v)=>setTweak('headline', v)} />
      <TweakText label="Primary button" value={t.ctaLabel}
        onChange={(v)=>setTweak('ctaLabel', v)} />

      <TweakSection label="Motion & detail" />
      <TweakToggle label="Animation" value={t.animate}
        onChange={(v)=>setTweak('animate', v)} />
      <TweakToggle label="Grid backdrop" value={t.showGrid}
        onChange={(v)=>setTweak('showGrid', v)} />
      <TweakToggle label="Scroll cue" value={t.showScrollCue}
        onChange={(v)=>setTweak('showScrollCue', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);
