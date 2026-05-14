import { useCallback, useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  const done = useCallback(onDone, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"),  1400);
    const t3 = setTimeout(() => done(),            1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [done]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      <div className="splash-content">
        <img src={logoImg} alt="XBuild" className="splash-logo" />
      </div>
    </div>
  );
}
