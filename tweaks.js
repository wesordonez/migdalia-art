/* ─────────────────────────────────────────────────────────────
   tweaks.js — vanilla in-page Tweaks panel
   Reads TWEAK_DEFAULTS from index.html, applies them as CSS
   variables, builds a floating panel that lets you adjust them
   live, and persists changes back to disk via the host's
   __edit_mode_set_keys message.
   Safe to leave in for deploy: the panel only shows when the
   editor sends __activate_edit_mode. To strip entirely, remove
   this <script> tag and the inline TWEAK_DEFAULTS block.
   ───────────────────────────────────────────────────────────── */
(() => {
  const root = document.documentElement;
  const T = window.TWEAK_DEFAULTS || {};


  /* ───── shade helper (hex lighten/darken) ───── */
  const shade = (hex, percent) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(/^#/, '#'));
    if (!m) return hex;
    let [r, g, b] = [m[1], m[2], m[3]].map(x => parseInt(x, 16));
    if (percent < 0) {
      const f = 1 + percent / 100;
      r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f);
    } else {
      const f = percent / 100;
      r = Math.round(r + (255 - r) * f);
      g = Math.round(g + (255 - g) * f);
      b = Math.round(b + (255 - b) * f);
    }
    return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
  };


  /* ───── apply a value to the DOM ───── */
  const apply = (key, val) => {
    T[key] = val;
    switch (key) {
      case 'bgColor':
        root.style.setProperty('--pearl', val);
        break;
      case 'accentColor':
        root.style.setProperty('--lilac',      val);
        root.style.setProperty('--lilac-deep', shade(val, -22));
        root.style.setProperty('--lilac-soft', shade(val,  20));
        break;
      case 'inkColor':
        root.style.setProperty('--olive',      val);
        root.style.setProperty('--olive-soft', shade(val, 28));
        break;
      case 'frameWidth':
        root.style.setProperty('--frame', val + 'px');
        break;
    }
  };

  // Apply defaults on load (regardless of edit mode)
  Object.entries(T).forEach(([k, v]) => apply(k, v));


  /* ───── panel styles ───── */
  const css = `
    .tweaks-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 280px;
      background: #fff;
      color: #222;
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: 0 20px 50px -12px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.06);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      z-index: 1000;
      border-radius: 8px;
      overflow: hidden;
      animation: tweaksIn .25s cubic-bezier(.2,.7,.2,1);
    }
    @keyframes tweaksIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }
    .tweaks-panel[hidden] { display: none !important; }
    .tweaks-panel__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px;
      background: #faf9f7;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      cursor: move;
      user-select: none;
    }
    .tweaks-panel__head h3 {
      margin: 0; font-size: 12px; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase; color: #555;
    }
    .tweaks-panel__close {
      width: 22px; height: 22px; border: 0; background: transparent;
      cursor: pointer; font-size: 18px; line-height: 1; color: #888;
      border-radius: 4px;
    }
    .tweaks-panel__close:hover { background: rgba(0,0,0,0.06); color: #222; }
    .tweaks-panel__body { padding: 14px; display: flex; flex-direction: column; gap: 16px; }
    .tw-section { display: flex; flex-direction: column; gap: 8px; }
    .tw-label {
      font-size: 11px; font-weight: 500; color: #666;
      letter-spacing: 0.06em; text-transform: uppercase;
      display: flex; justify-content: space-between; align-items: center;
    }
    .tw-label span { color: #999; font-weight: 400; letter-spacing: 0; text-transform: none; }
    .tw-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
    .tw-swatches button {
      width: 32px; height: 32px; border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.08); cursor: pointer; padding: 0;
      transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
      position: relative;
    }
    .tw-swatches button:hover { transform: scale(1.08); }
    .tw-swatches button.is-active {
      border-color: #222;
      box-shadow: 0 0 0 2px #fff, 0 0 0 3px #222;
    }
    .tw-range {
      -webkit-appearance: none; appearance: none;
      width: 100%; height: 4px; background: #e4e4e4; border-radius: 2px;
      outline: none; margin: 4px 0;
    }
    .tw-range::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 16px; height: 16px; border-radius: 50%;
      background: #222; cursor: pointer; border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .tw-range::-moz-range-thumb {
      width: 16px; height: 16px; border-radius: 50%;
      background: #222; cursor: pointer; border: 2px solid #fff;
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);


  /* ───── swatch palettes ───── */
  const PALETTES = {
    bgColor: [
      ['#ECE6EA', 'grey-lilac'],
      ['#E5DEE4', 'mauve mist'],
      ['#E0DCE6', 'cool stone'],
      ['#F2EBEF', 'soft blush'],
      ['#FCF9D8', 'cream pearl'],
      ['#F4F1E8', 'paper'],
    ],
    accentColor: [
      ['#C99FCD', 'lilac'],
      ['#A87BAE', 'plum'],
      ['#D5B5D9', 'soft lilac'],
      ['#9C7AB8', 'iris'],
      ['#B89AC8', 'wisteria'],
      ['#3D402F', 'olive'],
    ],
    inkColor: [
      ['#3D402F', 'black olive'],
      ['#1F1F2E', 'near black'],
      ['#2A2433', 'aubergine'],
      ['#3A2E4A', 'deep plum'],
    ],
  };


  /* ───── build panel ───── */
  const panel = document.createElement('aside');
  panel.className = 'tweaks-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="tweaks-panel__head">
      <h3>Tweaks</h3>
      <button class="tweaks-panel__close" aria-label="Close tweaks">×</button>
    </header>
    <div class="tweaks-panel__body">
      <section class="tw-section">
        <div class="tw-label">Background</div>
        <div class="tw-swatches" data-key="bgColor"></div>
      </section>
      <section class="tw-section">
        <div class="tw-label">Frame / accent</div>
        <div class="tw-swatches" data-key="accentColor"></div>
      </section>
      <section class="tw-section">
        <div class="tw-label">Text</div>
        <div class="tw-swatches" data-key="inkColor"></div>
      </section>
      <section class="tw-section">
        <div class="tw-label">Frame thickness <span data-display="frameWidth"></span></div>
        <input class="tw-range" type="range" min="6" max="36" step="1" data-key="frameWidth" />
      </section>
    </div>
  `;
  document.body.appendChild(panel);

  // Populate swatches
  panel.querySelectorAll('[data-key]').forEach(group => {
    const key = group.dataset.key;
    const palette = PALETTES[key];
    if (!palette) return;
    palette.forEach(([color, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.background = color;
      btn.dataset.val = color;
      btn.title = label;
      btn.setAttribute('aria-label', `${label} (${color})`);
      if (color.toLowerCase() === (T[key] || '').toLowerCase()) btn.classList.add('is-active');
      btn.addEventListener('click', () => setTweak(key, color));
      group.appendChild(btn);
    });
  });

  // Wire range inputs
  panel.querySelectorAll('input[type=range]').forEach(input => {
    const key = input.dataset.key;
    input.value = T[key];
    const display = panel.querySelector(`[data-display="${key}"]`);
    if (display) display.textContent = T[key] + 'px';
    input.addEventListener('input', () => {
      const v = Number(input.value);
      if (display) display.textContent = v + 'px';
      setTweak(key, v);
    });
  });


  /* ───── set a tweak (apply + persist) ───── */
  const setTweak = (key, val) => {
    apply(key, val);
    // Refresh active swatch state
    const group = panel.querySelector(`[data-key="${key}"]`);
    if (group && typeof val === 'string') {
      group.querySelectorAll('button').forEach(b => {
        b.classList.toggle('is-active', b.dataset.val.toLowerCase() === val.toLowerCase());
      });
    }
    // Persist
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
    } catch (_) { /* no host, no problem */ }
  };


  /* ───── close button ───── */
  panel.querySelector('.tweaks-panel__close').addEventListener('click', () => {
    panel.hidden = true;
    try {
      window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
    } catch (_) {}
  });


  /* ───── drag handle ───── */
  (() => {
    const head = panel.querySelector('.tweaks-panel__head');
    let startX, startY, baseLeft, baseTop, dragging = false;
    head.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      panel.style.left = r.left + 'px';
      panel.style.top  = r.top  + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      startX = e.clientX; startY = e.clientY;
      baseLeft = r.left; baseTop = r.top;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panel.style.left = (baseLeft + e.clientX - startX) + 'px';
      panel.style.top  = (baseTop  + e.clientY - startY) + 'px';
    });
    window.addEventListener('mouseup', () => { dragging = false; });
  })();


  /* ───── host protocol ─────
     Register listener BEFORE announcing availability, per protocol. */
  window.addEventListener('message', (e) => {
    const data = e.data || {};
    if (data.type === '__activate_edit_mode')   panel.hidden = false;
    if (data.type === '__deactivate_edit_mode') panel.hidden = true;
  });

  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (_) {}
})();
