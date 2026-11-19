interface IconProps {
  className?: string;
}

export function CustomerUserIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M5.5 19.5C5.5 16.4624 8.41015 14 12 14C15.5899 14 18.5 16.4624 18.5 19.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SupplierTruckIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 6.5C3 5.67157 3.67157 5 4.5 5H14.5C15.3284 5 16 5.67157 16 6.5V15.5H3V6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16 9H19.2C19.65 9 20.07 9.24 20.3 9.63L21.7 12.05C21.9 12.39 22 12.78 22 13.17V15.5H16V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="17.5" r="2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18.5" cy="17.5" r="2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function GuideBookIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.75 9.25C9.75 8.00736 10.7574 7 12 7C13.2426 7 14.25 8.00736 14.25 9.25C14.25 10.27 13.57 11.13 12.63 11.41C12.24 11.53 12 11.89 12 12.3V13.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function PrivacyEyeIcon({
  masked,
  className = 'w-5 h-5',
}: IconProps & { masked: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2.5 12C4.6 7.8 8.05 5.75 12 5.75C15.95 5.75 19.4 7.8 21.5 12C19.4 16.2 15.95 18.25 12 18.25C8.05 18.25 4.6 16.2 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.8" />
      {masked && (
        <path
          d="M4.5 19.5L19.5 4.5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function SyncSwitchIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M17.5 8.5C16.2 6.6 14.2 5.5 11.9 5.5C8.5 5.5 5.7 8 5.2 11.3"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M15 8.8H18.2V5.6"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 15.5C7.8 17.4 9.8 18.5 12.1 18.5C15.5 18.5 18.3 16 18.8 12.7"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M9 15.2H5.8V18.4"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CollectionBellIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 15.5V10.5C18 7.18629 15.3137 4.5 12 4.5C8.68629 4.5 6 7.18629 6 10.5V15.5L4.3 17.2C4.05 17.45 4.23 17.88 4.58 17.88H19.42C19.77 17.88 19.95 17.45 19.7 17.2L18 15.5Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.5C10.35 19.45 11.1 20 12 20C12.9 20 13.65 19.45 14 18.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <circle cx="17.5" cy="6.5" r="2.2" fill="#C2410C" />
    </svg>
  );
}

export function ReportsChartIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="4"
        width="17"
        height="16"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.85"
      />
      <path
        d="M8.5 15.5V12M12 15.5V9M15.5 15.5V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FilterSlidersIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 8H20M4 16H20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="9" cy="8" r="2.3" fill="#EEF2FF" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="15" cy="16" r="2.3" fill="#EEF2FF" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

export function PdfDocIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.5 3.5H14.2L18.5 7.8V19C18.5 19.83 17.83 20.5 17 20.5H6.5C5.67 20.5 5 19.83 5 19V5C5 4.17 5.67 3.5 6.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8H18.5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <rect x="7.3" y="12.2" width="9.4" height="5" rx="1.2" fill="currentColor" />
      <text
        x="12"
        y="15.9"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="4.1"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

export function NavDebtsBookIcon({
  active,
  className = 'w-6 h-6',
}: IconProps & { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 6.2C4.5 5.4 5.15 4.8 5.95 4.9L11.5 5.7V19L5.7 18.1C5 18 4.5 17.4 4.5 16.7V6.2Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 6.2C19.5 5.4 18.85 4.8 18.05 4.9L12.5 5.7V19L18.3 18.1C19 18 19.5 17.4 19.5 16.7V6.2Z"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? '0.82' : '1'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavCashbookWalletIcon({
  active,
  className = 'w-6 h-6',
}: IconProps & { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 8.5C4 7.12 5.12 6 6.5 6H17.5C18.88 6 20 7.12 20 8.5V17.5C20 18.88 18.88 20 17.5 20H6.5C5.12 20 4 18.88 4 17.5V8.5Z"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? '0.16' : '1'}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M6.5 6L15.5 3.8C16.4 3.58 17.3 4.26 17.3 5.19V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="14.5" y="11.2" width="5.5" height="3.8" rx="1.2" fill={active ? 'currentColor' : '#FFFFFF'} stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.4" cy="13.1" r="0.8" fill={active ? '#FFFFFF' : 'currentColor'} />
    </svg>
  );
}

export function NavMoreGridIcon({
  active,
  className = 'w-6 h-6',
}: IconProps & { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="4.5"
        y="4.5"
        width="6"
        height="6"
        rx="1.6"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13.5"
        y="4.5"
        width="6"
        height="6"
        rx="1.6"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="4.5"
        y="13.5"
        width="6"
        height="6"
        rx="1.6"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13.5"
        y="13.5"
        width="6"
        height="6"
        rx="1.6"
        fill={active ? '#C2410C' : 'none'}
        stroke={active ? '#C2410C' : 'currentColor'}
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.25C7.17 3.25 3.25 7.17 3.25 12C3.25 13.71 3.74 15.3 4.59 16.65L3.45 20.55L7.48 19.44C8.8 20.22 10.35 20.75 12 20.75C16.83 20.75 20.75 16.83 20.75 12C20.75 7.17 16.83 3.25 12 3.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.35 8.75C9.15 8.32 8.92 8.3 8.68 8.3C8.45 8.3 8.12 8.35 7.85 8.65C7.58 8.95 7 9.5 7 10.65C7 11.8 7.82 12.92 7.95 13.1C8.08 13.28 9.55 15.65 11.92 16.58C13.9 17.36 14.3 17.21 14.74 17.16C15.18 17.11 16.16 16.56 16.36 16C16.56 15.44 16.56 14.96 16.5 14.85C16.43 14.74 16.25 14.68 15.98 14.54C15.71 14.4 14.4 13.76 14.15 13.67C13.9 13.58 13.72 13.54 13.54 13.81C13.36 14.08 12.85 14.68 12.7 14.85C12.55 15.02 12.4 15.04 12.13 14.91C11.86 14.77 10.99 14.49 9.96 13.57C9.16 12.86 8.62 11.98 8.47 11.71C8.32 11.44 8.45 11.3 8.59 11.16C8.72 11.03 8.87 10.83 9.01 10.67C9.15 10.51 9.19 10.39 9.28 10.2C9.37 10.01 9.33 9.85 9.26 9.71C9.19 9.57 8.66 8.27 9.35 8.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

