export default function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <picture>
        <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
        <img
          src="/logo-light.svg"
          alt="FETRAF"
          className="h-10 w-auto max-w-[180px] select-none"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/favicon.ico"; }}
        />
      </picture>
    </div>
  );
}