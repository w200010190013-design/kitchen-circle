import { useEffect, useRef, useState } from 'react'
import { Logo } from './AboutSection'

type Feature = {
  id: string
  title: string
  description: string
  image: string
  alt: string
}

// "Meet Yu": the six-frame storyboard of the planned pilot (MVP 1), drawn by the team (portfolio Figure 13).
const FEATURES: Feature[] = [
  {
    id: 'day11',
    title: 'Day 11, the budget is gone',
    description:
      'Day 11 of the fortnight. Yu’s food budget is gone and dinner is instant noodles again. Free food exists, but only in a daytime queue.',
    image: 'media/story-day11.svg',
    alt: 'Drawing of Yu at a desk in the evening: the phone shows 14 dollars left, a cup of instant noodles, a calendar with day 11 circled.',
  },
  {
    id: 'post',
    title: 'A post in the group chat',
    description:
      'In the RMIT international students group: ‘Cook together Tuesday, eat all week. Free.’ A cooking club, not a charity.',
    image: 'media/story-post.svg',
    alt: 'Drawing of a hand holding a phone; the group chat message reads Cook together Tuesday, eat all week. Free.',
  },
  {
    id: 'reserve',
    title: 'A seat in thirty seconds',
    description:
      'Five short questions, none about money, visas or work hours. If the pilot goes ahead, the seat is confirmed by message on the Sunday before.',
    image: 'media/story-reserve.svg',
    alt: 'Drawing of a phone form with a Reserve my free seat button and a stopwatch at thirty seconds.',
  },
  {
    id: 'kitchen',
    title: 'Tuesday, 6 pm',
    description:
      'Eight students, a senior student from home as mentor, rescued veg and spices from home. One skill in ten minutes, then everyone cooks at a station of four.',
    image: 'media/story-kitchen.svg',
    alt: 'Drawing of a campus kitchen at 6 pm: a mentor points at a chopping board while students in aprons cook.',
  },
  {
    id: 'boxes',
    title: 'Four boxes to take home',
    description: 'Yu leaves with four labelled boxes and two new friends on WeChat. Lunch is sorted until Friday.',
    image: 'media/story-boxes.svg',
    alt: 'Drawing of Yu at the kitchen door holding a tote with four labelled take-home boxes.',
  },
  {
    id: 'week6',
    title: 'Week 6, Yu co-hosts',
    description: 'Yu co-hosts a circle and sends the menu to someone who arrived last week.',
    image: 'media/story-week6.svg',
    alt: 'Drawing of the kitchen in week 6: Yu, in a host apron beside the mentor, hands a recipe card to a newcomer.',
  },
]

type FeaturesSectionProps = {
  reserveUrl: string
}

export default function FeaturesSection({ reserveUrl }: FeaturesSectionProps) {
  const [active, setActive] = useState(0)
  const [revealed, setRevealed] = useState<boolean[]>(() => FEATURES.map(() => false))
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const cards = cardRefs.current.filter((el): el is HTMLElement => el !== null)
    const indexOf = (el: Element) => Number((el as HTMLElement).dataset.index)

    // which card is in view: highlights the matching button on the left
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) setActive(indexOf(entry.target))
        })
      },
      { threshold: 0.6 },
    )

    // slide each card in once; it stays visible afterwards
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const i = indexOf(entry.target)
          setRevealed((prev) => (prev[i] ? prev : prev.map((v, k) => (k === i ? true : v))))
          revealObserver.unobserve(entry.target)
        })
      },
      { threshold: 0.15 },
    )

    cards.forEach((card) => {
      activeObserver.observe(card)
      revealObserver.observe(card)
    })
    return () => {
      activeObserver.disconnect()
      revealObserver.disconnect()
    }
  }, [])

  const scrollToCard = (i: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    cardRefs.current[i]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <section id="features" className="relative px-5 py-20 md:px-10 md:py-40 lg:px-16 lg:py-48">
      {/* fixed background image behind the content */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('media/features-bg.jpg')" }}
      />

      <div className="grid gap-16 lg:grid-cols-[400px_1fr] lg:gap-24 xl:grid-cols-[460px_1fr] xl:gap-48">
        {/* left column: sticky on desktop */}
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:py-32">
          <div>
            <h2 className="text-2xl font-normal leading-[1.2] text-white sm:text-3xl sm:leading-[1.2] lg:text-[46px]">
              Meet Yu, new in Melbourne
            </h2>
            <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-white/70 md:text-base md:leading-relaxed">
              A storyboard for the planned pilot. Yu is an illustrative character, not a real student.
            </p>
          </div>

          <ul className="hidden lg:flex lg:flex-col lg:items-start lg:gap-2" aria-label="Storyboard frames">
            {FEATURES.map((feature, i) => (
              <li key={feature.id}>
                <button
                  type="button"
                  onClick={() => scrollToCard(i)}
                  aria-current={active === i ? 'true' : undefined}
                  className={`rounded-full bg-black/20 px-4 py-1.5 text-left text-sm font-medium transition-colors ${
                    active === i ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {i + 1}. {feature.title}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex lg:items-center lg:gap-4 lg:self-start lg:rounded-xl lg:bg-black/25 lg:py-1 lg:pl-6 lg:pr-1 lg:backdrop-blur-md">
            <span className="text-sm font-medium text-white">No queue. No proof of need. Just Tuesday dinner, cooked together.</span>
            <a
              href={reserveUrl}
              className="whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Reserve my free seat
            </a>
          </div>
        </div>

        {/* right column: cards scroll past */}
        <div className="flex flex-col gap-6 md:gap-10">
          {FEATURES.map((feature, i) => (
            <article
              key={feature.id}
              id={`feature-${feature.id}`}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              data-index={i}
              className={`rounded-3xl bg-black/20 p-6 backdrop-blur-sm transition-all duration-700 ease-out md:p-10 ${
                revealed[i] ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
              }`}
            >
              <Logo color="rgba(255,255,255,0.8)" />
              <h3 className="mt-6 text-xl font-medium text-white md:text-2xl">
                <span className="text-white/50">{i + 1}</span> {feature.title}
              </h3>
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-black/30">
                <div className="h-full w-full bg-[#FFF9F2]">
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    className="h-full w-full animate-slow-drift object-contain p-4 md:p-6"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="mt-6 text-sm font-medium leading-relaxed text-white/60 md:text-base md:leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
