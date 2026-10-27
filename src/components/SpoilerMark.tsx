export default function SpoilerMark() {
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden>
      <rect width="320" height="180" fill="#E4E9DF" />
      <path d="M36 132h248" stroke="#D5DDD0" strokeWidth="1.5" />
      <rect x="52" y="74" width="216" height="14" fill="#eceef2" />
      <rect x="52" y="68" width="216" height="6" fill="#0F172A" />
      <rect x="70" y="88" width="12" height="28" fill="#eceef2" />
      <rect x="238" y="88" width="12" height="28" fill="#eceef2" />
      <text x="160" y="158" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Rubik, sans-serif">
        Foto del alerón pendiente
      </text>
    </svg>
  );
}
