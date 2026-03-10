export default function JesseIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Antenna */}
      <line x1="24" y1="4" x2="24" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="3" r="2.5" fill="currentColor" opacity="0.5" />

      {/* Head */}
      <rect x="8" y="10" width="32" height="24" rx="6" stroke="currentColor" strokeWidth="2.2" />

      {/* Eyes */}
      <circle cx="18" cy="22" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="22" r="1.5" fill="currentColor" />
      <circle cx="30" cy="22" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="30" cy="22" r="1.5" fill="currentColor" />

      {/* Mouth - friendly smile */}
      <path d="M17 29 C17 29 20 32 24 32 C28 32 31 29 31 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Ears / side panels */}
      <rect x="2" y="18" width="5" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="41" y="18" width="5" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />

      {/* Neck */}
      <line x1="20" y1="34" x2="20" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="34" x2="28" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Body base */}
      <rect x="12" y="38" width="24" height="6" rx="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
