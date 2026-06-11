import { useEffect, useRef } from "react";

const STATS = [
  { value: "234", label: "Countries" },
  { value: "3,059", label: "Indicators" },
  { value: "3", label: "Ways to explore" },
];

function Hero({ onGetStarted }) {
  const crossLayer = useRef(null);

  useEffect(() => {
    const layer = crossLayer.current;
    if (!layer) return;

    const crosses = [];
    for (let i = 0; i < 14; i++) {
      const c = document.createElement("span");
      const size = 8 + Math.random() * 14;
      c.textContent = "+";
      c.className = "hero-cross";
      c.style.left = `${Math.random() * 100}%`;
      c.style.fontSize = `${size}px`;
      c.style.animationDuration = `${6 + Math.random() * 6}s`;
      c.style.animationDelay = `${Math.random() * 6}s`;
      layer.appendChild(c);
      crosses.push(c);
    }

    return () => crosses.forEach((c) => c.remove());
  }, []);

  return (
    <section className="hero">
      <div className="hero-banner">
        <div className="hero-cross-layer" ref={crossLayer} aria-hidden="true" />
        <div className="hero-content">
          <span className="hero-badge">Powered by WHO data</span>
          <h1 className="hero-title">Explore global health, country by country</h1>
          <p className="hero-subtitle">
            Life expectancy, immunization, and disease burden across 234 countries
            and 3,000+ indicators — all in one place.
          </p>
          {onGetStarted && (
            <button className="hero-cta" onClick={onGetStarted}>
              Get started →
            </button>
          )}
        </div>
      </div>

      <div className="hero-stats">
        {STATS.map(({ value, label }) => (
          <div className="hero-stat" key={label}>
            <div className="hero-stat-value">{value}</div>
            <div className="hero-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Hero;