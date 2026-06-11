import { useEffect, useState, useRef } from "react";

function StatCard({ title, value, unit, year, country, index = 0 }) {
  const hasValue = value !== null && value !== undefined && !isNaN(value);
  const target = hasValue ? Number(value) : 0;

  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!hasValue) return;

    const duration = 900;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, hasValue]);

  return (
    <div
      className="stat-card stat-card-animate"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <p className="stat-label">{title}</p>
      <p className="stat-value">
        {hasValue ? display.toFixed(1) : "—"}
        {unit && <span className="stat-unit"> {unit}</span>}
      </p>
      {(country || year) && (
        <p className="stat-meta">
          {[country, year].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

export default StatCard;