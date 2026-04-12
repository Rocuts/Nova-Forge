interface IconProps {
  size?: number
  className?: string
}

/** Sovereign AI — Shield with internal node network: sovereign perimeter protecting intelligence */
export function IconSovereign({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L3 7v6c0 5.25 3.85 10.15 9 11 5.15-.85 9-5.75 9-11V7l-9-5z" />
      <line x1="8" y1="10" x2="12" y2="14" />
      <line x1="12" y1="14" x2="16" y2="10" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Agentic Cybersecurity — Radar sweep with detection nodes */
export function IconShield({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="12" x2="12" y2="3" />
      <line x1="12" y1="12" x2="18" y2="8" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** AI Executive Staff — Human-node with radiating channel connections */
export function IconAssistant({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="7" r="3" />
      <line x1="12" y1="10" x2="12" y2="15" />
      <line x1="12" y1="15" x2="4" y2="19" />
      <line x1="12" y1="15" x2="20" y2="19" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <circle cx="4" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Critical Systems Architecture — Layered stack with redundancy paths */
export function IconSystems({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="5" rx="1" />
      <rect x="4" y="10" width="16" height="5" rx="1" />
      <rect x="4" y="17" width="16" height="4" rx="1" />
      <circle cx="7" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Operational Intelligence — Command center: crosshair with data quadrants */
export function IconIntelligence({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Government Process Automation — Document with flow arrows and checkpoints */
export function IconGovernance({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7l-5-5z" />
      <polyline points="14,2 14,7 19,7" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="13" y2="15" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Cyber Defense Agents — Eye with scanning beam */
export function IconCyber({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <line x1="12" y1="5" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="19" />
    </svg>
  )
}

/** Digital Workforce — Network of connected agent nodes */
export function IconWorkforce({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <line x1="12" y1="7.5" x2="5" y2="15.5" />
      <line x1="12" y1="7.5" x2="19" y2="15.5" />
      <line x1="7.5" y1="18" x2="16.5" y2="18" />
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** On-Premise AI Infrastructure — Server rack with internal data path */
export function IconInfra({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="1" />
      <line x1="5" y1="8" x2="19" y2="8" />
      <line x1="5" y1="14" x2="19" y2="14" />
      <circle cx="8" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="18" r="1" fill="currentColor" stroke="none" />
      <line x1="14" y1="5" x2="16" y2="5" />
      <line x1="14" y1="11" x2="16" y2="11" />
      <line x1="14" y1="18" x2="16" y2="18" />
    </svg>
  )
}
