import { useEffect, useRef, useState } from "preact/hooks";

interface Meteor {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  angle: number;
  tailLength: number;
  opacity: number;
}

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
}

export default function MeteorAnimation() {
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: globalThis.innerWidth,
          height: globalThis.innerHeight,
        });
      }
    };

    updateDimensions();
    globalThis.addEventListener("resize", updateDimensions);
    return () => globalThis.removeEventListener("resize", updateDimensions);
  }, []);

  const createMeteor = (id: number): Meteor => ({
    id,
    top: Math.random() * -10,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 5 + 6,
    delay: Math.random() * 5,
    angle: Math.random() * 10 + 40,
    tailLength: Math.random() * 20 + 10,
    opacity: Math.random() * 0.4 + 0.5,
  });

  const createStar = (id: number): Star => ({
    id,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    animationDuration: Math.random() * 8 + 4,
    animationDelay: Math.random() * 10,
  });

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initialMeteors = Array.from({ length: 12 }, (_, i) => createMeteor(i));
    setMeteors(initialMeteors);

    const initialStars = Array.from({ length: 100 }, (_, i) => createStar(i));
    setStars(initialStars);

    const meteorInterval = setInterval(() => {
      setMeteors((prev) => {
        const newMeteor = createMeteor(Date.now());
        return [...prev.slice(-11), newMeteor];
      });
    }, 3000);

    const starInterval = setInterval(() => {
      setStars((prev) => {
        const starsToReplace = Math.floor(prev.length * 0.1);
        const newStars = [...prev];
        for (let i = 0; i < starsToReplace; i++) {
          const randomIndex = Math.floor(Math.random() * prev.length);
          newStars[randomIndex] = createStar(Date.now() + i);
        }
        return newStars;
      });
    }, 5000);

    return () => {
      clearInterval(meteorInterval);
      clearInterval(starInterval);
    };
  }, [dimensions]);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-amber-100 star-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.animationDuration}s`,
              animationDelay: `${star.animationDelay}s`,
            }}
          />
        ))}

        {meteors.map((meteor) => (
          <div
            key={meteor.id}
            className="absolute"
            style={{
              top: `${meteor.top}%`,
              left: `${meteor.left}%`,
              "--fall-duration": `${meteor.duration}s`,
              "--fall-delay": `${meteor.delay}s`,
              "--meteor-angle": `${meteor.angle}deg`,
              "--meteor-opacity": meteor.opacity,
              "--end-x": `${
                dimensions.width * 0.6 * (Math.random() * 0.4 + 0.8)
              }px`,
              "--end-y": `${dimensions.height * 1.2}px`,
            } as Record<string, string | number>}
          >
            <div
              className="meteor-particle"
              style={{
                width: `${meteor.size}px`,
                height: `${meteor.size}px`,
              }}
            >
              <div
                className="absolute bg-gradient-to-t from-transparent via-amber-300/50 to-amber-200/70"
                style={{
                  width: `${meteor.size * 0.8}px`,
                  height: `${meteor.tailLength}px`,
                  transform: `translateY(${meteor.size / 2}px) rotate(${
                    180 - meteor.angle
                  }deg)`,
                  transformOrigin: "top center",
                  opacity: meteor.opacity * 0.8,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10">
        </div>

        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-24 md:h-32"
          aria-hidden="true"
        >
          <path
            d="M0,0 L50,18 L100,10 L150,25 L200,15 L250,30 L300,20 L350,18 L400,30 L450,15 L500,25 L550,10 L600,20 L650,30 L700,15 L750,25 L800,10 L850,30 L900,15 L950,25 L1000,5 L1050,20 L1100,10 L1150,25 L1200,0 L1200,120 L0,120 Z"
            fill="#292524"
            className="prehistoric-terrain"
          />
          <path
            d="M0,40 L50,35 L100,45 L150,35 L200,50 L250,40 L300,45 L350,35 L400,50 L450,40 L500,45 L550,35 L600,50 L650,40 L700,45 L750,35 L800,50 L850,40 L900,45 L950,35 L1000,50 L1050,40 L1100,45 L1150,35 L1200,40 L1200,120 L0,120 Z"
            fill="#422006"
            className="prehistoric-terrain"
          />
          <path
            d="M0,60 L50,65 L100,55 L150,70 L200,60 L250,65 L300,55 L350,70 L400,60 L450,65 L500,55 L550,70 L600,60 L650,65 L700,55 L750,70 L800,60 L850,65 L900,55 L950,70 L1000,60 L1050,65 L1100,55 L1150,70 L1200,60 L1200,120 L0,120 Z"
            fill="#713f12"
            className="prehistoric-terrain"
          />
          <path
            d="M0,80 L50,75 L100,85 L150,75 L200,90 L250,80 L300,85 L350,75 L400,90 L450,80 L500,85 L550,75 L600,90 L650,80 L700,85 L750,75 L800,90 L850,80 L900,85 L950,75 L1000,90 L1050,80 L1100,85 L1150,75 L1200,80 L1200,120 L0,120 Z"
            fill="#854d0e"
            className="prehistoric-terrain"
          />
        </svg>

        <div className="absolute bottom-0 left-0 right-0 h-16 z-20 footprints-overlay">
        </div>
      </div>
    </>
  );
}
