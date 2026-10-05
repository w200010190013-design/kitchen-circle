import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import Navbar from './components/Navbar'
import AboutSection from './components/AboutSection'
import FeaturesSection from './components/FeaturesSection'
import ReserveSection from './components/ReserveSection'
import MentorSection from './components/MentorSection'
import { VARIANT, logVisit } from './lib/sheet'

// Both sign-ups happen on this page and post to the team-only sheet.
const RESERVE_URL = '#reserve'
const MENTOR_URL = '#mentor'
const RUSU_FREE_FOOD = 'https://www.rmit.edu.au/students/student-life/events/annual/rusu-free-food-on-campus'

// two framings tested against each other (D2): every visitor sees one, chosen at random
const HEADLINE = { A: 'Free meals,', B: 'A taste of home,' } as const

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(prefersReducedMotion)

  // the page is rendered by script, so jump to #section links once the sections exist
  useEffect(() => {
    logVisit()
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
  }, [])

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    // the label follows the video's own play/pause events
    if (video.paused) void video.play()
    else video.pause()
  }

  return (
    <>
      <main>
        {/* SECTION 1: HERO */}
        <section className="relative mb-[-25px] h-screen overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="media/hero.mp4"
            poster="media/hero-poster.jpg"
            autoPlay={!paused}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/20" />

          <Navbar reserveUrl={RESERVE_URL} />

          <button
            type="button"
            onClick={toggleVideo}
            aria-label={paused ? 'Play background animation' : 'Pause background animation'}
            className="absolute right-4 top-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:right-6"
          >
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>

          <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-12 text-center md:pb-16">
            <h1 className="text-5xl font-normal leading-[1.1] tracking-tight text-white sm:text-7xl sm:leading-[1.1] md:text-8xl md:leading-[1.1] lg:text-[96px]">
              <span className="block">{HEADLINE[VARIANT]}</span>
              <span className="block">
                cooked{' '}
                <em className="not-italic" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
                  together
                </em>
              </span>
            </h1>
            <p className="mt-6 max-w-[420px] text-sm font-medium text-white/80 md:text-base">
              Kitchen Circle is a free weekly cook-together for international students new to RMIT, led by a senior
              student from home. Pilot planned for October 2026.
            </p>
            <div className="mt-8 flex items-center gap-4 rounded-xl bg-black/25 py-1 pl-6 pr-1 backdrop-blur-md">
              <span className="hidden text-sm font-medium text-white sm:inline">
                No queue. No proof of need. Just Tuesday dinner, cooked together.
              </span>
              <span className="whitespace-nowrap text-sm font-medium text-white sm:hidden">Free. No queue.</span>
              <a
                href={RESERVE_URL}
                className="whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
              >
                Reserve my free seat
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 2: ABOUT */}
        <AboutSection reserveUrl={RESERVE_URL} mentorUrl={MENTOR_URL} />

        {/* SECTION 3: FEATURES */}
        <FeaturesSection reserveUrl={RESERVE_URL} />

        {/* RESERVE: three-step sign-up, posts to the team-only sheet */}
        <ReserveSection />

        {/* MENTOR: senior students sign up, same sheet */}
        <MentorSection />
      </main>

      {/* honesty note: same wording as the original prototype page */}
      <footer className="relative z-10 border-t border-[#D9C4AA] bg-[#F6E4CF] px-6 py-10 text-[#321C04]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm leading-relaxed md:flex-row md:justify-between">
          <p className="max-w-2xl">
            <strong className="font-semibold">Kitchen Circle is a student prototype</strong> built for BUSM4550
            Innovation Management at RMIT University, Semester 2 2026. It is not an official RMIT or RUSU service, and
            the pilot is planned for October 2026, subject to kitchen and food-safety approval.
          </p>
          <div className="flex shrink-0 flex-col gap-2">
            <a className="underline decoration-[#D9C4AA] underline-offset-4 hover:decoration-current" href={RESERVE_URL}>
              Reserve a seat
            </a>
            <a className="underline decoration-[#D9C4AA] underline-offset-4 hover:decoration-current" href={MENTOR_URL}>
              Become a mentor
            </a>
            <a className="underline decoration-[#D9C4AA] underline-offset-4 hover:decoration-current" href={RUSU_FREE_FOOD}>
              Need food today? RUSU free food on campus
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
