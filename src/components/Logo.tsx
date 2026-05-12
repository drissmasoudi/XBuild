import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const isSmall = size === "sm";

  return (
    <Link to="/" className={`logo ${isSmall ? "logo-sm" : ""}`} aria-label="XBuild">
      <img
        src={logoImg}
        alt="XBuild"
        className="logo-mark"
        width={isSmall ? 56 : 80}
        height={isSmall ? 40 : 58}
        style={{ objectFit: "contain" }}
      />
      <span className="logo-wordmark">XBuild</span>
    </Link>
  );
}
