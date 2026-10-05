import { Mail, Plus } from 'lucide-react'

type LogoProps = {
  color?: string
  size?: number
}

/** Kitchen Circle mark: a bowl with steam inside a circle. */
export function Logo({ color = '#321C04', size = 40 }: LogoProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2.5" />
      <path d="M9 17c0-3 3-5 7-5s7 2 7 5v2H9z" fill={color} />
      <path d="M12 10c0-2 1.5-3 2-4M17 10c0-2 1.5-3 2-4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

type AboutSectionProps = {
  reserveUrl: string
  mentorUrl: string
}

export default function AboutSection({ reserveUrl, mentorUrl }: AboutSectionProps) {
  return (
    <section id="about" className="relative z-10 rounded-t-[25px] bg-[#F6E4CF] px-6 py-20 md:py-32">
      {/* top area */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <p className="max-w-lg text-center text-base leading-relaxed text-[#321C04] md:text-lg md:leading-relaxed">
          A cooking club, not a charity. Made by international students for the ones who have just arrived, so the
          first months in Melbourne feel a little more like home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={reserveUrl}
            className="inline-flex items-center gap-3 rounded-full bg-[#321C04] py-1.5 pl-1.5 pr-5 text-sm font-medium uppercase tracking-wide text-[#FFF9F2] transition-colors hover:bg-[#1F1003]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF9F2] text-[#321C04]">
              <Mail size={16} aria-hidden="true" />
            </span>
            Reserve my seat
          </a>
          <a
            href={mentorUrl}
            className="inline-flex items-center gap-3 rounded-full bg-[#D9C4AA] py-1.5 pl-1.5 pr-5 text-sm font-medium uppercase tracking-wide text-[#321C04] transition-colors hover:bg-[#CEBA9E]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF9F2] text-[#321C04]">
              <Plus size={16} aria-hidden="true" />
            </span>
            Become a mentor
          </a>
        </div>
      </div>

      {/* decorative divider */}
      <div className="mt-16 flex w-full items-center gap-[2px] md:mt-24" aria-hidden="true">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#D9C4AA]" />
        <span className="h-[2px] flex-1 bg-[#D9C4AA]" />
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#D9C4AA]" />
      </div>

      {/* bottom area */}
      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-10 md:mt-24 md:flex-row md:gap-24">
        <div className="flex shrink-0 items-start gap-3">
          <Logo />
          <span className="pt-1 text-xs font-semibold uppercase tracking-widest text-[#321C04]">
            Cook
            <br />
            Together
          </span>
        </div>
        <p className="text-2xl font-normal leading-[1.3] text-[#321C04] sm:text-3xl sm:leading-[1.3] md:text-4xl md:leading-[1.3] lg:text-[42px]">
          From October 2026, if the pilot is approved, up to sixteen new arrivals will cook each Tuesday evening with a
          senior student from their part of the world. Everyone learns one ten-minute skill, shares the table and takes
          three to four labelled boxes home. Nobody asks about visas, income or work hours. We carry the planning, so
          you can carry the leftovers.
        </p>
      </div>
    </section>
  )
}
