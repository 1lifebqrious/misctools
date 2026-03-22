import { useEffect, useState } from "react";

const EDGE_PATHS = [
  "M58 124 L116 90",
  "M116 90 L184 129",
  "M58 124 L126 164",
  "M126 164 L184 129",
  "M116 90 L116 24",
  "M184 129 L184 64",
  "M126 164 L126 98",
  "M116 24 L184 64",
  "M116 24 L58 58",
  "M58 58 L58 124",
  "M58 58 L126 98",
  "M126 98 L184 64"
];

function CuboidDemo() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setVisibleCount((current) => (current >= EDGE_PATHS.length ? 1 : current + 1));
    }, 520);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="cuboid-demo" aria-hidden="true">
      <svg viewBox="0 0 242 188" role="presentation">
        <defs>
          <pattern
            id="cuboid-grid"
            width="16"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.6" fill="rgba(75, 96, 115, 0.4)" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="242" height="188" rx="18" fill="url(#cuboid-grid)" />
        {EDGE_PATHS.map((path, index) => (
          <path
            key={path}
            d={path}
            className={index < visibleCount ? "cuboid-edge visible" : "cuboid-edge"}
          />
        ))}
      </svg>
    </div>
  );
}

export default CuboidDemo;
