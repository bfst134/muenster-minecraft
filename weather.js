// Echtes Wetter in Münster (Open-Meteo, kostenlos, ohne Schlüssel) und Pixel-Regen/-Schnee über der Karte.

// WMO-Wettercodes → Text und Effekt
export function describeWeather(code) {
  const table = [
    [[0], "Klar", null],
    [[1], "Überwiegend klar", null],
    [[2], "Teilweise bewölkt", null],
    [[3], "Bedeckt", null],
    [[45, 48], "Nebel", "fog"],
    [[51, 53, 55], "Nieselregen", "drizzle"],
    [[56, 57], "Gefrierender Niesel", "drizzle"],
    [[61, 63], "Regen", "rain"],
    [[65], "Starker Regen", "storm-rain"],
    [[66, 67], "Gefrierender Regen", "rain"],
    [[71, 73, 77], "Schnee", "snow"],
    [[75], "Starker Schnee", "snow"],
    [[80, 81], "Regenschauer", "rain"],
    [[82], "Heftige Schauer", "storm-rain"],
    [[85, 86], "Schneeschauer", "snow"],
    [[95], "Gewitter", "storm"],
    [[96, 99], "Gewitter mit Hagel", "storm"],
  ];
  const hit = table.find(([codes]) => codes.includes(code));
  return hit ? { label: hit[1], fx: hit[2] } : { label: "Unbekannt", fx: null };
}

export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,weather_code`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wetter: HTTP ${res.status}`);
  const { current } = await res.json();
  return { code: current.weather_code, temp: current.temperature_2m };
}

// Effekte auf einer Canvas, absichtlich grob gerastert (1 Pixel = PX CSS-Pixel)
const PX = 3;
export class WeatherFx {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.fx = null;
    this.particles = [];
    this.flash = 0;
    this.nextFlash = 0;
    this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.frame = this.frame.bind(this);
    new ResizeObserver(() => this.resize()).observe(canvas);
    document.addEventListener("visibilitychange", () => this.schedule());
  }

  resize() {
    this.w = Math.max(1, Math.round(this.canvas.clientWidth / PX));
    this.h = Math.max(1, Math.round(this.canvas.clientHeight / PX));
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.spawn();
    // Größe setzen leert die Canvas; stehende Effekte wie Nebel neu zeichnen
    this.schedule();
  }

  set(fx) {
    if (fx === this.fx) return;
    this.fx = fx;
    this.canvas.hidden = !fx;
    this.resize();
    this.schedule();
  }

  spawn() {
    const density = { drizzle: 0.004, rain: 0.01, "storm-rain": 0.02, storm: 0.02, snow: 0.012 }[this.fx] ?? 0;
    const n = this.reduced ? 0 : Math.round(this.w * this.h * density);
    this.particles = Array.from({ length: n }, () => this.particle(true));
  }

  particle(anywhere) {
    const snow = this.fx === "snow";
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : -4,
      v: snow ? 0.15 + Math.random() * 0.25 : 1.6 + Math.random() * 1.2,
      // Schneeflocken 1×1 oder 2×2 Pixel, Regentropfen 1 Pixel breit und 2–4 lang
      size: snow ? 1 + Math.floor(Math.random() * 2) : 1,
      len: snow ? 1 : 2 + Math.floor(Math.random() * 3),
      drift: snow ? (Math.random() - 0.5) * 0.3 : 0.25,
    };
  }

  schedule() {
    if (this.raf || !this.fx || document.hidden) return;
    this.raf = requestAnimationFrame(this.frame);
  }

  frame(t) {
    this.raf = null;
    const { ctx, w, h, fx } = this;
    ctx.clearRect(0, 0, w, h);
    if (fx === "fog") {
      ctx.fillStyle = "rgba(210, 215, 220, 0.35)";
      ctx.fillRect(0, 0, w, h);
      return; // Nebel steht still
    }
    const snow = fx === "snow";
    ctx.fillStyle = snow ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 150, 235, 0.75)";
    for (const p of this.particles) {
      p.y += p.v;
      p.x += p.drift;
      if (p.y > h || p.x > w || p.x < -2) Object.assign(p, this.particle(false));
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, snow ? p.size : p.len);
    }
    // Gewitter: ab und zu ein Blitz
    if (fx === "storm" && !this.reduced) {
      if (t > this.nextFlash) { this.flash = 1; this.nextFlash = t + 6000 + Math.random() * 12000; }
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.flash * 0.6})`;
        ctx.fillRect(0, 0, w, h);
        this.flash -= 0.08;
      }
    }
    if (this.particles.length || fx === "storm") this.schedule();
  }
}
