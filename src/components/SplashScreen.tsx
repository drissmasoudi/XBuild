import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // fade in → hold → fade out
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"),  1400);
    const t3 = setTimeout(() => onDone(),          1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      <div className="splash-content">
        <img src={logoImg} alt="XBuild" className="splash-logo" />
        <span className="splash-wordmark">XBuild</span>
      </div>
    </div>
  );
}
