// The only section with no motion/react in it — the scroll is a pure CSS
// animation (.marquee-track). It has no "use client" of its own so it could run
// on the server, but it is pulled into the client graph by the composer; see the
// note in ../LiveStudioLanding.tsx for why that boundary is not worth splitting.
import type { LiveStudioContent } from "./shared"

type Props = { marqueeLabel: string; marquee: LiveStudioContent["marquee"] }

export function LiveStudioMarquee({ marqueeLabel, marquee }: Props) {
  return (
    <section
      className="bg-[#0a0a0a] border-y border-white/8 py-6 overflow-hidden"
      data-header-theme="dark"
      aria-label={marqueeLabel}
    >
      <div className="marquee-mask">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {marquee.map((entry) => (
                <span
                  key={`${copy}-${entry}`}
                  className="flex items-center font-mono text-[11px] tracking-[0.24em] uppercase text-white/45 px-8"
                >
                  {entry}
                  <span className="ml-8 text-[#fe2c55]/50" aria-hidden="true">
                    &bull;
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
