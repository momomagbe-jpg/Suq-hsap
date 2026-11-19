interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="شعار خزنة البركة"
    >
      {/* Rounded Indigo Ledger Cover */}
      <rect x="4" y="4" width="36" height="36" rx="10" fill="#3730A3" />
      {/* Book Spine Accent */}
      <rect x="31" y="4" width="5" height="36" rx="2" fill="#312E81" />
      {/* Inner Ivory Ledger Sheet */}
      <rect x="9" y="9" width="21" height="26" rx="4" fill="#F8F7F4" />
      {/* Ledger Ruled Lines */}
      <path
        d="M13 15.5H25.5M13 20.5H23M13 25.5H20"
        stroke="#3730A3"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      {/* Warm Copper Coin / Vault Emblem */}
      <circle cx="29" cy="29" r="8.5" fill="#C2410C" stroke="#F8F7F4" strokeWidth="2" />
      <path
        d="M29 24.8V33.2M26.8 27.3C26.8 26.2 27.8 25.5 29 25.5C30.2 25.5 31.1 26.1 31.1 27C31.1 28.6 26.9 28.4 26.9 30.2C26.9 31.2 27.8 31.8 29 31.8C30.2 31.8 31.2 31.1 31.2 30.1"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
