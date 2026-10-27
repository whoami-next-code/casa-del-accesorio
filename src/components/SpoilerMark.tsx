export default function SpoilerMark() {
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden>
      <rect width="320" height="180" fill="#101318" />
      <path d="M36 132h248" stroke="#2A3140" strokeWidth="1.5" />
      <rect x="52" y="74" width="216" height="14" fill="#1B1F26" />
      <rect x="52" y="68" width="216" height="6" fill="#F10600" />
      <rect x="70" y="88" width="12" height="28" fill="#007BFF" />
      <rect x="238" y="88" width="12" height="28" fill="#007BFF" />
      <text x="160" y="158" textAnchor="middle" fill="#B8BEC8" fontSize="11" fontFamily="Rubik, sans-serif">
        Foto del alerón pendiente
      </text>
    </svg>
  );
}
