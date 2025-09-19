// src/components/Brand.tsx
import Image from "next/image";

export default function Brand({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logos/fetraf-logo.svg"  // ajuste o caminho se for outro
        alt="FETRAF"
        width={160}
        height={40}
        priority
        className="h-10 w-auto max-w-[180px] select-none"
      />
      <span className="sr-only">FETRAF</span>
    </div>
  );
}
